import { getBase58Decoder } from '@solana/codecs-strings';
import {
	type Address,
	address,
	appendTransactionMessageInstruction,
	appendTransactionMessageInstructions,
	type Blockhash,
	type Commitment,
	createTransactionMessage,
	createTransactionPlanExecutor,
	getBase64EncodedWireTransaction,
	isSolanaError,
	isTransactionSendingSigner,
	pipe,
	SOLANA_ERROR__TRANSACTION_ERROR__ALREADY_PROCESSED,
	setTransactionMessageFeePayer,
	setTransactionMessageLifetimeUsingBlockhash,
	signAndSendTransactionMessageWithSigners,
	signature,
	signTransactionMessageWithSigners,
	singleTransactionPlan,
	type TransactionPlan,
	type TransactionSigner,
	type TransactionVersion,
} from '@solana/kit';
import { getTransferSolInstruction } from '@solana-program/system';
import {
	findAssociatedTokenPda,
	getCloseAccountInstruction,
	getCreateAssociatedTokenIdempotentInstruction,
	getSyncNativeInstruction,
	TOKEN_PROGRAM_ADDRESS,
} from '@solana-program/token';

import { lamportsMath } from '../numeric/lamports';
import type { SolanaClientRuntime } from '../rpc/types';
import { createWalletTransactionSigner, isWalletSession, resolveSignerMode } from '../signers/walletTransactionSigner';
import type { WalletSession } from '../wallet/types';
import type { SolTransferSendOptions } from './sol';

/** Wrapped SOL mint address (same on all clusters). */
export const WRAPPED_SOL_MINT = address('So11111111111111111111111111111111111111112');

type BlockhashLifetime = Readonly<{
	blockhash: Blockhash;
	lastValidBlockHeight: bigint;
}>;

type WsolAuthority = TransactionSigner<string> | WalletSession;

type SignableWsolTransactionMessage = Parameters<typeof signTransactionMessageWithSigners>[0];

export type WsolWrapPrepareConfig = Readonly<{
	/** Amount of SOL to wrap (in lamports, SOL string, or number). */
	amount: bigint | number | string;
	/** Authority that signs the transaction (wallet session or raw signer). */
	authority: WsolAuthority;
	/** Commitment level for the transaction. */
	commitment?: Commitment;
	/** Optional existing blockhash lifetime to reuse. */
	lifetime?: BlockhashLifetime;
	/** Owner of the wSOL account. Defaults to authority address. */
	owner?: Address | string;
	/** Transaction version (defaults to 0). */
	transactionVersion?: TransactionVersion;
}>;

export type WsolUnwrapPrepareConfig = Readonly<{
	/** Authority that signs the transaction (wallet session or raw signer). */
	authority: WsolAuthority;
	/** Commitment level for the transaction. */
	commitment?: Commitment;
	/** Optional existing blockhash lifetime to reuse. */
	lifetime?: BlockhashLifetime;
	/** Owner of the wSOL account. Defaults to authority address. */
	owner?: Address | string;
	/** Transaction version (defaults to 0). */
	transactionVersion?: TransactionVersion;
}>;

type PreparedWsolWrap = Readonly<{
	amount: bigint;
	ataAddress: Address;
	commitment?: Commitment;
	lifetime: BlockhashLifetime;
	message: SignableWsolTransactionMessage;
	mode: 'partial' | 'send';
	owner: Address;
	plan?: TransactionPlan;
	signer: TransactionSigner;
}>;

type PreparedWsolUnwrap = Readonly<{
	ataAddress: Address;
	commitment?: Commitment;
	lifetime: BlockhashLifetime;
	message: SignableWsolTransactionMessage;
	mode: 'partial' | 'send';
	owner: Address;
	plan?: TransactionPlan;
	signer: TransactionSigner;
}>;

function ensureAddress(value: Address | string | undefined, fallback?: Address): Address {
	if (value) {
		return typeof value === 'string' ? address(value) : value;
	}
	if (!fallback) {
		throw new Error('An address value was expected but not provided.');
	}
	return fallback;
}

async function resolveLifetime(
	runtime: SolanaClientRuntime,
	commitment?: Commitment,
	fallback?: BlockhashLifetime,
): Promise<BlockhashLifetime> {
	if (fallback) {
		return fallback;
	}
	const { value } = await runtime.rpc.getLatestBlockhash({ commitment }).send();
	return value;
}

function resolveSigner(
	authority: WsolAuthority,
	commitment?: Commitment,
): { mode: 'partial' | 'send'; signer: TransactionSigner } {
	if (isWalletSession(authority)) {
		const { signer, mode } = createWalletTransactionSigner(authority, { commitment });
		return { mode, signer };
	}
	return { mode: resolveSignerMode(authority), signer: authority };
}

function toLamportAmount(input: bigint | number | string): bigint {
	return lamportsMath.fromLamports(input);
}

export type WsolHelper = Readonly<{
	/** Derive the wSOL Associated Token Address for an owner. */
	deriveWsolAddress(owner: Address | string): Promise<Address>;
	/** Fetch the wSOL balance for an owner. */
	fetchWsolBalance(owner: Address | string, commitment?: Commitment): Promise<WsolBalance>;
	/** Prepare a wrap transaction without sending. */
	prepareWrap(config: WsolWrapPrepareConfig): Promise<PreparedWsolWrap>;
	/** Prepare an unwrap transaction without sending. */
	prepareUnwrap(config: WsolUnwrapPrepareConfig): Promise<PreparedWsolUnwrap>;
	/** Send a previously prepared wrap transaction. */
	sendPreparedWrap(
		prepared: PreparedWsolWrap,
		options?: SolTransferSendOptions,
	): Promise<ReturnType<typeof signature>>;
	/** Send a previously prepared unwrap transaction. */
	sendPreparedUnwrap(
		prepared: PreparedWsolUnwrap,
		options?: SolTransferSendOptions,
	): Promise<ReturnType<typeof signature>>;
	/** Wrap SOL to wSOL in one call. */
	sendWrap(config: WsolWrapPrepareConfig, options?: SolTransferSendOptions): Promise<ReturnType<typeof signature>>;
	/** Unwrap wSOL to SOL in one call (closes the wSOL account). */
	sendUnwrap(
		config: WsolUnwrapPrepareConfig,
		options?: SolTransferSendOptions,
	): Promise<ReturnType<typeof signature>>;
}>;

export type WsolBalance = Readonly<{
	amount: bigint;
	ataAddress: Address;
	exists: boolean;
}>;

/** Creates helpers for wrapping native SOL to wSOL and unwrapping back. */
export function createWsolHelper(runtime: SolanaClientRuntime): WsolHelper {
	const tokenProgram = address(TOKEN_PROGRAM_ADDRESS);

	async function deriveWsolAddress(owner: Address | string): Promise<Address> {
		const [ata] = await findAssociatedTokenPda({
			mint: WRAPPED_SOL_MINT,
			owner: ensureAddress(owner),
			tokenProgram,
		});
		return ata;
	}

	async function fetchWsolBalance(owner: Address | string, commitment?: Commitment): Promise<WsolBalance> {
		const ataAddress = await deriveWsolAddress(owner);
		try {
			const { value } = await runtime.rpc.getTokenAccountBalance(ataAddress, { commitment }).send();
			const amount = BigInt(value.amount);
			return {
				amount,
				ataAddress,
				exists: true,
			};
		} catch {
			return {
				amount: 0n,
				ataAddress,
				exists: false,
			};
		}
	}

	async function prepareWrap(config: WsolWrapPrepareConfig): Promise<PreparedWsolWrap> {
		const commitment = config.commitment;
		const lifetime = await resolveLifetime(runtime, commitment, config.lifetime);
		const { signer, mode } = resolveSigner(config.authority, commitment);
		const owner = ensureAddress(config.owner, signer.address);
		const amount = toLamportAmount(config.amount);
		const ataAddress = await deriveWsolAddress(owner);

		// Instructions:
		// 1. Create ATA if it doesn't exist (idempotent)
		// 2. Transfer SOL to ATA
		// 3. Sync native to update token balance
		const instructions = [
			getCreateAssociatedTokenIdempotentInstruction({
				ata: ataAddress,
				mint: WRAPPED_SOL_MINT,
				owner,
				payer: signer,
				tokenProgram,
			}),
			getTransferSolInstruction({
				amount,
				destination: ataAddress,
				source: signer,
			}),
			getSyncNativeInstruction({
				account: ataAddress,
			}),
		];

		const message = pipe(
			createTransactionMessage({ version: config.transactionVersion ?? 0 }),
			(m) => setTransactionMessageFeePayer(signer.address, m),
			(m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
			(m) => appendTransactionMessageInstructions(instructions, m),
		);

		return {
			amount,
			ataAddress,
			commitment,
			lifetime,
			message,
			mode,
			owner,
			plan: singleTransactionPlan(message),
			signer,
		};
	}

	async function prepareUnwrap(config: WsolUnwrapPrepareConfig): Promise<PreparedWsolUnwrap> {
		const commitment = config.commitment;
		const lifetime = await resolveLifetime(runtime, commitment, config.lifetime);
		const { signer, mode } = resolveSigner(config.authority, commitment);
		const owner = ensureAddress(config.owner, signer.address);
		const ataAddress = await deriveWsolAddress(owner);

		// Close account instruction transfers remaining lamports to destination
		const instruction = getCloseAccountInstruction({
			account: ataAddress,
			destination: owner,
			owner: signer,
		});

		const message = pipe(
			createTransactionMessage({ version: config.transactionVersion ?? 0 }),
			(m) => setTransactionMessageFeePayer(signer.address, m),
			(m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
			(m) => appendTransactionMessageInstruction(instruction, m),
		);

		return {
			ataAddress,
			commitment,
			lifetime,
			message,
			mode,
			owner,
			plan: singleTransactionPlan(message),
			signer,
		};
	}

	async function sendPreparedTransaction(
		prepared: PreparedWsolWrap | PreparedWsolUnwrap,
		options: SolTransferSendOptions = {},
	): Promise<ReturnType<typeof signature>> {
		if (prepared.mode === 'send' && isTransactionSendingSigner(prepared.signer)) {
			const signatureBytes = await signAndSendTransactionMessageWithSigners(prepared.message, {
				abortSignal: options.abortSignal,
				minContextSlot: options.minContextSlot,
			});
			const base58Decoder = getBase58Decoder();
			return signature(base58Decoder.decode(signatureBytes));
		}

		const commitment = options.commitment ?? prepared.commitment;
		const maxRetries =
			options.maxRetries === undefined
				? undefined
				: typeof options.maxRetries === 'bigint'
					? options.maxRetries
					: BigInt(options.maxRetries);
		let latestSignature: ReturnType<typeof signature> | null = null;
		const executor = createTransactionPlanExecutor({
			async executeTransactionMessage(message, config = {}) {
				const signed = await signTransactionMessageWithSigners(message as SignableWsolTransactionMessage, {
					abortSignal: config.abortSignal ?? options.abortSignal,
					minContextSlot: options.minContextSlot,
				});
				const wire = getBase64EncodedWireTransaction(signed);
				const response = await runtime.rpc
					.sendTransaction(wire, {
						encoding: 'base64',
						maxRetries,
						preflightCommitment: commitment,
						skipPreflight: options.skipPreflight,
					})
					.send({ abortSignal: config.abortSignal ?? options.abortSignal });
				latestSignature = signature(response);
				return { transaction: signed };
			},
		});
		await executor(prepared.plan ?? singleTransactionPlan(prepared.message), { abortSignal: options.abortSignal });
		if (!latestSignature) {
			throw new Error('Failed to resolve transaction signature.');
		}
		return latestSignature;
	}

	async function sendPreparedWrap(
		prepared: PreparedWsolWrap,
		options?: SolTransferSendOptions,
	): Promise<ReturnType<typeof signature>> {
		return sendPreparedTransaction(prepared, options);
	}

	async function sendPreparedUnwrap(
		prepared: PreparedWsolUnwrap,
		options?: SolTransferSendOptions,
	): Promise<ReturnType<typeof signature>> {
		return sendPreparedTransaction(prepared, options);
	}

	async function sendWrap(
		config: WsolWrapPrepareConfig,
		options?: SolTransferSendOptions,
	): Promise<ReturnType<typeof signature>> {
		const prepared = await prepareWrap(config);
		try {
			return await sendPreparedWrap(prepared, options);
		} catch (error) {
			if (isSolanaError(error, SOLANA_ERROR__TRANSACTION_ERROR__ALREADY_PROCESSED)) {
				const retriedPrepared = await prepareWrap({ ...config, lifetime: undefined });
				return await sendPreparedWrap(retriedPrepared, options);
			}
			throw error;
		}
	}

	async function sendUnwrap(
		config: WsolUnwrapPrepareConfig,
		options?: SolTransferSendOptions,
	): Promise<ReturnType<typeof signature>> {
		const prepared = await prepareUnwrap(config);
		try {
			return await sendPreparedUnwrap(prepared, options);
		} catch (error) {
			if (isSolanaError(error, SOLANA_ERROR__TRANSACTION_ERROR__ALREADY_PROCESSED)) {
				const retriedPrepared = await prepareUnwrap({ ...config, lifetime: undefined });
				return await sendPreparedUnwrap(retriedPrepared, options);
			}
			throw error;
		}
	}

	return {
		deriveWsolAddress,
		fetchWsolBalance,
		prepareUnwrap,
		prepareWrap,
		sendPreparedUnwrap,
		sendPreparedWrap,
		sendUnwrap,
		sendWrap,
	};
}
