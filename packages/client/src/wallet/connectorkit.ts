import {
	ConnectorClient,
	type WalletConnectorMetadata as ConnectorKitConnectorMetadata,
	type WalletSession as ConnectorKitSession,
	type DefaultConfigOptions,
	type ExtendedConnectorConfig,
	getDefaultConfig,
	type WalletConnectorId,
} from '@solana/connector/headless';
import type { Wallet, WalletAccount as WalletStandardAccount } from '@wallet-standard/base';

import { createWalletStandardSession } from './standard';
import type { WalletConnector, WalletConnectorMetadata, WalletSession } from './types';

export type ConnectorKitConnectorsOptions =
	| Readonly<{ client: ConnectorClient }>
	| Readonly<{ config: ExtendedConnectorConfig }>
	| Readonly<{ defaultConfig: DefaultConfigOptions }>;

export type ConnectorKitConnectors = readonly WalletConnector[] &
	Readonly<{
		client?: ConnectorClient;
		destroy(): void;
	}>;

function resolveConnectorKind(id: string): WalletConnectorMetadata['kind'] {
	if (id === 'walletconnect') return 'walletconnect';
	if (id.startsWith('mwa:')) return 'mwa';
	if (id.startsWith('wallet-standard:')) return 'wallet-standard';
	return undefined;
}

function toConnectorMetadata(connector: ConnectorKitConnectorMetadata): WalletConnectorMetadata {
	const icon = connector.icon?.length ? connector.icon : undefined;
	const canAutoConnect = connector.features.includes('standard:connect');

	return {
		canAutoConnect,
		icon,
		id: connector.id,
		kind: resolveConnectorKind(connector.id),
		name: connector.name,
		ready: connector.ready,
	};
}

function createConnectorKitSession(
	client: ConnectorClient,
	wallet: Wallet,
	session: ConnectorKitSession,
	metadata: WalletConnectorMetadata,
): WalletSession {
	return createWalletStandardSession({
		account: session.selectedAccount.account,
		disconnect: () => client.disconnectWallet(),
		metadata,
		onAccountsChanged: (listener: (accounts: readonly WalletStandardAccount[]) => void) =>
			session.onAccountsChanged((accounts) => listener(accounts.map((account) => account.account))),
		wallet,
	});
}

function resolveConnectorClient(options: ConnectorKitConnectorsOptions): ConnectorClient {
	if ('client' in options) {
		return options.client;
	}
	if ('config' in options) {
		return new ConnectorClient(options.config);
	}
	return new ConnectorClient(getDefaultConfig(options.defaultConfig));
}

function createConnectorKitConnector(
	client: ConnectorClient,
	connector: ConnectorKitConnectorMetadata,
): WalletConnector {
	const metadata = toConnectorMetadata(connector);
	const connectorId = connector.id as WalletConnectorId;

	return {
		...metadata,
		async connect(options) {
			await client.connectWallet(connectorId, {
				silent: options?.autoConnect ?? false,
				allowInteractiveFallback: options?.allowInteractiveFallback,
			});
			const snapshot = client.getSnapshot();
			if (snapshot.wallet.status !== 'connected') {
				throw new Error('ConnectorKit did not establish a connected session.');
			}
			const wallet = client.getConnector(connectorId);
			if (!wallet) {
				throw new Error(`ConnectorKit wallet "${connector.id}" was unavailable after connect.`);
			}
			return createConnectorKitSession(client, wallet, snapshot.wallet.session, metadata);
		},
		async disconnect() {
			await client.disconnectWallet();
		},
		isSupported() {
			return typeof window !== 'undefined' && Boolean(metadata.ready);
		},
	};
}

export function connectorKit(options: ConnectorKitConnectorsOptions): ConnectorKitConnectors {
	if (typeof window === 'undefined' && !('client' in options)) {
		const connectors: WalletConnector[] = [];
		return Object.assign(connectors, {
			client: undefined,
			destroy: () => undefined,
		});
	}
	const client = resolveConnectorClient(options);
	const connectors = client
		.getSnapshot()
		.connectors.map((connector) => createConnectorKitConnector(client, connector));
	return Object.assign(connectors, {
		client,
		destroy: () => client.destroy(),
	});
}
