import type {
	ConnectWalletParameters,
	ConnectWalletReturnType,
	DisconnectWalletParameters,
	DisconnectWalletReturnType,
	FetchAccountParameters,
	FetchAccountReturnType,
	FetchBalanceParameters,
	FetchBalanceReturnType,
	FetchLookupTableParameters,
	FetchLookupTableReturnType,
	FetchLookupTablesParameters,
	FetchLookupTablesReturnType,
	FetchNonceAccountParameters,
	FetchNonceAccountReturnType,
	RequestAirdropParameters,
	RequestAirdropReturnType,
	SendTransactionParameters,
	SendTransactionReturnType,
	SetClusterParameters,
	SetClusterReturnType,
	SolanaClient,
} from './types';

/**
 * Connect to a registered wallet connector by id.
 *
 * @param client - Solana client instance.
 * @param params - Connector id and optional auto-connect preference.
 */
export function connectWallet(client: SolanaClient, params: ConnectWalletParameters): ConnectWalletReturnType {
	return client.actions.connectWallet(params.connectorId, params.options);
}

/**
 * Disconnect the active wallet session (noop if already disconnected).
 *
 * @param client - Solana client instance.
 */
export function disconnectWallet(
	client: SolanaClient,
	_params?: DisconnectWalletParameters,
): DisconnectWalletReturnType {
	void _params;
	return client.actions.disconnectWallet();
}

/**
 * Fetch and cache account data for an address.
 *
 * @param client - Solana client instance.
 * @param params - Address and optional commitment override.
 */
export function fetchAccount(client: SolanaClient, params: FetchAccountParameters): FetchAccountReturnType {
	return client.actions.fetchAccount(params.address, params.commitment);
}

/**
 * Fetch and cache lamport balance for an address.
 *
 * @param client - Solana client instance.
 * @param params - Address and optional commitment override.
 */
export function fetchBalance(client: SolanaClient, params: FetchBalanceParameters): FetchBalanceReturnType {
	return client.actions.fetchBalance(params.address, params.commitment);
}

/**
 * Fetch an address lookup table.
 *
 * @param client - Solana client instance.
 * @param params - Lookup table address and optional commitment override.
 */
export function fetchLookupTable(client: SolanaClient, params: FetchLookupTableParameters): FetchLookupTableReturnType {
	return client.actions.fetchLookupTable(params.address, params.commitment);
}

/**
 * Fetch multiple address lookup tables.
 *
 * @param client - Solana client instance.
 * @param params - Lookup table addresses and optional commitment override.
 */
export function fetchLookupTables(
	client: SolanaClient,
	params: FetchLookupTablesParameters,
): FetchLookupTablesReturnType {
	return client.actions.fetchLookupTables(params.addresses, params.commitment);
}

/**
 * Fetch a nonce account.
 *
 * @param client - Solana client instance.
 * @param params - Nonce account address and optional commitment override.
 */
export function fetchNonceAccount(
	client: SolanaClient,
	params: FetchNonceAccountParameters,
): FetchNonceAccountReturnType {
	return client.actions.fetchNonceAccount(params.address, params.commitment);
}

/**
 * Request an airdrop to an address.
 *
 * @param client - Solana client instance.
 * @param params - Target address and lamports amount.
 */
export function requestAirdrop(client: SolanaClient, params: RequestAirdropParameters): RequestAirdropReturnType {
	return client.actions.requestAirdrop(params.address, params.lamports);
}

/**
 * Send a prepared transaction through the client.
 *
 * @param client - Solana client instance.
 * @param params - Transaction and optional commitment override.
 */
export function sendTransaction(client: SolanaClient, params: SendTransactionParameters): SendTransactionReturnType {
	return client.actions.sendTransaction(params.transaction, params.commitment);
}

/**
 * Reconfigure the client to target a new cluster endpoint (and optional websocket/commitment).
 *
 * @param client - Solana client instance.
 * @param params - Endpoint plus optional config overrides.
 */
export function setCluster(client: SolanaClient, params: SetClusterParameters): SetClusterReturnType {
	return client.actions.setCluster(params.endpoint, params.config);
}
