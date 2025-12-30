import { getBase58Decoder } from '@solana/codecs-strings';
import {
	type Address,
	address,
	appendTransactionMessageInstructions,
	type Base58EncodedBytes,
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
import {
	getDeactivateInstruction,
	getDelegateStakeInstruction,
	getInitializeInstruction,
	getWithdrawInstruction,
} from '@solana-program/stake';
import { getCreateAccountInstruction } from '@solana-program/system';

import { lamportsMath } from '../numeric/lamports';
import type { SolanaClientRuntime } from '../rpc/types';
import { createWalletTransactionSigner, isWalletSession, resolveSignerMode } from '../signers/walletTransactionSigner';
import type { WalletSession } from '../wallet/types';

type BlockhashLifetime = Readonly<{
	blockhash: Blockhash;
	lastValidBlockHeight: bigint;
}>;

type StakeAmount = bigint | number | string;

type StakeAuthority = TransactionSigner<string> | WalletSession;

export type StakeAccount = {
	pubkey: Address;
	account: {
		data: {
			parsed: {
				info: {
					stake?: {
						delegation?: {
							voter: string;
							stake: string;
							activationEpoch: string;
							deactivationEpoch: string;
						};
					};
					meta?: {
						rentExemptReserve: string;
						authorized: {
							staker: string;
							withdrawer: string;
						};
						lockup: {
							unixTimestamp: number;
							epoch: number;
							custodian: string;
						};
					};
				};
			};
		};
		lamports: bigint;
	};
};

type SignableStakeTransactionMessage = Parameters<typeof signTransactionMessageWithSigners>[0];

// Stake Program constants
const STAKE_PROGRAM_ID: Address = 'Stake11111111111111111111111111111111111111' as Address;
const SYSVAR_CLOCK: Address = 'SysvarC1ock11111111111111111111111111111111' as Address;
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

export type UnstakePrepareConfig = Readonly<{
	authority: StakeAuthority;
	commitment?: Commitment;
	lifetime?: BlockhashLifetime;
	stakeAccount: Address | string;
	transactionVersion?: TransactionVersion;
}>;

export type UnstakeSendOptions = StakeSendOptions;

export type WithdrawPrepareConfig = Readonly<{
	amount: StakeAmount;
	authority: StakeAuthority;
	commitment?: Commitment;
	destination: Address | string;
	lifetime?: BlockhashLifetime;
	stakeAccount: Address | string;
	transactionVersion?: TransactionVersion;
}>;

export type WithdrawSendOptions = StakeSendOptions;

type PreparedUnstake = Readonly<{
	commitment?: Commitment;
	lifetime: BlockhashLifetime;
	message: SignableStakeTransactionMessage;
	mode: 'partial' | 'send';
	plan: TransactionPlan;
	signer: TransactionSigner<string>;
}>;

type PreparedWithdraw = Readonly<{
	commitment?: Commitment;
	lifetime: BlockhashLifetime;
	message: SignableStakeTransactionMessage;
	mode: 'partial' | 'send';
	plan: TransactionPlan;
	signer: TransactionSigner<string>;
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
	getStakeAccounts(wallet: Address | string, validatorId?: Address | string): Promise<StakeAccount[]>;
	prepareStake(config: StakePrepareConfig): Promise<PreparedStake>;
	prepareUnstake(config: UnstakePrepareConfig): Promise<PreparedUnstake>;
	prepareWithdraw(config: WithdrawPrepareConfig): Promise<PreparedWithdraw>;
	sendPreparedStake(prepared: PreparedStake, options?: StakeSendOptions): Promise<ReturnType<typeof signature>>;
	sendPreparedUnstake(prepared: PreparedUnstake, options?: UnstakeSendOptions): Promise<ReturnType<typeof signature>>;
	sendPreparedWithdraw(
		prepared: PreparedWithdraw,
		options?: WithdrawSendOptions,
	): Promise<ReturnType<typeof signature>>;
	sendStake(config: StakePrepareConfig, options?: StakeSendOptions): Promise<ReturnType<typeof signature>>;
	sendUnstake(config: UnstakePrepareConfig, options?: UnstakeSendOptions): Promise<ReturnType<typeof signature>>;
	sendWithdraw(config: WithdrawPrepareConfig, options?: WithdrawSendOptions): Promise<ReturnType<typeof signature>>;
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

	async function prepareUnstake(config: UnstakePrepareConfig): Promise<PreparedUnstake> {
		const commitment = config.commitment;
		const lifetime = await resolveLifetime(runtime, commitment, config.lifetime);
		const { signer, mode } = resolveSigner(config.authority, commitment);
		const stakeAccountAddress = ensureAddress(config.stakeAccount);

		const deactivateIx = getDeactivateInstruction({
			stake: stakeAccountAddress,
			clockSysvar: SYSVAR_CLOCK,
			stakeAuthority: signer,
		});

		const message = pipe(
			createTransactionMessage({ version: config.transactionVersion ?? 0 }),
			(m) => setTransactionMessageFeePayer(signer.address, m),
			(m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
			(m) => appendTransactionMessageInstructions([deactivateIx], m),
		);

		return {
			commitment,
			lifetime,
			message,
			mode,
			signer,
			plan: singleTransactionPlan(message),
		};
	}

	async function sendPreparedUnstake(
		prepared: PreparedUnstake,
		options: UnstakeSendOptions = {},
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
		await executor(prepared.plan);
		if (!latestSignature) {
			throw new Error('Failed to resolve transaction signature.');
		}
		return latestSignature;
	}

	async function sendUnstake(
		config: UnstakePrepareConfig,
		options?: UnstakeSendOptions,
	): Promise<ReturnType<typeof signature>> {
		const prepared = await prepareUnstake(config);
		return await sendPreparedUnstake(prepared, options);
	}

	async function prepareWithdraw(config: WithdrawPrepareConfig): Promise<PreparedWithdraw> {
		const commitment = config.commitment;
		const lifetime = await resolveLifetime(runtime, commitment, config.lifetime);
		const { signer, mode } = resolveSigner(config.authority, commitment);
		const stakeAccountAddress = ensureAddress(config.stakeAccount);
		const destinationAddress = ensureAddress(config.destination);
		const amount = toLamportAmount(config.amount);

		const withdrawIx = getWithdrawInstruction({
			stake: stakeAccountAddress,
			recipient: destinationAddress,
			clockSysvar: SYSVAR_CLOCK,
			stakeHistory: SYSVAR_STAKE_HISTORY,
			withdrawAuthority: signer,
			args: amount,
		});

		const message = pipe(
			createTransactionMessage({ version: config.transactionVersion ?? 0 }),
			(m) => setTransactionMessageFeePayer(signer.address, m),
			(m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
			(m) => appendTransactionMessageInstructions([withdrawIx], m),
		);

		return {
			commitment,
			lifetime,
			message,
			mode,
			signer,
			plan: singleTransactionPlan(message),
		};
	}

	async function sendPreparedWithdraw(
		prepared: PreparedWithdraw,
		options: WithdrawSendOptions = {},
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
		await executor(prepared.plan);
		if (!latestSignature) {
			throw new Error('Failed to resolve transaction signature.');
		}
		return latestSignature;
	}

	async function sendWithdraw(
		config: WithdrawPrepareConfig,
		options?: WithdrawSendOptions,
	): Promise<ReturnType<typeof signature>> {
		const prepared = await prepareWithdraw(config);
		return await sendPreparedWithdraw(prepared, options);
	}

	async function getStakeAccounts(wallet: Address | string, validatorId?: Address | string): Promise<StakeAccount[]> {
		const walletAddress = typeof wallet === 'string' ? wallet : String(wallet);

		const accounts = await runtime.rpc
			.getProgramAccounts(STAKE_PROGRAM_ID, {
				encoding: 'jsonParsed',
				filters: [
					{
						memcmp: {
							offset: 44n,
							bytes: walletAddress as Base58EncodedBytes,
							encoding: 'base58',
						},
					},
				],
			})
			.send();

		if (!validatorId) {
			return accounts as StakeAccount[];
		}

		const validatorIdStr = typeof validatorId === 'string' ? validatorId : String(validatorId);
		return accounts.filter((acc) => {
			const data = acc.account?.data;
			if (data && 'parsed' in data) {
				const info = data.parsed?.info as { stake?: { delegation?: { voter?: string } } } | undefined;
				return info?.stake?.delegation?.voter === validatorIdStr;
			}
			return false;
		}) as StakeAccount[];
	}

	return {
		getStakeAccounts,
		prepareStake,
		prepareUnstake,
		prepareWithdraw,
		sendPreparedStake,
		sendPreparedUnstake,
		sendPreparedWithdraw,
		sendStake,
		sendUnstake,
		sendWithdraw,
	};
}
