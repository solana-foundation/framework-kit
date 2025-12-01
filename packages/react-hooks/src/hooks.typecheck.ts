import type { ClientState, SignatureLike } from '@solana/client';

import type {
	UseClientStoreParameters,
	UseClientStoreReturnType,
	UseClientStoreSelector,
	UseClusterStateParameters,
	UseClusterStatusParameters,
	UseConnectWalletParameters,
	UseDisconnectWalletParameters,
	UseSendTransactionParameters,
	UseSignatureStatusParameters,
	UseSolanaClientParameters,
	UseSolTransferParameters,
	UseWaitForSignatureOptions,
	UseWaitForSignatureParameters,
	UseWalletActionsParameters,
	UseWalletParameters,
	UseWalletSessionParameters,
} from './index';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

type VoidHookParameters =
	| UseClusterStateParameters
	| UseClusterStatusParameters
	| UseConnectWalletParameters
	| UseDisconnectWalletParameters
	| UseSendTransactionParameters
	| UseSolanaClientParameters
	| UseSolTransferParameters
	| UseWalletActionsParameters
	| UseWalletParameters
	| UseWalletSessionParameters;

export type VoidParametersMatch = Expect<Equal<VoidHookParameters, undefined>>;

export type WaitForSignatureParametersMatch = Expect<
	Equal<
		UseWaitForSignatureParameters,
		Readonly<{
			options?: UseWaitForSignatureOptions;
			signature?: SignatureLike;
		}>
	>
>;

export type UseClientStoreParametersMatch = Expect<
	Equal<UseClientStoreParameters<ClientState>, UseClientStoreSelector<ClientState> | undefined>
>;
export type UseClientStoreReturnDefault = Expect<Equal<UseClientStoreReturnType<ClientState>, ClientState>>;
export type UseClientStoreReturnSelector = Expect<Equal<UseClientStoreReturnType<number>, number>>;
export type UseSignatureStatusParametersMatch = Expect<
	Equal<Pick<UseSignatureStatusParameters, 'signature'>, { signature?: SignatureLike }>
>;
