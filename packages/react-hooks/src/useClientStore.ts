import type { ClientState } from '@solana/client';
import { useStore } from 'zustand';

import { useSolanaClient } from './context';

export type UseClientStoreSelector<T> = (state: ClientState) => T;
const identitySelector = (state: ClientState): ClientState => state;

export type UseClientStoreParameters<T = ClientState> = UseClientStoreSelector<T> | undefined;
export type UseClientStoreReturnType<T = ClientState> = T extends undefined ? ClientState : T;

export function useClientStore(): ClientState;
export function useClientStore<T>(selector: UseClientStoreSelector<T>): T;
/**
 * Subscribe to the underlying Zustand store exposed by {@link SolanaClient}.
 *
 * @param selector - Derives the slice of state to observe. Defaults to the entire state.
 * @returns Selected state slice that triggers re-render when it changes.
 * @example
 * ```ts
 * const commitment = useClientStore((state) => state.cluster.commitment);
 * ```
 */
export function useClientStore<T>(selector?: UseClientStoreSelector<T>): ClientState | T {
	const client = useSolanaClient();
	const appliedSelector = selector ?? (identitySelector as UseClientStoreSelector<T>);
	const slice = useStore(client.store, appliedSelector);
	return selector ? slice : (slice as unknown as ClientState);
}
