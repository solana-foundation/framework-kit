import type { Address } from '@solana/kit';
import { describe, expect, it } from 'vitest';

import { createClientStore, createInitialClientState } from '../client/createClientStore';
import type { SolanaClient, SolanaClientConfig } from '../types';
import {
	applySerializableState,
	deserializeSolanaState,
	getInitialSerializableState,
	serializeSolanaState,
	subscribeSolanaState,
} from './state';

const baseConfig: SolanaClientConfig = {
	endpoint: 'https://api.devnet.solana.com',
};

describe('serialization state helpers', () => {
	it('derives an initial serializable state from config', () => {
		const state = getInitialSerializableState({
			...baseConfig,
			commitment: 'finalized',
			websocketEndpoint: 'wss://api.devnet.solana.com',
		});

		expect(state).toMatchObject({
			autoconnect: false,
			commitment: 'finalized',
			endpoint: baseConfig.endpoint,
			lastConnectorId: null,
			lastPublicKey: null,
			version: 1,
			websocketEndpoint: 'wss://api.devnet.solana.com',
		});
	});

	it('returns the original config when no state is provided', () => {
		const merged = applySerializableState(baseConfig, null);
		expect(merged).toEqual(baseConfig);
	});

	it('merges persisted state over config when provided', () => {
		const merged = applySerializableState(
			{ ...baseConfig, commitment: 'processed', websocketEndpoint: 'wss://example.com' },
			{
				autoconnect: true,
				commitment: 'confirmed',
				endpoint: 'https://api.mainnet-beta.solana.com',
				lastConnectorId: 'phantom',
				lastPublicKey: 'pubkey',
				version: 1,
			},
		);

		expect(merged).toMatchObject({
			endpoint: 'https://api.mainnet-beta.solana.com',
			commitment: 'confirmed',
			websocketEndpoint: 'wss://example.com',
		});
	});

	it('serializes and deserializes state safely', () => {
		const state = getInitialSerializableState(baseConfig);
		const json = serializeSolanaState(state);
		expect(deserializeSolanaState(json)).toEqual(state);
		expect(deserializeSolanaState('')).toBeNull();
		expect(deserializeSolanaState('not-json')).toBeNull();
	});

	it('honors the wallet autoConnect preference when serializing state', () => {
		const initial = createInitialClientState({
			commitment: 'confirmed',
			endpoint: baseConfig.endpoint,
			websocketEndpoint: `${baseConfig.endpoint.replace('https', 'wss')}`,
		});
		const store = createClientStore(initial);
		const client = { store } as unknown as SolanaClient;

		const snapshots: Array<ReturnType<typeof deserializeSolanaState>> = [];
		const unsubscribe = subscribeSolanaState(client, (state) => snapshots.push(state));

		store.setState((prev) => ({
			...prev,
			wallet: {
				autoConnect: false,
				connectorId: 'phantom',
				session: {
					account: {
						address: 'address' as unknown as Address,
						publicKey: new Uint8Array(),
					},
					connector: { id: 'phantom', name: 'Phantom' },
					disconnect: async () => undefined,
				},
				status: 'connected',
			},
		}));

		unsubscribe();

		const lastSnapshot = snapshots.at(-1);
		expect(lastSnapshot?.lastConnectorId).toBe('phantom');
		expect(lastSnapshot?.autoconnect).toBe(false);
	});

	it('subscribes to client state changes and emits serializable snapshots', () => {
		const initial = createInitialClientState({
			commitment: 'confirmed',
			endpoint: baseConfig.endpoint,
			websocketEndpoint: `${baseConfig.endpoint.replace('https', 'wss')}`,
		});
		const store = createClientStore(initial);
		const client = { store } as unknown as SolanaClient;

		const snapshots: Array<ReturnType<typeof deserializeSolanaState>> = [];
		const unsubscribe = subscribeSolanaState(client, (state) => snapshots.push(state));

		store.setState((prev) => ({
			...prev,
			wallet: {
				connectorId: 'phantom',
				session: {
					account: {
						address: 'address' as unknown as Address,
						publicKey: new Uint8Array(),
					},
					connector: { id: 'phantom', name: 'Phantom' },
					disconnect: async () => undefined,
				},
				status: 'connected',
			},
		}));

		unsubscribe();

		expect(snapshots[0]).toMatchObject({
			endpoint: baseConfig.endpoint,
			commitment: 'confirmed',
			websocketEndpoint: `${baseConfig.endpoint.replace('https', 'wss')}`,
			lastConnectorId: null,
			lastPublicKey: null,
		});
		expect(snapshots.at(-1)).toMatchObject({
			lastConnectorId: 'phantom',
			lastPublicKey: 'address',
		});
	});
});
