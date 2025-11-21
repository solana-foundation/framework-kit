import { getBase58Decoder } from '@solana/codecs-strings';
import {
	type Address,
	address,
	appendTransactionMessageInstructions,
	type Blockhash,
	type Commitment,
	createTransactionMessage,
	createTransactionPlanExecutor,
	generateKeyPairSigner,
	getBase64EncodedWireTransaction,
	isTransactionSendingSigner,
	pipe,
	type Slot,
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
import { getDelegateStakeInstruction, getInitializeInstruction } from '@solana-program/stake';
import { getCreateAccountInstruction } from '@solana-program/system';

import { lamportsMath } from '../numeric/lamports';
import { createWalletTransactionSigner, isWalletSession, resolveSignerMode } from '../signers/walletTransactionSigner';
import type { SolanaClientRuntime, WalletSession } from '../types';

type BlockhashLifetime = Readonly<{
	blockhash: Blockhash;
	lastValidBlockHeight: bigint;
}>;

type StakeAmount = bigint | number | string;

type StakeAuthority = TransactionSigner<string> | WalletSession;

type SignableStakeTransactionMessage = Parameters<typeof signTransactionMessageWithSigners>[0];

// Stake Program constants
const STAKE_PROGRAM_ID: Address = 'Stake11111111111111111111111111111111111111' as Address;
const SYSVAR_STAKE_HISTORY: Address = 'SysvarStakeHistory1111111111111111111111111' as Address;
const UNUSED_STAKE_CONFIG_ACC: Address = 'StakeConfig11111111111111111111111111111111' as Address;
const STAKE_STATE_LEN = 200;

export type StakePrepareConfig = Readonly<{
	amount: StakeAmount;
	authority: StakeAuthority;
	commitment?: Commitment;
	lifetime?: BlockhashLifetime;
	transactionVersion?: TransactionVersion;
	validatorId: Address | string;
}>;

export type StakeSendOptions = Readonly<{
	abortSignal?: AbortSignal;
	commitment?: Commitment;
	maxRetries?: bigint | number;
	minContextSlot?: Slot;
	skipPreflight?: boolean;
}>;

type PreparedStake = Readonly<{
	commitment?: Commitment;
	lifetime: BlockhashLifetime;
	message: SignableStakeTransactionMessage;
	mode: 'partial' | 'send';
	signer: TransactionSigner;
	plan?: TransactionPlan;
	stakeAccount: TransactionSigner<string>;
}>;

function ensureAddress(value: Address | string): Address {
	return typeof value === 'string' ? address(value) : value;
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
	authority: StakeAuthority,
	commitment?: Commitment,
): { mode: 'partial' | 'send'; signer: TransactionSigner } {
	if (isWalletSession(authority)) {
		const { signer, mode } = createWalletTransactionSigner(authority, { commitment });
		return { mode, signer };
	}
	return { mode: resolveSignerMode(authority), signer: authority };
}

function toLamportAmount(input: StakeAmount): bigint {
	return lamportsMath.fromLamports(input);
}

export type StakeHelper = Readonly<{
	prepareStake(config: StakePrepareConfig): Promise<PreparedStake>;
	sendPreparedStake(prepared: PreparedStake, options?: StakeSendOptions): Promise<ReturnType<typeof signature>>;
	sendStake(config: StakePrepareConfig, options?: StakeSendOptions): Promise<ReturnType<typeof signature>>;
}>;

/** Creates helpers that build and submit native SOL staking transactions. */
export function createStakeHelper(runtime: SolanaClientRuntime): StakeHelper {
	async function prepareStake(config: StakePrepareConfig): Promise<PreparedStake> {
		const commitment = config.commitment;
		const lifetime = await resolveLifetime(runtime, commitment, config.lifetime);
		const { signer, mode } = resolveSigner(config.authority, commitment);
		const validatorAddress = ensureAddress(config.validatorId);
		const amount = toLamportAmount(config.amount);

		// Get rent exemption for stake account
		const rentExempt = await runtime.rpc.getMinimumBalanceForRentExemption(BigInt(STAKE_STATE_LEN)).send();

		const totalLamports = rentExempt + amount;

		// Generate a new stake account
		const stakeAccount = await generateKeyPairSigner();

		// Build instructions
		const createIx = getCreateAccountInstruction({
			payer: signer,
			newAccount: stakeAccount,
			lamports: totalLamports,
			space: BigInt(STAKE_STATE_LEN),
			programAddress: STAKE_PROGRAM_ID,
		});

		const initializeIx = getInitializeInstruction({
			stake: stakeAccount.address,
			arg0: {
				staker: signer.address,
				withdrawer: signer.address,
			},
			arg1: {
				unixTimestamp: 0n,
				epoch: 0n,
				custodian: signer.address,
			},
		});

		const delegateIx = getDelegateStakeInstruction({
			stake: stakeAccount.address,
			vote: validatorAddress,
			stakeHistory: SYSVAR_STAKE_HISTORY,
			unused: UNUSED_STAKE_CONFIG_ACC,
			stakeAuthority: signer,
		});

		const message = pipe(
			createTransactionMessage({ version: config.transactionVersion ?? 0 }),
			(m) => setTransactionMessageFeePayer(signer.address, m),
			(m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
			(m) => appendTransactionMessageInstructions([createIx, initializeIx, delegateIx], m),
		);

		return {
			commitment,
			lifetime,
			message,
			mode,
			signer,
			stakeAccount,
			plan: singleTransactionPlan(message),
		};
	}

	async function sendPreparedStake(
		prepared: PreparedStake,
		options: StakeSendOptions = {},
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
				const signed = await signTransactionMessageWithSigners(message as SignableStakeTransactionMessage, {
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

	async function sendStake(
		config: StakePrepareConfig,
		options?: StakeSendOptions,
	): Promise<ReturnType<typeof signature>> {
		const prepared = await prepareStake(config);
		return await sendPreparedStake(prepared, options);
	}

	return {
		prepareStake,
		sendPreparedStake,
		sendStake,
	};
}
