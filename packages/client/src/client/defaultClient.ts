import type { ClusterUrl, Commitment } from '@solana/kit';

import type { SolanaClient, SolanaClientConfig } from '../types';
import { type ClusterMoniker, resolveCluster } from '../utils/cluster';
import { autoDiscover, backpack, phantom, solflare } from '../wallet/connectors';
import type { WalletConnector } from '../wallet/types';
import { createClient } from './createClient';

type BasePassthrough = Omit<SolanaClientConfig, 'endpoint' | 'websocketEndpoint' | 'walletConnectors'>;

export type CreateDefaultClientOptions = Readonly<
	BasePassthrough & {
		cluster?: ClusterMoniker;
		commitment?: Commitment;
		/**
		 * Alias for endpoint/RPC URL.
		 */
		rpc?: ClusterUrl;
		/**
		 * Optional HTTP endpoint override. `rpc` takes precedence when both are provided.
		 */
		endpoint?: ClusterUrl;
		/**
		 * Optional websocket override. When omitted we infer from HTTP.
		 */
		websocket?: ClusterUrl;
		walletConnectors?: readonly WalletConnector[] | 'default';
	}
>;

export function defaultWalletConnectors(): readonly WalletConnector[] {
	return [...phantom(), ...solflare(), ...backpack(), ...autoDiscover()];
}

function normalizeUrl(value?: string | null): ClusterUrl | undefined {
	if (!value) return undefined;
	const trimmed = value.trim();
	return trimmed.length ? (trimmed as ClusterUrl) : undefined;
}

export function resolveClientConfig(config: CreateDefaultClientOptions | SolanaClientConfig = {}): SolanaClientConfig {
	const {
		cluster,
		endpoint: endpointOverride,
		rpc,
		websocket,
		websocketEndpoint,
		walletConnectors,
		...passthrough
	} = config as CreateDefaultClientOptions & Partial<SolanaClientConfig>;
	const resolvedEndpoint =
		normalizeUrl(rpc) ?? normalizeUrl(endpointOverride) ?? normalizeUrl((config as SolanaClientConfig).endpoint);
	const resolvedCluster = resolveCluster({
		endpoint: resolvedEndpoint,
		moniker: cluster ?? undefined,
		websocketEndpoint: normalizeUrl(websocket ?? websocketEndpoint),
	});
	const resolvedConnectors =
		walletConnectors === undefined || walletConnectors === 'default' ? defaultWalletConnectors() : walletConnectors;

	return {
		...passthrough,
		endpoint: resolvedCluster.endpoint,
		websocketEndpoint: resolvedCluster.websocketEndpoint,
		walletConnectors: resolvedConnectors,
	};
}

export function createDefaultClient(config: CreateDefaultClientOptions = {}): SolanaClient {
	return createClient(resolveClientConfig(config));
}
