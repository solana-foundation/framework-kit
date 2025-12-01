import type {
	Address,
	ClusterUrl,
	Commitment,
	Lamports,
	SendableTransaction,
	Signature,
	Transaction,
} from '@solana/kit';
import type { TransactionWithLastValidBlockHeight } from '@solana/transaction-confirmation';

import type {
	connectWallet,
	disconnectWallet,
	fetchAccount,
	fetchBalance,
	requestAirdrop,
	sendTransaction,
	setCluster,
} from './actions';
import type {
	AccountCacheEntry,
	ConnectWalletParameters,
	ConnectWalletReturnType,
	DisconnectWalletParameters,
	DisconnectWalletReturnType,
	FetchAccountParameters,
	FetchAccountReturnType,
	FetchBalanceParameters,
	FetchBalanceReturnType,
	RequestAirdropParameters,
	RequestAirdropReturnType,
	SendTransactionParameters,
	SendTransactionReturnType,
	SetClusterParameters,
	SetClusterReturnType,
	SolanaClient,
} from './types';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

export type ConnectWalletParametersMatch = Expect<
	Equal<ConnectWalletParameters, Readonly<{ connectorId: string; options?: Readonly<{ autoConnect?: boolean }> }>>
>;
export type ConnectWalletReturnMatch = Expect<Equal<ConnectWalletReturnType, Promise<void>>>;
export type DisconnectWalletParametersMatch = Expect<Equal<DisconnectWalletParameters, undefined>>;
export type DisconnectWalletReturnMatch = Expect<Equal<DisconnectWalletReturnType, Promise<void>>>;

export type FetchAccountParametersMatch = Expect<
	Equal<FetchAccountParameters, Readonly<{ address: Address; commitment?: Commitment }>>
>;
export type FetchAccountReturnMatch = Expect<Equal<FetchAccountReturnType, Promise<AccountCacheEntry>>>;

export type FetchBalanceParametersMatch = Expect<
	Equal<FetchBalanceParameters, Readonly<{ address: Address; commitment?: Commitment }>>
>;
export type FetchBalanceReturnMatch = Expect<Equal<FetchBalanceReturnType, Promise<Lamports>>>;

export type RequestAirdropParametersMatch = Expect<
	Equal<RequestAirdropParameters, Readonly<{ address: Address; lamports: Lamports }>>
>;
export type RequestAirdropReturnMatch = Expect<Equal<RequestAirdropReturnType, Promise<Signature>>>;

export type SendTransactionParametersMatch = Expect<
	Equal<
		SendTransactionParameters,
		Readonly<{
			commitment?: Commitment;
			transaction: SendableTransaction & Transaction & TransactionWithLastValidBlockHeight;
		}>
	>
>;
export type SendTransactionReturnMatch = Expect<Equal<SendTransactionReturnType, Promise<Signature>>>;

export type SetClusterParametersMatch = Expect<
	Equal<
		SetClusterParameters,
		Readonly<{
			endpoint: ClusterUrl;
			config?: Readonly<{ commitment?: Commitment; websocketEndpoint?: ClusterUrl }>;
		}>
	>
>;
export type SetClusterReturnMatch = Expect<Equal<SetClusterReturnType, Promise<void>>>;

export type ConnectWalletWrapperSignature = Expect<
	Equal<Parameters<typeof connectWallet>, [SolanaClient, ConnectWalletParameters]>
>;
export type DisconnectWalletWrapperSignature = Expect<
	Equal<Parameters<typeof disconnectWallet>, [SolanaClient, DisconnectWalletParameters?]>
>;
export type FetchAccountWrapperSignature = Expect<
	Equal<Parameters<typeof fetchAccount>, [SolanaClient, FetchAccountParameters]>
>;
export type FetchBalanceWrapperSignature = Expect<
	Equal<Parameters<typeof fetchBalance>, [SolanaClient, FetchBalanceParameters]>
>;
export type RequestAirdropWrapperSignature = Expect<
	Equal<Parameters<typeof requestAirdrop>, [SolanaClient, RequestAirdropParameters]>
>;
export type SendTransactionWrapperSignature = Expect<
	Equal<Parameters<typeof sendTransaction>, [SolanaClient, SendTransactionParameters]>
>;
export type SetClusterWrapperSignature = Expect<
	Equal<Parameters<typeof setCluster>, [SolanaClient, SetClusterParameters]>
>;
