import type { ReactNode } from 'react';

type CreateClientFn = typeof import('@solana/client')['createClient'];
type ClientInstance = ReturnType<CreateClientFn>;
const client = null as unknown as ClientInstance;

type UseAccountHook = typeof import('@solana/react-hooks')['useAccount'];
type UseAccountResult = ReturnType<UseAccountHook>;
const hookResult = null as unknown as UseAccountResult;

type ProviderComponent = typeof import('@solana/react-hooks')['SolanaClientProvider'];
type ProviderProps = Parameters<ProviderComponent>[0];
const providerProps: ProviderProps = { client, children: null as unknown as ReactNode };

export const _smokeTest: [ClientInstance, UseAccountResult, ProviderProps] = [client, hookResult, providerProps];
