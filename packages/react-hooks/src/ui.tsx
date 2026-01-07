import type { WalletConnector, WalletSession, WalletStatus } from '@solana/client';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSolanaClient } from './context';
import { useConnectWallet, useDisconnectWallet, useWallet } from './hooks';

type WalletConnectionState = Readonly<{
	/** Initiates a wallet connection using the specified connector. */
	connect(
		connectorId: string,
		options?: Readonly<{ autoConnect?: boolean; allowInteractiveFallback?: boolean }>,
	): Promise<WalletSession>;
	/** Whether a wallet is currently connected. */
	connected: boolean;
	/** Whether a wallet connection is in progress. */
	connecting: boolean;
	/** List of available wallet connectors. Empty until `isReady` is true during SSR. */
	connectors: readonly WalletConnector[];
	/** The currently connected wallet connector, if any. */
	currentConnector?: WalletConnector;
	/** The ID of the currently connected connector, if any. */
	connectorId?: string;
	/** Disconnects the currently connected wallet. */
	disconnect(): Promise<void>;
	/** The error that occurred during connection, if any. */
	error: unknown;
	/**
	 * Whether the hook has completed client-side hydration and is ready to use.
	 * Use this to prevent SSR hydration mismatches by showing a placeholder until true.
	 */
	isReady: boolean;
	/** The current wallet connection status. */
	status: WalletStatus['status'];
	/** The current wallet session, if connected. */
	wallet: WalletSession | undefined;
}>;

type WalletConnectionOptions = Readonly<{
	connectors?: readonly WalletConnector[];
}>;

export type UseWalletConnectionParameters = WalletConnectionOptions;
export type UseWalletConnectionReturnType = WalletConnectionState;

/**
 * Collect everything needed to build wallet connection UIs into a single hook.
 *
 * The `isReady` property indicates when client-side hydration is complete and wallet
 * data is available. Use this to prevent SSR hydration mismatches by showing a
 * placeholder until the hook is ready.
 *
 * @example
 * ```tsx
 * const { connectors, connect, isReady, status } = useWalletConnection();
 *
 * if (!isReady) return <WalletButtonSkeleton />;
 *
 * return connectors.map((c) => (
 *   <button key={c.id} onClick={() => connect(c.id)} disabled={status === 'connecting'}>
 *     {c.name}
 *   </button>
 * ));
 * ```
 */
export function useWalletConnection(options: WalletConnectionOptions = {}): WalletConnectionState {
	const wallet = useWallet();
	const connectWallet = useConnectWallet();
	const disconnectWallet = useDisconnectWallet();
	const client = useSolanaClient();
	const [isHydrated, setIsHydrated] = useState(false);
	useEffect(() => {
		setIsHydrated(true);
	}, []);
	const connectors = isHydrated ? (options.connectors ?? client.connectors.all) : [];
	const connect = useCallback(
		(
			connectorId: string,
			connectOptions?: Readonly<{ autoConnect?: boolean; allowInteractiveFallback?: boolean }>,
		) => connectWallet(connectorId, connectOptions),
		[connectWallet],
	);
	const disconnect = useCallback(() => disconnectWallet(), [disconnectWallet]);

	const state = useMemo<WalletConnectionState>(() => {
		const connectorId = 'connectorId' in wallet ? wallet.connectorId : undefined;
		const currentConnector = connectorId ? connectors.find((connector) => connector.id === connectorId) : undefined;
		const session: WalletSession | undefined = wallet.status === 'connected' ? wallet.session : undefined;
		const error = wallet.status === 'error' ? (wallet.error ?? null) : null;

		return {
			connect,
			connected: wallet.status === 'connected',
			connecting: wallet.status === 'connecting',
			connectors,
			connectorId,
			currentConnector,
			disconnect,
			error,
			isReady: isHydrated,
			status: wallet.status,
			wallet: session,
		};
	}, [connect, connectors, disconnect, isHydrated, wallet]);

	return state;
}

type WalletConnectionManagerProps = Readonly<{
	children: (state: WalletConnectionState) => ReactNode;
	connectors?: readonly WalletConnector[];
}>;

/**
 * Render-prop helper that lets you easily wire wallet status into custom UIs.
 *
 * @example
 * ```tsx
 * <WalletConnectionManager>
 *   {({ connectors, connect }) => connectors.map((c) => (
 *     <button key={c.id} onClick={() => connect(c.id)}>{c.name}</button>
 *   ))}
 * </WalletConnectionManager>
 * ```
 */
export function WalletConnectionManager({ children, connectors }: WalletConnectionManagerProps) {
	const state = useWalletConnection({ connectors });
	return <>{children(state)}</>;
}

type WalletModalStateOptions = WalletConnectionOptions &
	Readonly<{
		closeOnConnect?: boolean;
		initialOpen?: boolean;
	}>;

export type WalletModalState = WalletConnectionState &
	Readonly<{
		close(): void;
		isOpen: boolean;
		open(): void;
		selectedConnector: string | null;
		select(connectorId: string | null): void;
		toggle(): void;
	}>;

export type UseWalletModalStateParameters = WalletModalStateOptions;
export type UseWalletModalStateReturnType = WalletModalState;

/**
 * Small state machine for wallet selection modals – keeps track of modal visibility and the currently
 * highlighted connector while reusing the connection state returned by {@link useWalletConnection}.
 *
 * @example
 * ```tsx
 * const modal = useWalletModalState();
 * return (
 *   <>
 *     <button onClick={modal.toggle}>Connect</button>
 *     {modal.isOpen && modal.connectors.map((c) => (
 *       <button key={c.id} onClick={() => modal.connect(c.id)}>{c.name}</button>
 *     ))}
 *   </>
 * );
 * ```
 */
export function useWalletModalState(options: WalletModalStateOptions = {}): WalletModalState {
	const connection = useWalletConnection(options);
	const [isOpen, setIsOpen] = useState(options.initialOpen ?? false);
	const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
	const closeOnConnect = options.closeOnConnect ?? true;

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((value) => !value), []);
	const select = useCallback((connectorId: string | null) => setSelectedConnector(connectorId), []);

	const connect = useCallback(
		async (connectorId: string, connectOptions?: Readonly<{ autoConnect?: boolean }>) => {
			const session = await connection.connect(connectorId, connectOptions);
			setSelectedConnector(connectorId);
			if (closeOnConnect) {
				setIsOpen(false);
			}
			return session;
		},
		[closeOnConnect, connection],
	);

	return {
		...connection,
		close,
		connect,
		isOpen,
		open,
		selectedConnector,
		select,
		toggle,
	};
}
