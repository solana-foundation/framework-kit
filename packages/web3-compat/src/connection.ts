import type { Address } from '@solana/addresses';
import { createSolanaRpcClient, type SolanaRpcClient } from '@solana/client';
import type { Commitment as KitCommitment, Signature } from '@solana/kit';
import type { Base64EncodedWireTransaction } from '@solana/transactions';
import {
	type AccountInfo,
	type BlockProduction,
	type BlockResponse,
	type BlockSignatures,
	type ConfirmedSignatureInfo,
	type ConnectionConfig,
	type ContactInfo,
	type Context,
	type DataSlice,
	type EpochInfo,
	type Finality,
	type GetParsedProgramAccountsConfig,
	type GetVersionedTransactionConfig,
	type InflationGovernor,
	type InflationRate,
	type InflationReward,
	type KeyedAccountInfo,
	type LeaderSchedule,
	type Commitment as LegacyCommitment,
	type Logs,
	type ParsedAccountData,
	type ParsedBlockResponse,
	type ParsedTransactionWithMeta,
	type PerfSample,
	PublicKey,
	type RecentPrioritizationFees,
	type RpcResponseAndContext,
	type SendOptions,
	type SignatureResult,
	type SignatureStatus,
	type SignatureStatusConfig,
	type SignatureSubscriptionOptions,
	type SignaturesForAddressOptions,
	type Signer,
	type SimulatedTransactionResponse,
	type SimulateTransactionConfig,
	type SlotInfo,
	type SlotUpdate,
	type Supply,
	type TokenAmount,
	Transaction,
	type TransactionError,
	type TransactionResponse,
	type TransactionSignature,
	type Version,
	type VersionedBlockResponse,
	VersionedTransaction,
	type VersionedTransactionResponse,
	type VoteAccountStatus,
} from '@solana/web3.js';

import { toAddress as toKitAddress } from './bridges';

type NormalizedCommitment = 'processed' | 'confirmed' | 'finalized';

type RpcContext = Readonly<{
	apiVersion?: string;
	slot: number;
}>;

type AccountInfoConfig = Readonly<{
	commitment?: LegacyCommitment;
	dataSlice?: DataSlice;
	encoding?: 'base64';
	minContextSlot?: number;
}>;

type ProgramAccountsConfig = Readonly<{
	commitment?: LegacyCommitment;
	dataSlice?: DataSlice;
	encoding?: 'base64' | 'base64+zstd';
	filters?: ReadonlyArray<unknown>;
	minContextSlot?: number;
	withContext?: boolean;
}>;

type ConnectionCommitmentInput =
	| LegacyCommitment
	| (ConnectionConfig & {
			commitment?: LegacyCommitment;
	  })
	| undefined;

type RpcResponseWithContext<T> = Readonly<{
	context: RpcContext;
	value: T;
}>;

type RawTransactionInput = number[] | Uint8Array | Buffer | Transaction | VersionedTransaction;

type RpcAccount = Readonly<{
	data: readonly [string, string] | string;
	executable: boolean;
	lamports: number | bigint;
	owner: string;
	rentEpoch: number | bigint;
}>;

type ProgramAccountWire = Readonly<{
	account: RpcAccount;
	pubkey: string;
}>;

type ProgramAccountsWithContext = Readonly<{
	context: Readonly<{
		apiVersion?: string;
		slot: number | bigint;
	}>;
	value: readonly ProgramAccountWire[];
}>;

type SignatureStatusConfigWithCommitment = SignatureStatusConfig & {
	commitment?: LegacyCommitment;
};

type GetMultipleAccountsConfig = Readonly<{
	commitment?: LegacyCommitment;
	dataSlice?: DataSlice;
	minContextSlot?: number;
}>;

type TokenAccountsFilter = { mint: PublicKey } | { programId: PublicKey };

type GetTokenAccountsByOwnerConfig = Readonly<{
	commitment?: LegacyCommitment;
	encoding?: 'base64' | 'jsonParsed';
	minContextSlot?: number;
}>;

type GetTransactionConfig = Readonly<{
	commitment?: Finality;
	maxSupportedTransactionVersion?: number;
}>;

type GetParsedAccountInfoConfig = Readonly<{
	commitment?: LegacyCommitment;
	minContextSlot?: number;
}>;

type GetMultipleParsedAccountsConfig = Readonly<{
	commitment?: LegacyCommitment;
	minContextSlot?: number;
}>;

type GetParsedTransactionConfig = Readonly<{
	commitment?: Finality;
	maxSupportedTransactionVersion?: number;
}>;

type GetParsedBlockConfig = Readonly<{
	commitment?: Finality;
	maxSupportedTransactionVersion?: number;
	rewards?: boolean;
	transactionDetails?: 'full' | 'accounts' | 'signatures' | 'none';
}>;

// WebSocket subscription callback types
type AccountChangeCallback = (accountInfo: AccountInfo<Buffer>, context: Context) => void;
type ProgramAccountChangeCallback = (keyedAccountInfo: KeyedAccountInfo, context: Context) => void;
type SlotChangeCallback = (slotInfo: SlotInfo) => void;
type SlotUpdateCallback = (slotUpdate: SlotUpdate) => void;
type SignatureResultCallback = (signatureResult: SignatureResult, context: Context) => void;
type SignatureSubscriptionCallback = (notification: SignatureResult | { type: 'received' }, context: Context) => void;
type RootChangeCallback = (root: number) => void;
type LogsCallback = (logs: Logs, context: Context) => void;

type LogsFilter = 'all' | 'allWithVotes' | { mentions: string[] };

type SubscriptionEntry = {
	abort: () => void;
};

type KitParsedAccountData = {
	data: {
		parsed: unknown;
		program: string;
		space: number;
	};
	executable: boolean;
	lamports: number | bigint;
	owner: string;
	rentEpoch: number | bigint;
};

type KitTransactionMeta = {
	err: unknown;
	fee: number | bigint;
	innerInstructions: readonly unknown[] | null;
	loadedAddresses?: {
		readonly: readonly string[];
		writable: readonly string[];
	};
	logMessages: readonly string[] | null;
	postBalances: readonly (number | bigint)[];
	postTokenBalances: readonly unknown[] | null;
	preBalances: readonly (number | bigint)[];
	preTokenBalances: readonly unknown[] | null;
	rewards: readonly unknown[] | null;
	computeUnitsConsumed?: number | bigint;
};

type KitTransactionResponse = {
	blockTime: number | bigint | null;
	meta: KitTransactionMeta | null;
	slot: number | bigint;
	transaction: {
		message: unknown;
		signatures: readonly string[];
	};
	version?: 'legacy' | 0;
};

type KitSignatureInfo = {
	blockTime: number | bigint | null;
	confirmationStatus: string | null;
	err: unknown;
	memo: string | null;
	signature: string;
	slot: number | bigint;
};

type GetBlockConfig = Readonly<{
	commitment?: Finality;
	maxSupportedTransactionVersion?: number;
	rewards?: boolean;
	transactionDetails?: 'full' | 'accounts' | 'signatures' | 'none';
}>;

type KitBlockResponse = {
	blockHeight: number | bigint | null;
	blockTime: number | bigint | null;
	blockhash: string;
	parentSlot: number | bigint;
	previousBlockhash: string;
	rewards?: readonly unknown[];
	transactions?: readonly unknown[];
	signatures?: readonly string[];
};

const DEFAULT_COMMITMENT: NormalizedCommitment = 'confirmed';

const DEFAULT_SIMULATION_CONFIG = Object.freeze({
	encoding: 'base64' as const,
	replaceRecentBlockhash: true as const,
	sigVerify: false as const,
});

function normalizeCommitment(commitment?: LegacyCommitment | null): NormalizedCommitment | undefined {
	if (commitment === undefined || commitment === null) {
		return undefined;
	}
	if (commitment === 'recent') {
		return 'processed';
	}
	if (commitment === 'singleGossip') {
		return 'processed';
	}
	if (commitment === 'single') {
		return 'confirmed';
	}
	if (commitment === 'max') {
		return 'finalized';
	}
	return commitment as NormalizedCommitment;
}

function toBigInt(value: number | bigint | undefined): bigint | undefined {
	if (value === undefined) return undefined;
	return typeof value === 'bigint' ? value : BigInt(Math.trunc(value));
}

function toAccountInfo(info: RpcAccount, dataSlice?: DataSlice): AccountInfo<Buffer> {
	const { data, executable, lamports, owner, rentEpoch } = info;
	const [content, encoding] = Array.isArray(data) ? data : [data, 'base64'];
	let buffer = encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content);
	if (dataSlice) {
		const start = dataSlice.offset ?? 0;
		const end = start + (dataSlice.length ?? buffer.length);
		buffer = buffer.subarray(start, end);
	}
	return {
		data: buffer,
		executable,
		lamports: typeof lamports === 'number' ? lamports : Number(lamports),
		owner: new PublicKey(owner),
		rentEpoch: typeof rentEpoch === 'number' ? rentEpoch : Number(rentEpoch),
	};
}

function fromKitAccount(value: unknown): RpcAccount {
	const account = (value ?? {}) as Record<string, unknown>;
	const data = account.data as string | readonly [string, string] | undefined;
	const lamports = account.lamports as number | bigint | undefined;
	const ownerValue = account.owner as unknown;
	const rentEpoch = account.rentEpoch as number | bigint | undefined;
	const owner =
		typeof ownerValue === 'string'
			? ownerValue
			: ownerValue instanceof PublicKey
				? ownerValue.toBase58()
				: typeof ownerValue === 'object' && ownerValue !== null && 'toString' in ownerValue
					? String(ownerValue)
					: '11111111111111111111111111111111';
	return {
		data: data ?? ['', 'base64'],
		executable: Boolean(account.executable),
		lamports: lamports ?? 0,
		owner,
		rentEpoch: rentEpoch ?? 0,
	};
}

function toParsedAccountData(kitParsed: KitParsedAccountData): ParsedAccountData {
	return {
		parsed: kitParsed.data.parsed,
		program: kitParsed.data.program,
		space: kitParsed.data.space,
	};
}

function toParsedAccountInfo(kitAccount: unknown): AccountInfo<Buffer | ParsedAccountData> {
	const account = (kitAccount ?? {}) as Record<string, unknown>;
	const executable = Boolean(account.executable);
	const lamports = account.lamports as number | bigint;
	const ownerValue = account.owner as unknown;
	const rentEpoch = account.rentEpoch as number | bigint | undefined;

	const owner =
		typeof ownerValue === 'string'
			? new PublicKey(ownerValue)
			: ownerValue instanceof PublicKey
				? ownerValue
				: typeof ownerValue === 'object' && ownerValue !== null && 'toString' in ownerValue
					? new PublicKey(String(ownerValue))
					: new PublicKey('11111111111111111111111111111111');

	const data = account.data as unknown;

	// Check if it's parsed data (object with parsed, program, space)
	if (typeof data === 'object' && data !== null && 'parsed' in data && 'program' in data) {
		return {
			data: toParsedAccountData({
				data: data as KitParsedAccountData['data'],
				executable,
				lamports,
				owner: owner.toBase58(),
				rentEpoch: rentEpoch ?? 0,
			}),
			executable,
			lamports: typeof lamports === 'number' ? lamports : Number(lamports),
			owner,
			rentEpoch:
				rentEpoch !== undefined ? (typeof rentEpoch === 'number' ? rentEpoch : Number(rentEpoch)) : undefined,
		};
	}

	// Otherwise treat as raw buffer
	const rawData = data as string | readonly [string, string] | undefined;
	const [content, encoding] = Array.isArray(rawData) ? rawData : [rawData ?? '', 'base64'];
	const buffer = encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content);

	return {
		data: buffer,
		executable,
		lamports: typeof lamports === 'number' ? lamports : Number(lamports),
		owner,
		rentEpoch:
			rentEpoch !== undefined ? (typeof rentEpoch === 'number' ? rentEpoch : Number(rentEpoch)) : undefined,
	};
}

function toKitAddressFromInput(input: PublicKey | string): Address<string> {
	return toKitAddress(input instanceof PublicKey ? input : input);
}

function toBase64WireTransaction(raw: RawTransactionInput): Base64EncodedWireTransaction {
	if (raw instanceof Transaction || raw instanceof VersionedTransaction) {
		const bytes = raw.serialize({
			requireAllSignatures: false,
			verifySignatures: false,
		});
		return Buffer.from(bytes).toString('base64') as Base64EncodedWireTransaction;
	}
	if (raw instanceof Uint8Array) {
		return Buffer.from(raw).toString('base64') as Base64EncodedWireTransaction;
	}
	if (raw instanceof Buffer) {
		return raw.toString('base64') as Base64EncodedWireTransaction;
	}
	const uint8 = Uint8Array.from(raw);
	return Buffer.from(uint8).toString('base64') as Base64EncodedWireTransaction;
}

export class Connection {
	readonly commitment?: NormalizedCommitment;
	readonly rpcEndpoint: string;

	#client: SolanaRpcClient;
	#subscriptions: Map<number, SubscriptionEntry> = new Map();
	#nextSubscriptionId = 0;

	constructor(endpoint: string, commitmentOrConfig?: ConnectionCommitmentInput) {
		const commitment =
			typeof commitmentOrConfig === 'string'
				? normalizeCommitment(commitmentOrConfig)
				: (normalizeCommitment(commitmentOrConfig?.commitment) ?? DEFAULT_COMMITMENT);

		const websocketEndpoint =
			typeof commitmentOrConfig === 'object' && commitmentOrConfig !== null
				? commitmentOrConfig.wsEndpoint
				: undefined;

		this.commitment = commitment;
		this.rpcEndpoint = endpoint;
		this.#client = createSolanaRpcClient({
			endpoint,
			websocketEndpoint,
			commitment: (commitment ?? DEFAULT_COMMITMENT) as KitCommitment,
		});
	}

	async getLatestBlockhash(
		commitmentOrConfig?:
			| LegacyCommitment
			| {
					commitment?: LegacyCommitment;
					maxSupportedTransactionVersion?: number;
					minContextSlot?: number;
			  },
	): Promise<{
		blockhash: string;
		lastValidBlockHeight: number;
	}> {
		const baseCommitment =
			typeof commitmentOrConfig === 'string' ? commitmentOrConfig : commitmentOrConfig?.commitment;
		const commitment = normalizeCommitment(baseCommitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const minContextSlot =
			typeof commitmentOrConfig === 'object' ? toBigInt(commitmentOrConfig.minContextSlot) : undefined;
		const requestOptions: Record<string, unknown> = {
			commitment: commitment as KitCommitment,
		};
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}
		if (
			typeof commitmentOrConfig === 'object' &&
			commitmentOrConfig?.maxSupportedTransactionVersion !== undefined
		) {
			requestOptions.maxSupportedTransactionVersion = commitmentOrConfig.maxSupportedTransactionVersion;
		}
		const response = await this.#client.rpc.getLatestBlockhash(requestOptions as never).send();

		return {
			blockhash: response.value.blockhash,
			lastValidBlockHeight: Number(response.value.lastValidBlockHeight),
		};
	}

	async getBalance(publicKey: PublicKey | string, commitment?: LegacyCommitment): Promise<number> {
		const address = toKitAddressFromInput(publicKey);
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const result = await this.#client.rpc
			.getBalance(address, { commitment: chosenCommitment as KitCommitment })
			.send();
		return typeof result.value === 'number' ? result.value : Number(result.value);
	}

	async getAccountInfo<TAccountData = Buffer>(
		publicKey: PublicKey | string,
		commitmentOrConfig?: AccountInfoConfig | LegacyCommitment,
	): Promise<AccountInfo<TAccountData> | null> {
		const address = toKitAddressFromInput(publicKey);
		let localCommitment: NormalizedCommitment | undefined;
		let minContextSlot: bigint | undefined;
		let dataSlice: DataSlice | undefined;
		let encoding: 'base64' | undefined;
		if (typeof commitmentOrConfig === 'string') {
			localCommitment = normalizeCommitment(commitmentOrConfig);
		} else if (commitmentOrConfig) {
			localCommitment = normalizeCommitment(commitmentOrConfig.commitment);
			if (commitmentOrConfig.minContextSlot !== undefined) {
				minContextSlot = toBigInt(commitmentOrConfig.minContextSlot);
			}
			dataSlice = commitmentOrConfig.dataSlice;
			encoding = commitmentOrConfig.encoding;
		}

		const requestOptions: Record<string, unknown> = {
			commitment: (localCommitment ?? this.commitment ?? DEFAULT_COMMITMENT) as KitCommitment,
		};
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}
		if (encoding) {
			requestOptions.encoding = encoding;
		}
		if (dataSlice) {
			requestOptions.dataSlice = {
				length: dataSlice.length,
				offset: dataSlice.offset,
			};
		}

		const response = await this.#client.rpc.getAccountInfo(address, requestOptions as never).send();

		if (!response.value) {
			return null;
		}
		const accountInfo = toAccountInfo(fromKitAccount(response.value), dataSlice);

		return accountInfo as AccountInfo<TAccountData>;
	}

	async getProgramAccounts(
		programId: PublicKey | string,
		commitmentOrConfig?: LegacyCommitment | ProgramAccountsConfig,
	): Promise<
		| Array<{
				account: AccountInfo<Buffer | object>;
				pubkey: PublicKey;
		  }>
		| RpcResponseWithContext<
				Array<{
					account: AccountInfo<Buffer | object>;
					pubkey: PublicKey;
				}>
		  >
	> {
		const id = toKitAddressFromInput(programId);
		let localCommitment: NormalizedCommitment | undefined;
		let dataSlice: DataSlice | undefined;
		let filters: ReadonlyArray<unknown> | undefined;
		let encoding: 'base64' | 'base64+zstd' | undefined;
		let minContextSlot: bigint | undefined;
		let withContext = false;
		if (typeof commitmentOrConfig === 'string') {
			localCommitment = normalizeCommitment(commitmentOrConfig);
		} else if (commitmentOrConfig) {
			localCommitment = normalizeCommitment(commitmentOrConfig.commitment);
			dataSlice = commitmentOrConfig.dataSlice;
			filters = commitmentOrConfig.filters;
			encoding = commitmentOrConfig.encoding;
			minContextSlot = toBigInt(commitmentOrConfig.minContextSlot);
			withContext = Boolean(commitmentOrConfig.withContext);
		}

		const requestOptions: Record<string, unknown> = {
			commitment: (localCommitment ?? this.commitment ?? DEFAULT_COMMITMENT) as KitCommitment,
			withContext,
		};
		if (dataSlice) {
			requestOptions.dataSlice = {
				length: dataSlice.length,
				offset: dataSlice.offset,
			};
		}
		if (encoding) {
			requestOptions.encoding = encoding;
		}
		if (filters) {
			requestOptions.filters = filters.map((filter) => filter as never);
		}
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}

		const result = await this.#client.rpc.getProgramAccounts(id, requestOptions as never).send();

		const mapProgramAccount = (entry: ProgramAccountWire) => {
			const pubkey = new PublicKey(entry.pubkey);
			return {
				account: toAccountInfo(fromKitAccount(entry.account), dataSlice),
				pubkey,
			};
		};

		if (withContext && typeof (result as unknown as ProgramAccountsWithContext).context !== 'undefined') {
			const contextual = result as unknown as ProgramAccountsWithContext;
			return {
				context: {
					apiVersion: contextual.context.apiVersion,
					slot: Number(contextual.context.slot),
				},
				value: contextual.value.map(mapProgramAccount),
			};
		}

		return (result as unknown as readonly ProgramAccountWire[]).map(mapProgramAccount);
	}

	async getSignatureStatuses(
		signatures: readonly TransactionSignature[],
		config?: SignatureStatusConfigWithCommitment,
	): Promise<RpcResponseWithContext<(SignatureStatus | null)[]>> {
		const targetCommitment = normalizeCommitment(config?.commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const kitSignatures = signatures.map((signature) => signature as unknown as Signature);
		const response = await this.#client.rpc
			.getSignatureStatuses(kitSignatures, {
				commitment: targetCommitment as KitCommitment,
				searchTransactionHistory: config?.searchTransactionHistory,
			} as never)
			.send();

		const context = response.context as { slot: number | bigint; apiVersion?: string };
		const normalizedContext: RpcContext = {
			apiVersion: context?.apiVersion,
			slot: typeof context?.slot === 'bigint' ? Number(context.slot) : (context?.slot ?? 0),
		};

		const normalizedValues = (response.value as readonly (SignatureStatus | null | Record<string, unknown>)[]).map(
			(status) => {
				if (!status) {
					return null;
				}
				const record = status as Record<string, unknown>;
				const slot = record.slot as number | bigint | undefined;
				const confirmations = record.confirmations as number | bigint | null | undefined;
				const normalizedConfirmations =
					confirmations === null
						? null
						: confirmations === undefined
							? null
							: typeof confirmations === 'bigint'
								? Number(confirmations)
								: confirmations;
				return {
					err: (record.err ?? null) as SignatureStatus['err'],
					confirmations: normalizedConfirmations,
					confirmationStatus: record.confirmationStatus as SignatureStatus['confirmationStatus'],
					slot: slot === undefined ? 0 : typeof slot === 'bigint' ? Number(slot) : slot,
				} satisfies SignatureStatus;
			},
		);

		return {
			context: normalizedContext,
			value: normalizedValues as (SignatureStatus | null)[],
		};
	}
	async sendRawTransaction(rawTransaction: RawTransactionInput, options?: SendOptions): Promise<string> {
		const wire = toBase64WireTransaction(rawTransaction);

		const preflightCommitment =
			normalizeCommitment(
				options?.preflightCommitment ??
					(options as (SendOptions & { commitment?: LegacyCommitment }) | undefined)?.commitment,
			) ??
			this.commitment ??
			DEFAULT_COMMITMENT;
		const maxRetries = options?.maxRetries === undefined ? undefined : toBigInt(options.maxRetries);
		const minContextSlot = options?.minContextSlot === undefined ? undefined : toBigInt(options.minContextSlot);
		const plan = this.#client.rpc.sendTransaction(wire, {
			encoding: 'base64',
			maxRetries,
			minContextSlot,
			preflightCommitment: preflightCommitment as KitCommitment,
			skipPreflight: options?.skipPreflight,
		});

		return await plan.send();
	}

	async confirmTransaction(
		signature: TransactionSignature,
		commitment?: LegacyCommitment,
	): Promise<RpcResponseWithContext<SignatureStatus | null>> {
		const normalizedCommitment = normalizeCommitment(commitment);
		const response = await this.getSignatureStatuses([signature], {
			commitment: normalizedCommitment ?? this.commitment ?? DEFAULT_COMMITMENT,
			searchTransactionHistory: true,
		});

		return {
			context: response.context,
			value: response.value[0] ?? null,
		};
	}

	async simulateTransaction(
		transaction: RawTransactionInput,
		config?: SimulateTransactionConfig,
	): Promise<RpcResponseWithContext<SimulatedTransactionResponse>> {
		const wire = toBase64WireTransaction(transaction);
		const commitment = normalizeCommitment(config?.commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const baseConfig = {
			...(config ?? {}),
			commitment,
		};
		const mergedConfig = {
			...DEFAULT_SIMULATION_CONFIG,
			...baseConfig,
			commitment: commitment as KitCommitment,
		};
		const normalizedConfig =
			mergedConfig.sigVerify === true && mergedConfig.replaceRecentBlockhash !== false
				? { ...mergedConfig, replaceRecentBlockhash: false }
				: mergedConfig;

		const response = await this.#client.rpc.simulateTransaction(wire, normalizedConfig as never).send();

		return {
			context: {
				apiVersion: (response.context as Record<string, unknown>)?.apiVersion as string | undefined,
				slot: Number((response.context as Record<string, unknown>)?.slot ?? 0),
			},
			value: response.value as unknown as SimulatedTransactionResponse,
		};
	}

	// ========== Phase 1: Core High-Frequency Methods ==========

	async getMultipleAccountsInfo(
		publicKeys: PublicKey[],
		commitmentOrConfig?: LegacyCommitment | GetMultipleAccountsConfig,
	): Promise<(AccountInfo<Buffer> | null)[]> {
		const addresses = publicKeys.map((pk) => toKitAddressFromInput(pk));

		let localCommitment: NormalizedCommitment | undefined;
		let minContextSlot: bigint | undefined;
		let dataSlice: DataSlice | undefined;

		if (typeof commitmentOrConfig === 'string') {
			localCommitment = normalizeCommitment(commitmentOrConfig);
		} else if (commitmentOrConfig) {
			localCommitment = normalizeCommitment(commitmentOrConfig.commitment);
			minContextSlot = toBigInt(commitmentOrConfig.minContextSlot);
			dataSlice = commitmentOrConfig.dataSlice;
		}

		const requestOptions: Record<string, unknown> = {
			commitment: (localCommitment ?? this.commitment ?? DEFAULT_COMMITMENT) as KitCommitment,
			encoding: 'base64',
		};
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}
		if (dataSlice) {
			requestOptions.dataSlice = {
				length: dataSlice.length,
				offset: dataSlice.offset,
			};
		}

		const response = await this.#client.rpc.getMultipleAccounts(addresses, requestOptions as never).send();

		const values = response.value as readonly (RpcAccount | null)[];
		return values.map((account) => {
			if (!account) return null;
			return toAccountInfo(fromKitAccount(account), dataSlice);
		});
	}

	async getMultipleAccountsInfoAndContext(
		publicKeys: PublicKey[],
		commitmentOrConfig?: LegacyCommitment | GetMultipleAccountsConfig,
	): Promise<RpcResponseAndContext<(AccountInfo<Buffer> | null)[]>> {
		const addresses = publicKeys.map((pk) => toKitAddressFromInput(pk));

		let localCommitment: NormalizedCommitment | undefined;
		let minContextSlot: bigint | undefined;
		let dataSlice: DataSlice | undefined;

		if (typeof commitmentOrConfig === 'string') {
			localCommitment = normalizeCommitment(commitmentOrConfig);
		} else if (commitmentOrConfig) {
			localCommitment = normalizeCommitment(commitmentOrConfig.commitment);
			minContextSlot = toBigInt(commitmentOrConfig.minContextSlot);
			dataSlice = commitmentOrConfig.dataSlice;
		}

		const requestOptions: Record<string, unknown> = {
			commitment: (localCommitment ?? this.commitment ?? DEFAULT_COMMITMENT) as KitCommitment,
			encoding: 'base64',
		};
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}
		if (dataSlice) {
			requestOptions.dataSlice = {
				length: dataSlice.length,
				offset: dataSlice.offset,
			};
		}

		const response = await this.#client.rpc.getMultipleAccounts(addresses, requestOptions as never).send();

		const context = response.context as { slot: number | bigint; apiVersion?: string };
		const values = response.value as readonly (RpcAccount | null)[];

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: values.map((account) => {
				if (!account) return null;
				return toAccountInfo(fromKitAccount(account), dataSlice);
			}),
		};
	}

	async getTokenAccountsByOwner(
		ownerAddress: PublicKey,
		filter: TokenAccountsFilter,
		commitmentOrConfig?: LegacyCommitment | GetTokenAccountsByOwnerConfig,
	): Promise<RpcResponseAndContext<Array<{ account: AccountInfo<Buffer>; pubkey: PublicKey }>>> {
		const owner = toKitAddressFromInput(ownerAddress);

		let localCommitment: NormalizedCommitment | undefined;
		let minContextSlot: bigint | undefined;
		let encoding: 'base64' | 'jsonParsed' = 'base64';

		if (typeof commitmentOrConfig === 'string') {
			localCommitment = normalizeCommitment(commitmentOrConfig);
		} else if (commitmentOrConfig) {
			localCommitment = normalizeCommitment(commitmentOrConfig.commitment);
			minContextSlot = toBigInt(commitmentOrConfig.minContextSlot);
			if (commitmentOrConfig.encoding) {
				encoding = commitmentOrConfig.encoding;
			}
		}

		const filterParam: Record<string, string> = {};
		if ('mint' in filter) {
			filterParam.mint = filter.mint.toBase58();
		} else if ('programId' in filter) {
			filterParam.programId = filter.programId.toBase58();
		}

		const requestOptions: Record<string, unknown> = {
			commitment: (localCommitment ?? this.commitment ?? DEFAULT_COMMITMENT) as KitCommitment,
			encoding,
		};
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}

		const response = await this.#client.rpc
			.getTokenAccountsByOwner(owner, filterParam as never, requestOptions as never)
			.send();

		const context = response.context as { slot: number | bigint; apiVersion?: string };
		const values = response.value as unknown as readonly ProgramAccountWire[];

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: values.map((entry) => ({
				account: toAccountInfo(fromKitAccount(entry.account)),
				pubkey: new PublicKey(entry.pubkey),
			})),
		};
	}

	async getTokenAccountBalance(
		tokenAddress: PublicKey,
		commitment?: LegacyCommitment,
	): Promise<RpcResponseAndContext<TokenAmount>> {
		const address = toKitAddressFromInput(tokenAddress);
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const response = await this.#client.rpc
			.getTokenAccountBalance(address, { commitment: chosenCommitment as KitCommitment })
			.send();

		const context = response.context as { slot: number | bigint; apiVersion?: string };
		const value = response.value as {
			amount: string;
			decimals: number;
			uiAmount: number | null;
			uiAmountString?: string;
		};

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: {
				amount: value.amount,
				decimals: value.decimals,
				uiAmount: value.uiAmount,
				uiAmountString: value.uiAmountString ?? String(value.uiAmount ?? '0'),
			},
		};
	}

	async sendTransaction(
		transaction: Transaction | VersionedTransaction,
		signersOrOptions?: Signer[] | SendOptions,
		options?: SendOptions,
	): Promise<TransactionSignature> {
		const tx = transaction;
		let sendOptions: SendOptions | undefined;

		if (Array.isArray(signersOrOptions)) {
			// Legacy Transaction with signers
			if (tx instanceof Transaction) {
				if (signersOrOptions.length > 0) {
					tx.sign(...signersOrOptions);
				}
			}
			sendOptions = options;
		} else {
			sendOptions = signersOrOptions;
		}

		return this.sendRawTransaction(tx, sendOptions);
	}

	async getTransaction(
		signature: string,
		rawConfig?: GetTransactionConfig | GetVersionedTransactionConfig,
	): Promise<TransactionResponse | VersionedTransactionResponse | null> {
		const config = rawConfig ?? {};
		const commitment = normalizeCommitment(config.commitment as LegacyCommitment) ?? this.commitment;
		const finalCommitment = commitment === 'processed' ? 'confirmed' : (commitment ?? 'confirmed');

		const requestOptions: Record<string, unknown> = {
			commitment: finalCommitment as KitCommitment,
			encoding: 'json',
		};
		if (config.maxSupportedTransactionVersion !== undefined) {
			requestOptions.maxSupportedTransactionVersion = config.maxSupportedTransactionVersion;
		}

		const response = await this.#client.rpc
			.getTransaction(signature as unknown as Signature, requestOptions as never)
			.send();

		if (!response) {
			return null;
		}

		const tx = response as unknown as KitTransactionResponse;
		return this.#mapTransactionResponse(tx);
	}

	#mapTransactionResponse(tx: KitTransactionResponse): TransactionResponse | VersionedTransactionResponse {
		const meta = tx.meta
			? {
					err: tx.meta.err,
					fee: typeof tx.meta.fee === 'bigint' ? Number(tx.meta.fee) : tx.meta.fee,
					innerInstructions: tx.meta.innerInstructions as TransactionResponse['meta'] extends infer M
						? M extends { innerInstructions: infer I }
							? I
							: null
						: null,
					loadedAddresses: tx.meta.loadedAddresses
						? {
								readonly: tx.meta.loadedAddresses.readonly.map((addr) => new PublicKey(addr)),
								writable: tx.meta.loadedAddresses.writable.map((addr) => new PublicKey(addr)),
							}
						: undefined,
					logMessages: tx.meta.logMessages as string[] | null,
					postBalances: tx.meta.postBalances.map((b) => (typeof b === 'bigint' ? Number(b) : b)),
					postTokenBalances: tx.meta.postTokenBalances as TransactionResponse['meta'] extends infer M
						? M extends { postTokenBalances: infer T }
							? T
							: null
						: null,
					preBalances: tx.meta.preBalances.map((b) => (typeof b === 'bigint' ? Number(b) : b)),
					preTokenBalances: tx.meta.preTokenBalances as TransactionResponse['meta'] extends infer M
						? M extends { preTokenBalances: infer T }
							? T
							: null
						: null,
					rewards: tx.meta.rewards as TransactionResponse['meta'] extends infer M
						? M extends { rewards: infer R }
							? R
							: null
						: null,
					computeUnitsConsumed:
						tx.meta.computeUnitsConsumed !== undefined
							? typeof tx.meta.computeUnitsConsumed === 'bigint'
								? Number(tx.meta.computeUnitsConsumed)
								: tx.meta.computeUnitsConsumed
							: undefined,
				}
			: null;

		return {
			blockTime:
				tx.blockTime !== null ? (typeof tx.blockTime === 'bigint' ? Number(tx.blockTime) : tx.blockTime) : null,
			meta,
			slot: typeof tx.slot === 'bigint' ? Number(tx.slot) : tx.slot,
			transaction: tx.transaction as TransactionResponse['transaction'],
			version: tx.version,
		} as TransactionResponse | VersionedTransactionResponse;
	}

	async getSignaturesForAddress(
		address: PublicKey,
		options?: SignaturesForAddressOptions,
		commitment?: Finality,
	): Promise<ConfirmedSignatureInfo[]> {
		const addr = toKitAddressFromInput(address);
		const chosenCommitment = normalizeCommitment(commitment as LegacyCommitment) ?? this.commitment;
		const finalCommitment = chosenCommitment === 'processed' ? 'confirmed' : (chosenCommitment ?? 'confirmed');

		const requestOptions: Record<string, unknown> = {
			commitment: finalCommitment as KitCommitment,
		};
		if (options?.limit !== undefined) {
			requestOptions.limit = options.limit;
		}
		if (options?.before !== undefined) {
			requestOptions.before = options.before;
		}
		if (options?.until !== undefined) {
			requestOptions.until = options.until;
		}
		if (options?.minContextSlot !== undefined) {
			requestOptions.minContextSlot = toBigInt(options.minContextSlot);
		}

		const response = await this.#client.rpc.getSignaturesForAddress(addr, requestOptions as never).send();

		const signatures = response as readonly KitSignatureInfo[];
		return signatures.map((sig) => ({
			blockTime:
				sig.blockTime !== null
					? typeof sig.blockTime === 'bigint'
						? Number(sig.blockTime)
						: sig.blockTime
					: null,
			confirmationStatus: sig.confirmationStatus as ConfirmedSignatureInfo['confirmationStatus'],
			err: sig.err as TransactionError | null,
			memo: sig.memo,
			signature: sig.signature,
			slot: typeof sig.slot === 'bigint' ? Number(sig.slot) : sig.slot,
		}));
	}

	async getSlot(
		commitmentOrConfig?: LegacyCommitment | { commitment?: LegacyCommitment; minContextSlot?: number },
	): Promise<number> {
		let localCommitment: NormalizedCommitment | undefined;
		let minContextSlot: bigint | undefined;

		if (typeof commitmentOrConfig === 'string') {
			localCommitment = normalizeCommitment(commitmentOrConfig);
		} else if (commitmentOrConfig) {
			localCommitment = normalizeCommitment(commitmentOrConfig.commitment);
			minContextSlot = toBigInt(commitmentOrConfig.minContextSlot);
		}

		const requestOptions: Record<string, unknown> = {
			commitment: (localCommitment ?? this.commitment ?? DEFAULT_COMMITMENT) as KitCommitment,
		};
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}

		const response = await this.#client.rpc.getSlot(requestOptions as never).send();
		return typeof response === 'bigint' ? Number(response) : (response as number);
	}

	async requestAirdrop(to: PublicKey, lamports: number): Promise<TransactionSignature> {
		const address = toKitAddressFromInput(to);
		// Cast through unknown since requestAirdrop is only available on devnet/testnet
		const rpc = this.#client.rpc as unknown as {
			requestAirdrop: (
				address: Address,
				lamports: bigint,
				config?: { commitment?: KitCommitment },
			) => { send: () => Promise<string> };
		};
		const response = await rpc
			.requestAirdrop(address, BigInt(lamports), {
				commitment: (this.commitment ?? DEFAULT_COMMITMENT) as KitCommitment,
			})
			.send();
		return response;
	}

	async getMinimumBalanceForRentExemption(dataLength: number, commitment?: LegacyCommitment): Promise<number> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const response = await this.#client.rpc
			.getMinimumBalanceForRentExemption(BigInt(dataLength), {
				commitment: chosenCommitment as KitCommitment,
			})
			.send();

		return typeof response === 'bigint' ? Number(response) : (response as number);
	}

	// ========== Phase 2: Block and Transaction History ==========

	async getBlock(slot: number, rawConfig?: GetBlockConfig): Promise<BlockResponse | VersionedBlockResponse | null> {
		const config = rawConfig ?? {};
		const commitment = normalizeCommitment(config.commitment as LegacyCommitment) ?? this.commitment;
		const finalCommitment = commitment === 'processed' ? 'confirmed' : (commitment ?? 'confirmed');

		const requestOptions: Record<string, unknown> = {
			commitment: finalCommitment as KitCommitment,
			encoding: 'json',
			transactionDetails: config.transactionDetails ?? 'full',
		};
		if (config.maxSupportedTransactionVersion !== undefined) {
			requestOptions.maxSupportedTransactionVersion = config.maxSupportedTransactionVersion;
		}
		if (config.rewards !== undefined) {
			requestOptions.rewards = config.rewards;
		}

		const response = await this.#client.rpc.getBlock(BigInt(slot), requestOptions as never).send();

		if (!response) {
			return null;
		}

		const block = response as unknown as KitBlockResponse;
		return {
			blockHeight:
				block.blockHeight !== null
					? typeof block.blockHeight === 'bigint'
						? Number(block.blockHeight)
						: block.blockHeight
					: null,
			blockTime:
				block.blockTime !== null
					? typeof block.blockTime === 'bigint'
						? Number(block.blockTime)
						: block.blockTime
					: null,
			blockhash: block.blockhash,
			parentSlot: typeof block.parentSlot === 'bigint' ? Number(block.parentSlot) : block.parentSlot,
			previousBlockhash: block.previousBlockhash,
			rewards: block.rewards as BlockResponse['rewards'],
			transactions: block.transactions as BlockResponse['transactions'],
		} as BlockResponse | VersionedBlockResponse;
	}

	async getBlockTime(slot: number): Promise<number | null> {
		const response = await this.#client.rpc.getBlockTime(BigInt(slot)).send();
		if (response === null) {
			return null;
		}
		return typeof response === 'bigint' ? Number(response) : (response as number);
	}

	async getBlockHeight(commitment?: LegacyCommitment): Promise<number> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const response = await this.#client.rpc
			.getBlockHeight({ commitment: chosenCommitment as KitCommitment })
			.send();
		return typeof response === 'bigint' ? Number(response) : (response as number);
	}

	async getBlocks(startSlot: number, endSlot?: number, commitment?: Finality): Promise<number[]> {
		const chosenCommitment = normalizeCommitment(commitment as LegacyCommitment) ?? this.commitment;
		const finalCommitment = chosenCommitment === 'processed' ? 'confirmed' : (chosenCommitment ?? 'confirmed');

		const response = await this.#client.rpc
			.getBlocks(BigInt(startSlot), endSlot !== undefined ? BigInt(endSlot) : undefined, {
				commitment: finalCommitment as KitCommitment,
			} as never)
			.send();

		return (response as readonly (number | bigint)[]).map((slot) =>
			typeof slot === 'bigint' ? Number(slot) : slot,
		);
	}

	async getBlockSignatures(slot: number, commitment?: Finality): Promise<BlockSignatures> {
		const chosenCommitment = normalizeCommitment(commitment as LegacyCommitment) ?? this.commitment;
		const finalCommitment = chosenCommitment === 'processed' ? 'confirmed' : (chosenCommitment ?? 'confirmed');

		const response = await this.#client.rpc
			.getBlock(BigInt(slot), {
				commitment: finalCommitment as KitCommitment,
				transactionDetails: 'signatures',
				rewards: false,
			} as never)
			.send();

		if (!response) {
			throw new Error(`Block not found: ${slot}`);
		}

		const block = response as unknown as KitBlockResponse;
		return {
			blockTime:
				block.blockTime !== null
					? typeof block.blockTime === 'bigint'
						? Number(block.blockTime)
						: block.blockTime
					: null,
			blockhash: block.blockhash,
			parentSlot: typeof block.parentSlot === 'bigint' ? Number(block.parentSlot) : block.parentSlot,
			previousBlockhash: block.previousBlockhash,
			signatures: (block.signatures ?? []) as string[],
		};
	}

	async isBlockhashValid(blockhash: string, commitment?: LegacyCommitment): Promise<RpcResponseAndContext<boolean>> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const response = await this.#client.rpc
			.isBlockhashValid(blockhash as never, { commitment: chosenCommitment as KitCommitment })
			.send();

		const context = response.context as { slot: number | bigint; apiVersion?: string };
		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: response.value as boolean,
		};
	}

	async getFeeForMessage(
		message: string,
		commitment?: LegacyCommitment,
	): Promise<RpcResponseAndContext<number | null>> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const response = await this.#client.rpc
			.getFeeForMessage(message as never, { commitment: chosenCommitment as KitCommitment })
			.send();

		const context = response.context as { slot: number | bigint; apiVersion?: string };
		const value = response.value as number | bigint | null;

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: value !== null ? (typeof value === 'bigint' ? Number(value) : value) : null,
		};
	}

	async getRecentPrioritizationFees(lockedWritableAccounts?: PublicKey[]): Promise<RecentPrioritizationFees[]> {
		const addresses = lockedWritableAccounts?.map((pk) => toKitAddressFromInput(pk));

		const response = await this.#client.rpc.getRecentPrioritizationFees(addresses as never).send();

		return (response as readonly { prioritizationFee: number | bigint; slot: number | bigint }[]).map((fee) => ({
			prioritizationFee:
				typeof fee.prioritizationFee === 'bigint' ? Number(fee.prioritizationFee) : fee.prioritizationFee,
			slot: typeof fee.slot === 'bigint' ? Number(fee.slot) : fee.slot,
		}));
	}

	async getAccountInfoAndContext<TAccountData = Buffer>(
		publicKey: PublicKey | string,
		commitmentOrConfig?: AccountInfoConfig | LegacyCommitment,
	): Promise<RpcResponseAndContext<AccountInfo<TAccountData> | null>> {
		const address = toKitAddressFromInput(publicKey);
		let localCommitment: NormalizedCommitment | undefined;
		let minContextSlot: bigint | undefined;
		let dataSlice: DataSlice | undefined;
		let encoding: 'base64' | undefined;
		if (typeof commitmentOrConfig === 'string') {
			localCommitment = normalizeCommitment(commitmentOrConfig);
		} else if (commitmentOrConfig) {
			localCommitment = normalizeCommitment(commitmentOrConfig.commitment);
			if (commitmentOrConfig.minContextSlot !== undefined) {
				minContextSlot = toBigInt(commitmentOrConfig.minContextSlot);
			}
			dataSlice = commitmentOrConfig.dataSlice;
			encoding = commitmentOrConfig.encoding;
		}

		const requestOptions: Record<string, unknown> = {
			commitment: (localCommitment ?? this.commitment ?? DEFAULT_COMMITMENT) as KitCommitment,
		};
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}
		if (encoding) {
			requestOptions.encoding = encoding;
		}
		if (dataSlice) {
			requestOptions.dataSlice = {
				length: dataSlice.length,
				offset: dataSlice.offset,
			};
		}

		const response = await this.#client.rpc.getAccountInfo(address, requestOptions as never).send();
		const context = response.context as { slot: number | bigint; apiVersion?: string };

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: !response.value
				? null
				: (toAccountInfo(fromKitAccount(response.value), dataSlice) as AccountInfo<TAccountData>),
		};
	}

	async getBalanceAndContext(
		publicKey: PublicKey | string,
		commitment?: LegacyCommitment,
	): Promise<RpcResponseAndContext<number>> {
		const address = toKitAddressFromInput(publicKey);
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const result = await this.#client.rpc
			.getBalance(address, { commitment: chosenCommitment as KitCommitment })
			.send();

		const context = result.context as { slot: number | bigint; apiVersion?: string };
		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: typeof result.value === 'number' ? result.value : Number(result.value),
		};
	}

	async getLatestBlockhashAndContext(
		commitmentOrConfig?:
			| LegacyCommitment
			| {
					commitment?: LegacyCommitment;
					minContextSlot?: number;
			  },
	): Promise<RpcResponseAndContext<{ blockhash: string; lastValidBlockHeight: number }>> {
		const baseCommitment =
			typeof commitmentOrConfig === 'string' ? commitmentOrConfig : commitmentOrConfig?.commitment;
		const commitment = normalizeCommitment(baseCommitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const minContextSlot =
			typeof commitmentOrConfig === 'object' ? toBigInt(commitmentOrConfig?.minContextSlot) : undefined;

		const requestOptions: Record<string, unknown> = {
			commitment: commitment as KitCommitment,
		};
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}

		const response = await this.#client.rpc.getLatestBlockhash(requestOptions as never).send();
		const context = response.context as { slot: number | bigint; apiVersion?: string };

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: {
				blockhash: response.value.blockhash,
				lastValidBlockHeight: Number(response.value.lastValidBlockHeight),
			},
		};
	}

	// ========== Phase 4-7: Slot, Epoch, Cluster, Stake, Inflation, Misc ==========

	async getSlotLeader(commitment?: LegacyCommitment): Promise<string> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const response = await this.#client.rpc.getSlotLeader({ commitment: chosenCommitment as KitCommitment }).send();
		return response as string;
	}

	async getSlotLeaders(startSlot: number, limit: number): Promise<PublicKey[]> {
		const response = await this.#client.rpc.getSlotLeaders(BigInt(startSlot), limit).send();
		return (response as readonly string[]).map((addr) => new PublicKey(addr));
	}

	async getEpochInfo(commitment?: LegacyCommitment): Promise<EpochInfo> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const response = await this.#client.rpc.getEpochInfo({ commitment: chosenCommitment as KitCommitment }).send();

		const info = response as {
			absoluteSlot: number | bigint;
			blockHeight: number | bigint;
			epoch: number | bigint;
			slotIndex: number | bigint;
			slotsInEpoch: number | bigint;
			transactionCount?: number | bigint;
		};

		return {
			absoluteSlot: typeof info.absoluteSlot === 'bigint' ? Number(info.absoluteSlot) : info.absoluteSlot,
			blockHeight: typeof info.blockHeight === 'bigint' ? Number(info.blockHeight) : info.blockHeight,
			epoch: typeof info.epoch === 'bigint' ? Number(info.epoch) : info.epoch,
			slotIndex: typeof info.slotIndex === 'bigint' ? Number(info.slotIndex) : info.slotIndex,
			slotsInEpoch: typeof info.slotsInEpoch === 'bigint' ? Number(info.slotsInEpoch) : info.slotsInEpoch,
			transactionCount:
				info.transactionCount !== undefined
					? typeof info.transactionCount === 'bigint'
						? Number(info.transactionCount)
						: info.transactionCount
					: undefined,
		};
	}

	async getEpochSchedule(): Promise<{
		firstNormalEpoch: number;
		firstNormalSlot: number;
		leaderScheduleSlotOffset: number;
		slotsPerEpoch: number;
		warmup: boolean;
	}> {
		const response = await this.#client.rpc.getEpochSchedule().send();
		const schedule = response as {
			firstNormalEpoch: number | bigint;
			firstNormalSlot: number | bigint;
			leaderScheduleSlotOffset: number | bigint;
			slotsPerEpoch: number | bigint;
			warmup: boolean;
		};

		return {
			firstNormalEpoch:
				typeof schedule.firstNormalEpoch === 'bigint'
					? Number(schedule.firstNormalEpoch)
					: schedule.firstNormalEpoch,
			firstNormalSlot:
				typeof schedule.firstNormalSlot === 'bigint'
					? Number(schedule.firstNormalSlot)
					: schedule.firstNormalSlot,
			leaderScheduleSlotOffset:
				typeof schedule.leaderScheduleSlotOffset === 'bigint'
					? Number(schedule.leaderScheduleSlotOffset)
					: schedule.leaderScheduleSlotOffset,
			slotsPerEpoch:
				typeof schedule.slotsPerEpoch === 'bigint' ? Number(schedule.slotsPerEpoch) : schedule.slotsPerEpoch,
			warmup: schedule.warmup,
		};
	}

	async getLeaderSchedule(slot?: number, commitment?: LegacyCommitment): Promise<LeaderSchedule | null> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const response = await this.#client.rpc
			.getLeaderSchedule(slot !== undefined ? BigInt(slot) : (undefined as never), {
				commitment: chosenCommitment as KitCommitment,
			} as never)
			.send();

		if (!response) {
			return null;
		}

		const schedule = response as Record<string, readonly (number | bigint)[]>;
		const result: LeaderSchedule = {};
		for (const [leader, slots] of Object.entries(schedule)) {
			result[leader] = slots.map((s) => (typeof s === 'bigint' ? Number(s) : s));
		}
		return result;
	}

	async getClusterNodes(): Promise<ContactInfo[]> {
		const response = await this.#client.rpc.getClusterNodes().send();
		return response as unknown as ContactInfo[];
	}

	async getVoteAccounts(commitment?: LegacyCommitment): Promise<VoteAccountStatus> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const response = await this.#client.rpc
			.getVoteAccounts({ commitment: chosenCommitment as KitCommitment })
			.send();

		const result = response as {
			current: readonly unknown[];
			delinquent: readonly unknown[];
		};

		const mapVoteAccount = (account: Record<string, unknown>) => ({
			...account,
			activatedStake:
				typeof account.activatedStake === 'bigint' ? Number(account.activatedStake) : account.activatedStake,
			lastVote: typeof account.lastVote === 'bigint' ? Number(account.lastVote) : account.lastVote,
			rootSlot: typeof account.rootSlot === 'bigint' ? Number(account.rootSlot) : account.rootSlot,
		});

		return {
			current: result.current.map((a) => mapVoteAccount(a as Record<string, unknown>)),
			delinquent: result.delinquent.map((a) => mapVoteAccount(a as Record<string, unknown>)),
		} as unknown as VoteAccountStatus;
	}

	async getVersion(): Promise<Version> {
		const response = await this.#client.rpc.getVersion().send();
		return response as unknown as Version;
	}

	async getHealth(): Promise<string> {
		const response = await this.#client.rpc.getHealth().send();
		return response as string;
	}

	async getSupply(commitment?: LegacyCommitment): Promise<RpcResponseAndContext<Supply>> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const response = await this.#client.rpc.getSupply({ commitment: chosenCommitment as KitCommitment }).send();

		const context = response.context as { slot: number | bigint };
		const value = response.value as {
			circulating: number | bigint;
			nonCirculating: number | bigint;
			nonCirculatingAccounts: readonly string[];
			total: number | bigint;
		};

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: {
				circulating: typeof value.circulating === 'bigint' ? Number(value.circulating) : value.circulating,
				nonCirculating:
					typeof value.nonCirculating === 'bigint' ? Number(value.nonCirculating) : value.nonCirculating,
				nonCirculatingAccounts: value.nonCirculatingAccounts.map((addr) => new PublicKey(addr)),
				total: typeof value.total === 'bigint' ? Number(value.total) : value.total,
			},
		};
	}

	async getTokenSupply(
		tokenMintAddress: PublicKey,
		commitment?: LegacyCommitment,
	): Promise<RpcResponseAndContext<TokenAmount>> {
		const address = toKitAddressFromInput(tokenMintAddress);
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const response = await this.#client.rpc
			.getTokenSupply(address, { commitment: chosenCommitment as KitCommitment })
			.send();

		const context = response.context as { slot: number | bigint };
		const value = response.value as {
			amount: string;
			decimals: number;
			uiAmount: number | null;
			uiAmountString?: string;
		};

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: {
				amount: value.amount,
				decimals: value.decimals,
				uiAmount: value.uiAmount,
				uiAmountString: value.uiAmountString ?? String(value.uiAmount ?? '0'),
			},
		};
	}

	async getLargestAccounts(config?: {
		commitment?: LegacyCommitment;
		filter?: 'circulating' | 'nonCirculating';
	}): Promise<RpcResponseAndContext<Array<{ address: PublicKey; lamports: number }>>> {
		const chosenCommitment = normalizeCommitment(config?.commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const requestOptions: Record<string, unknown> = {
			commitment: chosenCommitment as KitCommitment,
		};
		if (config?.filter) {
			requestOptions.filter = config.filter;
		}

		const response = await this.#client.rpc.getLargestAccounts(requestOptions as never).send();
		const context = response.context as { slot: number | bigint };
		const values = response.value as readonly { address: string; lamports: number | bigint }[];

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: values.map((v) => ({
				address: new PublicKey(v.address),
				lamports: typeof v.lamports === 'bigint' ? Number(v.lamports) : v.lamports,
			})),
		};
	}

	async getTokenLargestAccounts(
		mintAddress: PublicKey,
		commitment?: LegacyCommitment,
	): Promise<
		RpcResponseAndContext<
			Array<{
				address: PublicKey;
				amount: string;
				decimals: number;
				uiAmount: number | null;
				uiAmountString: string;
			}>
		>
	> {
		const address = toKitAddressFromInput(mintAddress);
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const response = await this.#client.rpc
			.getTokenLargestAccounts(address, { commitment: chosenCommitment as KitCommitment })
			.send();

		const context = response.context as { slot: number | bigint };
		const values = response.value as readonly {
			address: string;
			amount: string;
			decimals: number;
			uiAmount: number | null;
			uiAmountString?: string;
		}[];

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: values.map((v) => ({
				address: new PublicKey(v.address),
				amount: v.amount,
				decimals: v.decimals,
				uiAmount: v.uiAmount,
				uiAmountString: v.uiAmountString ?? String(v.uiAmount ?? '0'),
			})),
		};
	}

	async getInflationGovernor(commitment?: LegacyCommitment): Promise<InflationGovernor> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const response = await this.#client.rpc
			.getInflationGovernor({ commitment: chosenCommitment as KitCommitment })
			.send();
		return response as unknown as InflationGovernor;
	}

	async getInflationRate(): Promise<InflationRate> {
		const response = await this.#client.rpc.getInflationRate().send();
		const rate = response as {
			epoch: number | bigint;
			foundation: number;
			total: number;
			validator: number;
		};
		return {
			epoch: typeof rate.epoch === 'bigint' ? Number(rate.epoch) : rate.epoch,
			foundation: rate.foundation,
			total: rate.total,
			validator: rate.validator,
		};
	}

	async getInflationReward(
		addresses: PublicKey[],
		epoch?: number,
		commitment?: LegacyCommitment,
	): Promise<(InflationReward | null)[]> {
		const addrs = addresses.map((pk) => toKitAddressFromInput(pk));
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const requestOptions: Record<string, unknown> = {
			commitment: chosenCommitment as KitCommitment,
		};
		if (epoch !== undefined) {
			requestOptions.epoch = BigInt(epoch);
		}

		const response = await this.#client.rpc.getInflationReward(addrs, requestOptions as never).send();

		return (response as readonly (Record<string, unknown> | null)[]).map((reward) => {
			if (!reward) return null;
			return {
				amount: typeof reward.amount === 'bigint' ? Number(reward.amount) : (reward.amount as number),
				effectiveSlot:
					typeof reward.effectiveSlot === 'bigint'
						? Number(reward.effectiveSlot)
						: (reward.effectiveSlot as number),
				epoch: typeof reward.epoch === 'bigint' ? Number(reward.epoch) : (reward.epoch as number),
				postBalance:
					typeof reward.postBalance === 'bigint'
						? Number(reward.postBalance)
						: (reward.postBalance as number),
				commission: reward.commission as number | undefined,
			} as InflationReward;
		});
	}

	async getStakeMinimumDelegation(commitment?: LegacyCommitment): Promise<RpcResponseAndContext<number>> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const response = await this.#client.rpc
			.getStakeMinimumDelegation({ commitment: chosenCommitment as KitCommitment })
			.send();

		const context = response.context as { slot: number | bigint };
		const value = response.value as number | bigint;

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: typeof value === 'bigint' ? Number(value) : value,
		};
	}

	async getFirstAvailableBlock(): Promise<number> {
		const response = await this.#client.rpc.getFirstAvailableBlock().send();
		return typeof response === 'bigint' ? Number(response) : (response as number);
	}

	async getTransactionCount(commitment?: LegacyCommitment): Promise<number> {
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;
		const response = await this.#client.rpc
			.getTransactionCount({ commitment: chosenCommitment as KitCommitment })
			.send();
		return typeof response === 'bigint' ? Number(response) : (response as number);
	}

	async getGenesisHash(): Promise<string> {
		const response = await this.#client.rpc.getGenesisHash().send();
		return response as string;
	}

	async getRecentPerformanceSamples(limit?: number): Promise<PerfSample[]> {
		const response = await this.#client.rpc.getRecentPerformanceSamples(limit as never).send();

		return (response as readonly Record<string, unknown>[]).map((sample) => ({
			numSlots: typeof sample.numSlots === 'bigint' ? Number(sample.numSlots) : (sample.numSlots as number),
			numTransactions:
				typeof sample.numTransactions === 'bigint'
					? Number(sample.numTransactions)
					: (sample.numTransactions as number),
			numNonVoteTransactions:
				sample.numNonVoteTransactions !== undefined
					? typeof sample.numNonVoteTransactions === 'bigint'
						? Number(sample.numNonVoteTransactions)
						: (sample.numNonVoteTransactions as number)
					: undefined,
			samplePeriodSecs: sample.samplePeriodSecs as number,
			slot: typeof sample.slot === 'bigint' ? Number(sample.slot) : (sample.slot as number),
		})) as PerfSample[];
	}

	async getMinimumLedgerSlot(): Promise<number> {
		const response = await this.#client.rpc.minimumLedgerSlot().send();
		return typeof response === 'bigint' ? Number(response) : (response as number);
	}

	async getBlockProduction(config?: {
		commitment?: LegacyCommitment;
		range?: { firstSlot: number; lastSlot?: number };
		identity?: string;
	}): Promise<RpcResponseAndContext<BlockProduction>> {
		const chosenCommitment = normalizeCommitment(config?.commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const requestOptions: Record<string, unknown> = {
			commitment: chosenCommitment as KitCommitment,
		};
		if (config?.range) {
			requestOptions.range = {
				firstSlot: BigInt(config.range.firstSlot),
				lastSlot: config.range.lastSlot !== undefined ? BigInt(config.range.lastSlot) : undefined,
			};
		}
		if (config?.identity) {
			requestOptions.identity = config.identity;
		}

		const response = await this.#client.rpc.getBlockProduction(requestOptions as never).send();
		const context = response.context as { slot: number | bigint };
		const value = response.value as {
			byIdentity: Record<string, readonly [number | bigint, number | bigint]>;
			range: { firstSlot: number | bigint; lastSlot: number | bigint };
		};

		const byIdentity: Record<string, [number, number]> = {};
		for (const [identity, [leaderSlots, blocksProduced]] of Object.entries(value.byIdentity)) {
			byIdentity[identity] = [
				typeof leaderSlots === 'bigint' ? Number(leaderSlots) : leaderSlots,
				typeof blocksProduced === 'bigint' ? Number(blocksProduced) : blocksProduced,
			];
		}

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: {
				byIdentity,
				range: {
					firstSlot:
						typeof value.range.firstSlot === 'bigint'
							? Number(value.range.firstSlot)
							: value.range.firstSlot,
					lastSlot:
						typeof value.range.lastSlot === 'bigint' ? Number(value.range.lastSlot) : value.range.lastSlot,
				},
			},
		};
	}

	// ========== Phase 3: Parsed Methods ==========

	async getParsedAccountInfo(
		publicKey: PublicKey | string,
		commitmentOrConfig?: LegacyCommitment | GetParsedAccountInfoConfig,
	): Promise<RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData> | null>> {
		const address = toKitAddressFromInput(publicKey);
		const commitment =
			typeof commitmentOrConfig === 'string'
				? normalizeCommitment(commitmentOrConfig)
				: normalizeCommitment(commitmentOrConfig?.commitment);
		const chosenCommitment = commitment ?? this.commitment ?? DEFAULT_COMMITMENT;
		const minContextSlot =
			typeof commitmentOrConfig === 'object' ? toBigInt(commitmentOrConfig?.minContextSlot) : undefined;

		const requestOptions: Record<string, unknown> = {
			commitment: chosenCommitment as KitCommitment,
			encoding: 'jsonParsed',
		};
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}

		const response = await this.#client.rpc.getAccountInfo(address, requestOptions as never).send();
		const context = response.context as { slot: number | bigint };
		const value = response.value as unknown;

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: value === null ? null : toParsedAccountInfo(value),
		};
	}

	async getMultipleParsedAccounts(
		publicKeys: PublicKey[],
		commitmentOrConfig?: LegacyCommitment | GetMultipleParsedAccountsConfig,
	): Promise<RpcResponseAndContext<(AccountInfo<Buffer | ParsedAccountData> | null)[]>> {
		const addresses = publicKeys.map((pk) => toKitAddressFromInput(pk));
		const commitment =
			typeof commitmentOrConfig === 'string'
				? normalizeCommitment(commitmentOrConfig)
				: normalizeCommitment(commitmentOrConfig?.commitment);
		const chosenCommitment = commitment ?? this.commitment ?? DEFAULT_COMMITMENT;
		const minContextSlot =
			typeof commitmentOrConfig === 'object' ? toBigInt(commitmentOrConfig?.minContextSlot) : undefined;

		const requestOptions: Record<string, unknown> = {
			commitment: chosenCommitment as KitCommitment,
			encoding: 'jsonParsed',
		};
		if (minContextSlot !== undefined) {
			requestOptions.minContextSlot = minContextSlot;
		}

		const response = await this.#client.rpc.getMultipleAccounts(addresses, requestOptions as never).send();
		const context = response.context as { slot: number | bigint };
		const values = response.value as readonly (unknown | null)[];

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: values.map((account) => (account === null ? null : toParsedAccountInfo(account))),
		};
	}

	async getParsedProgramAccounts(
		programId: PublicKey,
		configOrCommitment?: GetParsedProgramAccountsConfig | LegacyCommitment,
	): Promise<
		{
			account: AccountInfo<Buffer | ParsedAccountData>;
			pubkey: PublicKey;
		}[]
	> {
		const programAddress = toKitAddressFromInput(programId);
		const config = typeof configOrCommitment === 'string' ? { commitment: configOrCommitment } : configOrCommitment;
		const chosenCommitment = normalizeCommitment(config?.commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const requestOptions: Record<string, unknown> = {
			commitment: chosenCommitment as KitCommitment,
			encoding: 'jsonParsed',
		};

		if (config?.filters) {
			requestOptions.filters = config.filters;
		}
		if (config?.minContextSlot !== undefined) {
			requestOptions.minContextSlot = toBigInt(config.minContextSlot);
		}

		const response = await this.#client.rpc.getProgramAccounts(programAddress, requestOptions as never).send();
		const accounts = response as unknown as readonly { account: unknown; pubkey: string }[];

		return accounts.map((item) => ({
			account: toParsedAccountInfo(item.account),
			pubkey: new PublicKey(item.pubkey),
		}));
	}

	async getParsedTokenAccountsByOwner(
		ownerAddress: PublicKey,
		filter: TokenAccountsFilter,
		commitment?: LegacyCommitment,
	): Promise<
		RpcResponseAndContext<
			{
				account: AccountInfo<ParsedAccountData>;
				pubkey: PublicKey;
			}[]
		>
	> {
		const owner = toKitAddressFromInput(ownerAddress);
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const filterArg =
			'mint' in filter
				? { mint: toKitAddressFromInput(filter.mint) }
				: { programId: toKitAddressFromInput(filter.programId) };

		const requestOptions: Record<string, unknown> = {
			commitment: chosenCommitment as KitCommitment,
			encoding: 'jsonParsed',
		};

		const response = await this.#client.rpc
			.getTokenAccountsByOwner(owner, filterArg, requestOptions as never)
			.send();
		const context = (response as { context: { slot: number | bigint } }).context;
		const accounts = (response as { value: readonly { account: unknown; pubkey: string }[] }).value;

		return {
			context: {
				slot: typeof context.slot === 'bigint' ? Number(context.slot) : context.slot,
			},
			value: accounts.map((item) => ({
				account: toParsedAccountInfo(item.account) as AccountInfo<ParsedAccountData>,
				pubkey: new PublicKey(item.pubkey),
			})),
		};
	}

	async getParsedTransaction(
		signature: TransactionSignature,
		commitmentOrConfig?: GetParsedTransactionConfig | Finality,
	): Promise<ParsedTransactionWithMeta | null> {
		const config = typeof commitmentOrConfig === 'string' ? { commitment: commitmentOrConfig } : commitmentOrConfig;
		const commitment = normalizeCommitment(config?.commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const requestOptions: Record<string, unknown> = {
			commitment: commitment as KitCommitment,
			encoding: 'jsonParsed',
			maxSupportedTransactionVersion: config?.maxSupportedTransactionVersion ?? 0,
		};

		const response = await this.#client.rpc.getTransaction(signature as Signature, requestOptions as never).send();

		if (!response) {
			return null;
		}

		// Return the parsed transaction as-is from RPC (it's already in web3.js format)
		return response as unknown as ParsedTransactionWithMeta;
	}

	async getParsedTransactions(
		signatures: TransactionSignature[],
		commitmentOrConfig?: GetParsedTransactionConfig | Finality,
	): Promise<(ParsedTransactionWithMeta | null)[]> {
		// Use Promise.all to fetch all transactions in parallel
		const results = await Promise.all(signatures.map((sig) => this.getParsedTransaction(sig, commitmentOrConfig)));
		return results;
	}

	async getParsedBlock(slot: number, rawConfig?: GetParsedBlockConfig): Promise<ParsedBlockResponse> {
		const commitment = normalizeCommitment(rawConfig?.commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		const requestOptions: Record<string, unknown> = {
			commitment: commitment as KitCommitment,
			encoding: 'jsonParsed',
			maxSupportedTransactionVersion: rawConfig?.maxSupportedTransactionVersion ?? 0,
			transactionDetails: rawConfig?.transactionDetails ?? 'full',
		};

		if (rawConfig?.rewards !== undefined) {
			requestOptions.rewards = rawConfig.rewards;
		}

		const response = await this.#client.rpc.getBlock(BigInt(slot), requestOptions as never).send();

		if (!response) {
			throw new Error(`Block ${slot} not found`);
		}

		const block = response as KitBlockResponse & { transactions?: readonly unknown[] };

		// Return the parsed block as-is from RPC (it's already in web3.js format when using jsonParsed encoding)
		return {
			blockHeight:
				block.blockHeight !== null && block.blockHeight !== undefined
					? typeof block.blockHeight === 'bigint'
						? Number(block.blockHeight)
						: block.blockHeight
					: null,
			blockTime:
				block.blockTime !== null && block.blockTime !== undefined
					? typeof block.blockTime === 'bigint'
						? Number(block.blockTime)
						: block.blockTime
					: null,
			blockhash: block.blockhash,
			parentSlot: typeof block.parentSlot === 'bigint' ? Number(block.parentSlot) : block.parentSlot,
			previousBlockhash: block.previousBlockhash,
			rewards: block.rewards as ParsedBlockResponse['rewards'],
			transactions: block.transactions as ParsedBlockResponse['transactions'],
		} as ParsedBlockResponse;
	}

	// ========== WebSocket Subscription Methods ==========

	onAccountChange(publicKey: PublicKey, callback: AccountChangeCallback, commitment?: LegacyCommitment): number {
		const id = this.#nextSubscriptionId++;
		const address = toKitAddressFromInput(publicKey);
		const abortController = new AbortController();
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		(async () => {
			try {
				const notifications = await this.#client.rpcSubscriptions
					.accountNotifications(address, { commitment: chosenCommitment as KitCommitment })
					.subscribe({ abortSignal: abortController.signal });

				for await (const notification of notifications) {
					const value = notification.value as unknown;
					const context: Context = {
						slot:
							typeof notification.context.slot === 'bigint'
								? Number(notification.context.slot)
								: notification.context.slot,
					};
					const accountInfo = toAccountInfo(fromKitAccount(value));
					callback(accountInfo, context);
				}
			} catch {
				// Subscription ended or aborted
			}
		})();

		this.#subscriptions.set(id, { abort: () => abortController.abort() });
		return id;
	}

	removeAccountChangeListener(subscriptionId: number): Promise<void> {
		const entry = this.#subscriptions.get(subscriptionId);
		if (entry) {
			entry.abort();
			this.#subscriptions.delete(subscriptionId);
		}
		return Promise.resolve();
	}

	onProgramAccountChange(
		programId: PublicKey,
		callback: ProgramAccountChangeCallback,
		commitment?: LegacyCommitment,
		filters?: GetParsedProgramAccountsConfig['filters'],
	): number {
		const id = this.#nextSubscriptionId++;
		const programAddress = toKitAddressFromInput(programId);
		const abortController = new AbortController();
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		(async () => {
			try {
				const requestOptions: Record<string, unknown> = {
					commitment: chosenCommitment as KitCommitment,
					encoding: 'base64',
				};
				if (filters) {
					requestOptions.filters = filters;
				}

				const notifications = await this.#client.rpcSubscriptions
					.programNotifications(programAddress, requestOptions as never)
					.subscribe({ abortSignal: abortController.signal });

				for await (const notification of notifications) {
					const value = notification.value as { account: unknown; pubkey: string };
					const context: Context = {
						slot:
							typeof notification.context.slot === 'bigint'
								? Number(notification.context.slot)
								: notification.context.slot,
					};
					const keyedAccountInfo: KeyedAccountInfo = {
						accountId: new PublicKey(value.pubkey),
						accountInfo: toAccountInfo(fromKitAccount(value.account)),
					};
					callback(keyedAccountInfo, context);
				}
			} catch {
				// Subscription ended or aborted
			}
		})();

		this.#subscriptions.set(id, { abort: () => abortController.abort() });
		return id;
	}

	removeProgramAccountChangeListener(subscriptionId: number): Promise<void> {
		const entry = this.#subscriptions.get(subscriptionId);
		if (entry) {
			entry.abort();
			this.#subscriptions.delete(subscriptionId);
		}
		return Promise.resolve();
	}

	onSignature(
		signature: TransactionSignature,
		callback: SignatureResultCallback,
		commitment?: LegacyCommitment,
	): number {
		const id = this.#nextSubscriptionId++;
		const abortController = new AbortController();
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		(async () => {
			try {
				const notifications = await this.#client.rpcSubscriptions
					.signatureNotifications(signature as Signature, { commitment: chosenCommitment as KitCommitment })
					.subscribe({ abortSignal: abortController.signal });

				for await (const notification of notifications) {
					const context: Context = {
						slot:
							typeof notification.context.slot === 'bigint'
								? Number(notification.context.slot)
								: notification.context.slot,
					};
					const result = notification.value as { err: TransactionError | null };
					callback({ err: result.err }, context);
				}
			} catch {
				// Subscription ended or aborted
			}
		})();

		this.#subscriptions.set(id, { abort: () => abortController.abort() });
		return id;
	}

	onSignatureWithOptions(
		signature: TransactionSignature,
		callback: SignatureSubscriptionCallback,
		options?: SignatureSubscriptionOptions,
	): number {
		const id = this.#nextSubscriptionId++;
		const abortController = new AbortController();
		const chosenCommitment = normalizeCommitment(options?.commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		(async () => {
			try {
				const requestOptions: Record<string, unknown> = {
					commitment: chosenCommitment as KitCommitment,
				};
				if (options?.enableReceivedNotification) {
					requestOptions.enableReceivedNotification = true;
				}

				const notifications = await this.#client.rpcSubscriptions
					.signatureNotifications(signature as Signature, requestOptions as never)
					.subscribe({ abortSignal: abortController.signal });

				for await (const notification of notifications) {
					const context: Context = {
						slot:
							typeof notification.context.slot === 'bigint'
								? Number(notification.context.slot)
								: notification.context.slot,
					};
					const value = notification.value as { err?: TransactionError | null } | 'receivedSignature';
					if (value === 'receivedSignature') {
						callback({ type: 'received' }, context);
					} else {
						callback({ err: value.err ?? null }, context);
					}
				}
			} catch {
				// Subscription ended or aborted
			}
		})();

		this.#subscriptions.set(id, { abort: () => abortController.abort() });
		return id;
	}

	removeSignatureListener(subscriptionId: number): Promise<void> {
		const entry = this.#subscriptions.get(subscriptionId);
		if (entry) {
			entry.abort();
			this.#subscriptions.delete(subscriptionId);
		}
		return Promise.resolve();
	}

	onSlotChange(callback: SlotChangeCallback): number {
		const id = this.#nextSubscriptionId++;
		const abortController = new AbortController();

		(async () => {
			try {
				const notifications = await this.#client.rpcSubscriptions
					.slotNotifications()
					.subscribe({ abortSignal: abortController.signal });

				for await (const notification of notifications) {
					const slotInfo: SlotInfo = {
						parent:
							typeof notification.parent === 'bigint' ? Number(notification.parent) : notification.parent,
						root: typeof notification.root === 'bigint' ? Number(notification.root) : notification.root,
						slot: typeof notification.slot === 'bigint' ? Number(notification.slot) : notification.slot,
					};
					callback(slotInfo);
				}
			} catch {
				// Subscription ended or aborted
			}
		})();

		this.#subscriptions.set(id, { abort: () => abortController.abort() });
		return id;
	}

	removeSlotChangeListener(subscriptionId: number): Promise<void> {
		const entry = this.#subscriptions.get(subscriptionId);
		if (entry) {
			entry.abort();
			this.#subscriptions.delete(subscriptionId);
		}
		return Promise.resolve();
	}

	onSlotUpdate(callback: SlotUpdateCallback): number {
		const id = this.#nextSubscriptionId++;
		const abortController = new AbortController();

		(async () => {
			try {
				// Note: slotsUpdatesNotifications may not be available on all RPC endpoints
				const rpcSubscriptions = this.#client.rpcSubscriptions as unknown as {
					slotsUpdatesNotifications: () => {
						subscribe: (options: { abortSignal: AbortSignal }) => Promise<
							AsyncIterable<{
								slot: number | bigint;
								timestamp: number | bigint;
								type: string;
								parent?: number | bigint;
								stats?: unknown;
								err?: unknown;
							}>
						>;
					};
				};

				const notifications = await rpcSubscriptions
					.slotsUpdatesNotifications()
					.subscribe({ abortSignal: abortController.signal });

				for await (const notification of notifications) {
					const slotUpdate = {
						slot: typeof notification.slot === 'bigint' ? Number(notification.slot) : notification.slot,
						timestamp:
							typeof notification.timestamp === 'bigint'
								? Number(notification.timestamp)
								: notification.timestamp,
						type: notification.type,
					} as SlotUpdate;

					if (notification.parent !== undefined) {
						(slotUpdate as { parent?: number }).parent =
							typeof notification.parent === 'bigint' ? Number(notification.parent) : notification.parent;
					}
					if (notification.stats !== undefined) {
						(slotUpdate as { stats?: unknown }).stats = notification.stats;
					}
					if (notification.err !== undefined) {
						(slotUpdate as { err?: unknown }).err = notification.err;
					}
					callback(slotUpdate);
				}
			} catch {
				// Subscription ended or aborted
			}
		})();

		this.#subscriptions.set(id, { abort: () => abortController.abort() });
		return id;
	}

	removeSlotUpdateListener(subscriptionId: number): Promise<void> {
		const entry = this.#subscriptions.get(subscriptionId);
		if (entry) {
			entry.abort();
			this.#subscriptions.delete(subscriptionId);
		}
		return Promise.resolve();
	}

	onRootChange(callback: RootChangeCallback): number {
		const id = this.#nextSubscriptionId++;
		const abortController = new AbortController();

		(async () => {
			try {
				const notifications = await this.#client.rpcSubscriptions
					.rootNotifications()
					.subscribe({ abortSignal: abortController.signal });

				for await (const notification of notifications) {
					const root = typeof notification === 'bigint' ? Number(notification) : notification;
					callback(root as number);
				}
			} catch {
				// Subscription ended or aborted
			}
		})();

		this.#subscriptions.set(id, { abort: () => abortController.abort() });
		return id;
	}

	removeRootChangeListener(subscriptionId: number): Promise<void> {
		const entry = this.#subscriptions.get(subscriptionId);
		if (entry) {
			entry.abort();
			this.#subscriptions.delete(subscriptionId);
		}
		return Promise.resolve();
	}

	onLogs(filter: LogsFilter | PublicKey, callback: LogsCallback, commitment?: LegacyCommitment): number {
		const id = this.#nextSubscriptionId++;
		const abortController = new AbortController();
		const chosenCommitment = normalizeCommitment(commitment) ?? this.commitment ?? DEFAULT_COMMITMENT;

		// Convert filter to Kit format
		let logsFilter: unknown;
		if (filter instanceof PublicKey) {
			logsFilter = { mentions: [toKitAddressFromInput(filter)] };
		} else if (filter === 'all') {
			logsFilter = 'all';
		} else if (filter === 'allWithVotes') {
			logsFilter = 'allWithVotes';
		} else if ('mentions' in filter) {
			logsFilter = { mentions: filter.mentions.map((m) => toKitAddressFromInput(m)) };
		} else {
			logsFilter = filter;
		}

		(async () => {
			try {
				const notifications = await this.#client.rpcSubscriptions
					.logsNotifications(logsFilter as never, { commitment: chosenCommitment as KitCommitment })
					.subscribe({ abortSignal: abortController.signal });

				for await (const notification of notifications) {
					const context: Context = {
						slot:
							typeof notification.context.slot === 'bigint'
								? Number(notification.context.slot)
								: notification.context.slot,
					};
					const value = notification.value as { err: unknown; logs: readonly string[]; signature: string };
					const logs: Logs = {
						err: value.err as TransactionError | null,
						logs: [...value.logs],
						signature: value.signature,
					};
					callback(logs, context);
				}
			} catch {
				// Subscription ended or aborted
			}
		})();

		this.#subscriptions.set(id, { abort: () => abortController.abort() });
		return id;
	}

	removeOnLogsListener(subscriptionId: number): Promise<void> {
		const entry = this.#subscriptions.get(subscriptionId);
		if (entry) {
			entry.abort();
			this.#subscriptions.delete(subscriptionId);
		}
		return Promise.resolve();
	}
}
