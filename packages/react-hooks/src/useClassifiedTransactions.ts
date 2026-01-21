import { type AddressLike, type SolanaClient, toAddress } from '@solana/client';
import { useCallback, useMemo } from 'react';
import {
	type ClassifiedTransaction,
	type Cluster,
	createIndexer,
	type GetTransactionsOptions,
	type TxIndexer,
} from 'tx-indexer';

import { useSolanaClient } from './context';
import { type SolanaQueryResult, type UseSolanaRpcQueryOptions, useSolanaRpcQuery } from './query';
import { useClientStore } from './useClientStore';

function deriveClusterFromEndpoint(endpoint: string): Cluster {
	const url = endpoint.toLowerCase();
	if (url.includes('devnet')) return 'devnet';
	if (url.includes('testnet')) return 'testnet';
	return 'mainnet-beta';
}

type ClassifiedTransactionsData = Readonly<{
	transactions: ClassifiedTransaction[];
	oldestSignature: string | null;
	hasMore: boolean;
}>;

export type UseClassifiedTransactionsOptions = Readonly<{
	/** Maximum transactions to fetch per request (default: 10) */
	limit?: number;
	/** Pagination cursor - fetch transactions before this signature */
	before?: string;
	/** Stop fetching at this signature */
	until?: string;
	/**
	 * Solana cluster for token metadata resolution.
	 * Auto-detected from RPC endpoint URL by default (looks for 'devnet' or 'testnet' in URL).
	 * Override this if using a custom RPC URL that doesn't contain the cluster name.
	 * @default auto-detected from endpoint
	 */
	cluster?: Cluster;
	/** Filter spam transactions (default: true) */
	filterSpam?: boolean;
	/** Enrich with NFT metadata - requires DAS RPC (default: true) */
	enrichNftMetadata?: boolean;
	/** Enrich with token metadata (default: true) */
	enrichTokenMetadata?: boolean;
	/**
	 * Include signatures from token accounts (ATAs) to catch incoming transfers.
	 * This adds extra RPC calls but ensures complete transaction history.
	 * @default false
	 */
	includeTokenAccounts?: boolean;
	/**
	 * Maximum token accounts to query when includeTokenAccounts is true (default: 5).
	 * Lower values reduce RPC calls. Set to 0 to skip token account queries.
	 */
	maxTokenAccounts?: number;
	/**
	 * Multiplier for signature overfetch (default: 1).
	 * Higher values fetch more signatures to account for spam filtering.
	 * Set to 1 for rate-limited RPCs.
	 */
	overfetchMultiplier?: number;
	/**
	 * Minimum signatures to fetch per iteration (default: 20).
	 * Set lower for rate-limited RPCs.
	 */
	minPageSize?: number;
	/**
	 * Concurrency for fetching transactions (default: 1).
	 * Higher values are faster but use more RPC calls concurrently.
	 */
	transactionConcurrency?: number;
}>;

/**
 * Parameters for the useClassifiedTransactions hook.
 */
export type UseClassifiedTransactionsParameters = Readonly<{
	/** Wallet address to fetch transactions for. Can be a string or Address type. */
	address?: AddressLike;
	/** Transaction fetching and classification options. */
	options?: UseClassifiedTransactionsOptions;
	/** Disable fetching (useful for conditional queries). Defaults to true when address is undefined. */
	disabled?: boolean;
	/** SWR configuration options (revalidation, caching, etc.). */
	swr?: UseSolanaRpcQueryOptions<ClassifiedTransactionsData>['swr'];
}>;

/**
 * Return type for the useClassifiedTransactions hook.
 */
export type UseClassifiedTransactionsReturnType = SolanaQueryResult<ClassifiedTransactionsData> &
	Readonly<{
		/** Array of classified transactions, newest first. */
		transactions: ClassifiedTransaction[];
		/** Signature of the oldest transaction (use as `before` cursor for pagination). */
		oldestSignature: string | null;
		/** Whether more transactions are available to fetch. */
		hasMore: boolean;
	}>;

/**
 * Fetch and classify transactions for a wallet address.
 *
 * This hook integrates with the `tx-indexer` SDK to provide:
 * - **Transaction classification** - Identifies transaction types (swap, transfer, stake, NFT, etc.)
 * - **Protocol detection** - Recognizes interactions with known protocols (Jupiter, Raydium, etc.)
 * - **Spam filtering** - Automatically filters out spam/dust transactions
 * - **Token metadata** - Enriches transactions with token symbols and names
 * - **Pagination** - Cursor-based pagination with `oldestSignature` and `hasMore`
 *
 * The hook automatically detects the cluster (mainnet-beta/devnet/testnet) from the RPC endpoint URL.
 *
 * @example Basic usage
 * ```tsx
 * function TransactionHistory({ address }: { address: string }) {
 *   const { transactions, isLoading, isError } = useClassifiedTransactions({
 *     address,
 *     options: { limit: 10 },
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error loading transactions</div>;
 *
 *   return (
 *     <ul>
 *       {transactions.map((tx) => (
 *         <li key={tx.tx.signature}>
 *           {tx.classification.primaryType}: {tx.classification.primaryAmount?.amountUi}
 *           {tx.classification.primaryAmount?.token.symbol}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * @example Pagination with "Load More"
 * ```tsx
 * function PaginatedHistory({ address }: { address: string }) {
 *   const [cursor, setCursor] = useState<string>();
 *
 *   const { transactions, oldestSignature, hasMore, isLoading } = useClassifiedTransactions({
 *     address,
 *     options: { limit: 20, before: cursor },
 *   });
 *
 *   return (
 *     <div>
 *       {transactions.map((tx) => (
 *         <TransactionCard key={tx.tx.signature} tx={tx} />
 *       ))}
 *       {hasMore && (
 *         <button onClick={() => setCursor(oldestSignature)} disabled={isLoading}>
 *           Load More
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Rate-limited RPC configuration (e.g., public devnet)
 * ```tsx
 * // Conservative settings to avoid 429 errors on rate-limited RPCs
 * const { transactions } = useClassifiedTransactions({
 *   address,
 *   options: {
 *     limit: 5,
 *     overfetchMultiplier: 1,      // Don't overfetch signatures
 *     transactionConcurrency: 1,   // Fetch transactions sequentially
 *     minPageSize: 5,              // Small page size
 *   },
 *   swr: {
 *     revalidateOnFocus: false,    // Disable auto-revalidation
 *     revalidateOnReconnect: false,
 *   },
 * });
 * ```
 *
 * @example Include incoming token transfers
 * ```tsx
 * // By default, only the wallet's direct signatures are queried.
 * // Enable includeTokenAccounts to also query token account (ATA) signatures,
 * // which catches incoming token transfers that don't appear on the main wallet.
 * const { transactions } = useClassifiedTransactions({
 *   address,
 *   options: {
 *     includeTokenAccounts: true,  // Query ATAs for incoming transfers
 *     maxTokenAccounts: 3,         // Limit to 3 ATAs (reduces RPC calls)
 *   },
 * });
 * ```
 *
 * @returns Object containing:
 * - `transactions` - Array of classified transactions
 * - `oldestSignature` - Cursor for pagination (pass as `before` to load more)
 * - `hasMore` - Whether more transactions are available
 * - `isLoading` - Loading state
 * - `isError` - Error state
 * - `error` - Error object if failed
 * - `mutate` - SWR mutate function to refresh data
 */
export function useClassifiedTransactions(
	params: UseClassifiedTransactionsParameters = {},
): UseClassifiedTransactionsReturnType {
	const { address, options = {}, disabled: disabledOption, swr } = params;
	const client = useSolanaClient();
	const endpoint = useClientStore((state) => state.cluster.endpoint);

	const {
		limit = 10,
		before,
		until,
		cluster: clusterOverride,
		filterSpam = true,
		enrichNftMetadata = true,
		enrichTokenMetadata = true,
		includeTokenAccounts,
		maxTokenAccounts,
		overfetchMultiplier = 1,
		minPageSize,
		transactionConcurrency = 1,
	} = options;

	const cluster = useMemo(() => clusterOverride ?? deriveClusterFromEndpoint(endpoint), [clusterOverride, endpoint]);

	const indexer = useMemo<TxIndexer>(() => {
		return createIndexer({
			client: client.runtime,
			cluster,
		});
	}, [client.runtime, cluster]);

	const fetcher = useCallback(
		async (_: SolanaClient): Promise<ClassifiedTransactionsData> => {
			const resolvedAddress = address ? toAddress(address) : undefined;
			if (!resolvedAddress) {
				return { transactions: [], oldestSignature: null, hasMore: false };
			}

			const txOptions: GetTransactionsOptions = {
				limit,
				before,
				until,
				filterSpam,
				enrichNftMetadata,
				enrichTokenMetadata,
				includeTokenAccounts,
				maxTokenAccounts,
				overfetchMultiplier,
				minPageSize,
				transactionConcurrency,
			};

			const transactions = await indexer.getTransactions(resolvedAddress, txOptions);

			const oldestSignature =
				transactions.length > 0 ? String(transactions[transactions.length - 1].tx.signature) : null;

			const hasMore = transactions.length >= limit;

			return { transactions, oldestSignature, hasMore };
		},
		[
			address,
			limit,
			before,
			until,
			filterSpam,
			enrichNftMetadata,
			enrichTokenMetadata,
			includeTokenAccounts,
			maxTokenAccounts,
			overfetchMultiplier,
			minPageSize,
			transactionConcurrency,
			indexer,
		],
	);

	const disabled = disabledOption ?? !address;
	const query = useSolanaRpcQuery<ClassifiedTransactionsData>(
		'classifiedTransactions',
		[address, limit, before, until, filterSpam, enrichNftMetadata, enrichTokenMetadata, includeTokenAccounts],
		fetcher,
		{ disabled, swr },
	);

	return {
		...query,
		transactions: query.data?.transactions ?? [],
		oldestSignature: query.data?.oldestSignature ?? null,
		hasMore: query.data?.hasMore ?? false,
	};
}
