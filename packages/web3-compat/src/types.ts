/**
 * Type definitions for @solana/web3-compat Connection class.
 *
 * These types bridge @solana/web3.js API with @solana/kit internals.
 */

import type {
	AccountInfo,
	ConnectionConfig,
	Context,
	DataSlice,
	Finality,
	KeyedAccountInfo,
	Commitment as LegacyCommitment,
	Logs,
	PublicKey,
	SignatureResult,
	SignatureStatusConfig,
	SlotInfo,
	SlotUpdate,
} from '@solana/web3.js';

// ============================================================================
// Commitment Types
// ============================================================================

/**
 * Normalized commitment level compatible with @solana/kit.
 */
export type NormalizedCommitment = 'processed' | 'confirmed' | 'finalized';

// ============================================================================
// RPC Response Types
// ============================================================================

/**
 * Context returned with RPC responses.
 */
export type RpcContext = Readonly<{
	apiVersion?: string;
	slot: number;
}>;

/**
 * Generic RPC response wrapper with context.
 */
export type RpcResponseWithContext<T> = Readonly<{
	context: RpcContext;
	value: T;
}>;

// ============================================================================
// Account Types
// ============================================================================

/**
 * Configuration for getAccountInfo calls.
 */
export type AccountInfoConfig = Readonly<{
	commitment?: LegacyCommitment;
	dataSlice?: DataSlice;
	encoding?: 'base64';
	minContextSlot?: number;
}>;

/**
 * Configuration for getProgramAccounts calls.
 */
export type ProgramAccountsConfig = Readonly<{
	commitment?: LegacyCommitment;
	dataSlice?: DataSlice;
	encoding?: 'base64' | 'base64+zstd';
	filters?: ReadonlyArray<unknown>;
	minContextSlot?: number;
	withContext?: boolean;
}>;

/**
 * Configuration for getMultipleAccountsInfo calls.
 */
export type GetMultipleAccountsConfig = Readonly<{
	commitment?: LegacyCommitment;
	dataSlice?: DataSlice;
	minContextSlot?: number;
}>;

/**
 * Configuration for getParsedAccountInfo calls.
 */
export type GetParsedAccountInfoConfig = Readonly<{
	commitment?: LegacyCommitment;
	minContextSlot?: number;
}>;

/**
 * Configuration for getMultipleParsedAccounts calls.
 */
export type GetMultipleParsedAccountsConfig = Readonly<{
	commitment?: LegacyCommitment;
	minContextSlot?: number;
}>;

/**
 * Raw RPC account data structure.
 */
export type RpcAccount = Readonly<{
	data: readonly [string, string] | string;
	executable: boolean;
	lamports: number | bigint;
	owner: string;
	rentEpoch: number | bigint;
}>;

/**
 * Program account with pubkey from RPC wire format.
 */
export type ProgramAccountWire = Readonly<{
	account: RpcAccount;
	pubkey: string;
}>;

/**
 * Program accounts response with context.
 */
export type ProgramAccountsWithContext = Readonly<{
	context: Readonly<{
		apiVersion?: string;
		slot: number | bigint;
	}>;
	value: readonly ProgramAccountWire[];
}>;

// ============================================================================
// Token Types
// ============================================================================

/**
 * Filter for token account queries.
 */
export type TokenAccountsFilter = { mint: PublicKey } | { programId: PublicKey };

/**
 * Configuration for getTokenAccountsByOwner calls.
 */
export type GetTokenAccountsByOwnerConfig = Readonly<{
	commitment?: LegacyCommitment;
	encoding?: 'base64' | 'jsonParsed';
	minContextSlot?: number;
}>;

// ============================================================================
// Transaction Types
// ============================================================================

/**
 * Input types accepted for raw transaction data.
 * Note: Transaction and VersionedTransaction are handled separately in adapters
 * to avoid circular import issues with @solana/web3.js.
 */
export type RawTransactionInput = number[] | Uint8Array | Buffer;

/**
 * Configuration for getTransaction calls.
 */
export type GetTransactionConfig = Readonly<{
	commitment?: Finality;
	maxSupportedTransactionVersion?: number;
}>;

/**
 * Configuration for getParsedTransaction calls.
 */
export type GetParsedTransactionConfig = Readonly<{
	commitment?: Finality;
	maxSupportedTransactionVersion?: number;
}>;

/**
 * Configuration for getSignatureStatuses with commitment.
 */
export type SignatureStatusConfigWithCommitment = SignatureStatusConfig & {
	commitment?: LegacyCommitment;
};

// ============================================================================
// Block Types
// ============================================================================

/**
 * Configuration for getBlock calls.
 */
export type GetBlockConfig = Readonly<{
	commitment?: Finality;
	maxSupportedTransactionVersion?: number;
	rewards?: boolean;
	transactionDetails?: 'full' | 'accounts' | 'signatures' | 'none';
}>;

/**
 * Configuration for getParsedBlock calls.
 */
export type GetParsedBlockConfig = Readonly<{
	commitment?: Finality;
	maxSupportedTransactionVersion?: number;
	rewards?: boolean;
	transactionDetails?: 'full' | 'accounts' | 'signatures' | 'none';
}>;

// ============================================================================
// Connection Configuration Types
// ============================================================================

/**
 * Input types for commitment configuration.
 */
export type ConnectionCommitmentInput =
	| LegacyCommitment
	| (ConnectionConfig & {
			commitment?: LegacyCommitment;
	  })
	| undefined;

// ============================================================================
// Subscription Types
// ============================================================================

/**
 * Internal subscription tracking entry.
 */
export type SubscriptionEntry = {
	abort: () => void;
};

/**
 * Callback for account change notifications.
 */
export type AccountChangeCallback = (accountInfo: AccountInfo<Buffer>, context: Context) => void;

/**
 * Callback for program account change notifications.
 */
export type ProgramAccountChangeCallback = (keyedAccountInfo: KeyedAccountInfo, context: Context) => void;

/**
 * Callback for slot change notifications.
 */
export type SlotChangeCallback = (slotInfo: SlotInfo) => void;

/**
 * Callback for slot update notifications.
 */
export type SlotUpdateCallback = (slotUpdate: SlotUpdate) => void;

/**
 * Callback for signature result notifications.
 */
export type SignatureResultCallback = (signatureResult: SignatureResult, context: Context) => void;

/**
 * Callback for signature subscription notifications (includes received).
 */
export type SignatureSubscriptionCallback = (
	notification: SignatureResult | { type: 'received' },
	context: Context,
) => void;

/**
 * Callback for root change notifications.
 */
export type RootChangeCallback = (root: number) => void;

/**
 * Callback for logs notifications.
 */
export type LogsCallback = (logs: Logs, context: Context) => void;

/**
 * Filter for logs subscriptions.
 */
export type LogsFilter = 'all' | 'allWithVotes' | { mentions: string[] };

// ============================================================================
// Kit Internal Types (for type conversion)
// ============================================================================

/**
 * Parsed account data structure from @solana/kit.
 */
export type KitParsedAccountData = {
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

/**
 * Transaction metadata from @solana/kit.
 */
export type KitTransactionMeta = {
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

/**
 * Transaction response from @solana/kit.
 */
export type KitTransactionResponse = {
	blockTime: number | bigint | null;
	meta: KitTransactionMeta | null;
	slot: number | bigint;
	transaction: {
		message: unknown;
		signatures: readonly string[];
	};
	version?: 'legacy' | 0;
};

/**
 * Signature info from @solana/kit.
 */
export type KitSignatureInfo = {
	blockTime: number | bigint | null;
	confirmationStatus: string | null;
	err: unknown;
	memo: string | null;
	signature: string;
	slot: number | bigint;
};

/**
 * Block response from @solana/kit.
 */
export type KitBlockResponse = {
	blockHeight: number | bigint | null;
	blockTime: number | bigint | null;
	blockhash: string;
	parentSlot: number | bigint;
	previousBlockhash: string;
	rewards?: readonly unknown[];
	transactions?: readonly unknown[];
	signatures?: readonly string[];
};
