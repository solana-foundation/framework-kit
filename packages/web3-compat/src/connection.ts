import type { Address } from '@solana/addresses';
import { createSolanaRpcClient, type SolanaRpcClient } from '@solana/client';
import type { Commitment as KitCommitment, Signature } from '@solana/kit';
import type { Base64EncodedWireTransaction } from '@solana/transactions';
import {
	type AccountInfo,
	type ConnectionConfig,
	type DataSlice,
	type Commitment as LegacyCommitment,
	PublicKey,
	type SendOptions,
	type SignatureStatus,
	type SignatureStatusConfig,
	type SimulatedTransactionResponse,
	type SimulateTransactionConfig,
	Transaction,
	type TransactionSignature,
	VersionedTransaction,
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
}
