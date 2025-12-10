'use client';

import type {
	CreateDefaultClientOptions,
	SerializableSolanaState,
	SolanaClient,
	SolanaClientConfig,
} from '@solana/client';
import {
	deserializeSolanaState,
	resolveClientConfig,
	serializeSolanaState,
	subscribeSolanaState,
} from '@solana/client';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { SWRConfiguration } from 'swr';

import { SolanaClientProvider, useSolanaClient } from './context';
import { useConnectWallet, useWallet } from './hooks';
import { SolanaQueryProvider } from './QueryProvider';

type QueryLayerConfig = Readonly<{
	config?: SWRConfiguration;
	resetOnClusterChange?: boolean;
	suspense?: boolean;
	disabled?: boolean;
}>;

type StorageAdapter = Readonly<{
	getItem(key: string): string | null;
	removeItem(key: string): void;
	setItem(key: string, value: string): void;
}>;

type WalletPersistenceConfig = Readonly<{
	autoConnect?: boolean;
	storage?: StorageAdapter | null;
	storageKey?: string;
}>;

type PersistedSerializableState = Readonly<{
	legacyConnectorId: string | null;
	state: SerializableSolanaState | null;
}>;

type SolanaProviderProps = Readonly<{
	children: ReactNode;
	client?: SolanaClient;
	config?: SolanaClientConfig | CreateDefaultClientOptions;
	query?: QueryLayerConfig | false;
	walletPersistence?: WalletPersistenceConfig | false;
}>;

/**
 * Convenience provider that composes {@link SolanaClientProvider} with {@link SolanaQueryProvider}.
 *
 * Useful when you want one drop-in wrapper that handles client setup plus SWR configuration without
 * introducing any additional contexts.
 */
export function SolanaProvider({ children, client, config, query, walletPersistence }: SolanaProviderProps) {
	const shouldIncludeQueryLayer = query !== false && query?.disabled !== true;
	const queryProps: QueryLayerConfig = shouldIncludeQueryLayer && query ? query : {};
	const persistenceConfig = walletPersistence === false ? undefined : (walletPersistence ?? {});
	const storage = persistenceConfig ? (persistenceConfig.storage ?? getDefaultStorage()) : null;
	const storageKey = persistenceConfig?.storageKey ?? DEFAULT_STORAGE_KEY;
	const persistedState = persistenceConfig
		? readPersistedState(storage, storageKey)
		: { legacyConnectorId: null, state: null };
	const normalizedConfig = config ? resolveClientConfig(config) : resolveClientConfig();
	const clientConfig = persistenceConfig
		? { ...normalizedConfig, initialState: normalizedConfig.initialState ?? persistedState.state ?? undefined }
		: normalizedConfig;

	const content = shouldIncludeQueryLayer ? (
		<SolanaQueryProvider
			config={queryProps.config}
			resetOnClusterChange={queryProps.resetOnClusterChange}
			suspense={queryProps.suspense}
		>
			{children}
		</SolanaQueryProvider>
	) : (
		children
	);

	return (
		<SolanaClientProvider client={client} config={clientConfig}>
			{persistenceConfig ? (
				<WalletPersistence
					autoConnect={persistenceConfig.autoConnect}
					initialState={clientConfig?.initialState ?? persistedState.state}
					legacyConnectorId={persistedState.legacyConnectorId}
					storage={storage}
					storageKey={storageKey}
				/>
			) : null}
			{content}
		</SolanaClientProvider>
	);
}

const DEFAULT_STORAGE_KEY = 'solana:last-connector';

function readPersistedState(storage: StorageAdapter | null, storageKey: string): PersistedSerializableState {
	if (!storage) {
		return { legacyConnectorId: null, state: null };
	}
	const raw = safelyRead(() => storage.getItem(storageKey));
	if (!raw) {
		return { legacyConnectorId: null, state: null };
	}
	const parsed = deserializeSolanaState(raw);
	if (parsed) {
		return { legacyConnectorId: null, state: parsed };
	}
	return { legacyConnectorId: raw, state: null };
}

type WalletPersistenceProps = WalletPersistenceConfig &
	Readonly<{
		initialState?: SerializableSolanaState | null;
		legacyConnectorId?: string | null;
	}>;

function WalletPersistence({
	autoConnect = true,
	initialState = null,
	legacyConnectorId = null,
	storage,
	storageKey = DEFAULT_STORAGE_KEY,
}: WalletPersistenceProps) {
	const wallet = useWallet();
	const connectWallet = useConnectWallet();
	const client = useSolanaClient();
	const storageRef = useRef<StorageAdapter | null>(storage ?? getDefaultStorage());
	const [hasAttemptedAutoConnect, setHasAttemptedAutoConnect] = useState(false);
	const clientRef = useRef<SolanaClient | null>(null);
	const persistedStateRef = useRef<SerializableSolanaState | null>(initialState);
	const legacyConnectorIdRef = useRef<string | null>(legacyConnectorId);

	useEffect(() => {
		storageRef.current = storage ?? getDefaultStorage();
	}, [storage]);

	useEffect(() => {
		if (clientRef.current !== client) {
			clientRef.current = client;
			setHasAttemptedAutoConnect(false);
		}
	}, [client]);

	useEffect(() => {
		const activeStorage = storageRef.current;
		if (!activeStorage) return;
		const unsubscribe = subscribeSolanaState(client, (state) => {
			persistedStateRef.current = state;
			legacyConnectorIdRef.current = null;
			safelyWrite(() => activeStorage.setItem(storageKey, serializeSolanaState(state)));
		});
		return () => {
			unsubscribe();
		};
	}, [client, storageKey]);

	useEffect(() => {
		persistedStateRef.current = initialState ?? persistedStateRef.current;
		legacyConnectorIdRef.current = legacyConnectorId;
	}, [initialState, legacyConnectorId]);

	useEffect(() => {
		const persisted = persistedStateRef.current ?? initialState;
		const persistedAutoConnect = persisted?.autoconnect ?? false;
		const autoConnectEnabled = persistedAutoConnect || autoConnect;
		if (!autoConnectEnabled || hasAttemptedAutoConnect) {
			return;
		}
		if (wallet.status === 'connected' || wallet.status === 'connecting') {
			setHasAttemptedAutoConnect(true);
			return;
		}
		const connectorId = persisted?.lastConnectorId ?? legacyConnectorIdRef.current;
		const shouldAutoConnect = autoConnectEnabled && connectorId;
		if (!shouldAutoConnect || !connectorId) return;
		const connector = client.connectors.get(connectorId);
		if (!connector) return;

		void (async () => {
			try {
				await connectWallet(connectorId, { autoConnect: true, allowInteractiveFallback: false });
			} catch {
				// Ignore auto-connect failures; consumers can handle manual retries via hooks.
			} finally {
				setHasAttemptedAutoConnect(true);
			}
		})();
	}, [autoConnect, client, connectWallet, hasAttemptedAutoConnect, initialState, wallet.status]);

	return null;
}

function safelyRead(reader: () => string | null): string | null {
	try {
		return reader();
	} catch {
		return null;
	}
}

function safelyWrite(writer: () => void) {
	try {
		writer();
	} catch {
		// Ignore write failures (private browsing, SSR, etc.).
	}
}

function getDefaultStorage(): StorageAdapter | null {
	if (typeof globalThis !== 'object' || globalThis === null) {
		return null;
	}
	const candidate = (globalThis as Record<string, unknown>).localStorage as StorageAdapter | undefined;
	if (!candidate) {
		return null;
	}
	return candidate;
}
