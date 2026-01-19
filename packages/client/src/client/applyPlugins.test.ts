import { describe, expect, it } from 'vitest';

import type { Plugin, SolanaClient } from '../types';
import { applyPlugins } from './applyPlugins';

const createMockClient = () =>
	({
		actions: {} as SolanaClient['actions'],
		config: {},
		connectors: {} as SolanaClient['connectors'],
		destroy: () => {},
		helpers: {} as SolanaClient['helpers'],
		prepareTransaction: (() => {}) as unknown as SolanaClient['prepareTransaction'],
		registerPlugins: () => Promise.resolve({} as SolanaClient),
		runtime: {
			rpc: { tag: 'rpc' },
			rpcSubscriptions: { tag: 'subscriptions' },
		} as unknown as SolanaClient['runtime'],
		solTransfer: {} as SolanaClient['solTransfer'],
		SolTransfer: {} as SolanaClient['solTransfer'],
		SplHelper: (() => {}) as unknown as SolanaClient['SplHelper'],
		splToken: (() => {}) as unknown as SolanaClient['splToken'],
		SplToken: (() => {}) as unknown as SolanaClient['SplToken'],
		stake: {} as SolanaClient['stake'],
		store: {} as SolanaClient['store'],
		transaction: {} as SolanaClient['transaction'],
		watchers: {} as SolanaClient['watchers'],
		wsol: {} as SolanaClient['wsol'],
	}) as SolanaClient;

describe('applyPlugins', () => {
	it('applies a sync plugin and returns extended client', async () => {
		const baseClient = createMockClient();
		const plugin: Plugin<SolanaClient, SolanaClient & { myFeature: string }> = (client) => ({
			...client,
			myFeature: 'hello',
		});

		const result = await applyPlugins(baseClient, [plugin]);

		expect(result.myFeature).toBe('hello');
		expect(result.runtime).toBe(baseClient.runtime);
	});

	it('applies an async plugin and returns extended client', async () => {
		const baseClient = createMockClient();
		// Kit-style: Promise is part of TOutput type parameter
		const asyncPlugin: Plugin<SolanaClient, Promise<SolanaClient & { asyncFeature: number }>> = async (client) => {
			await Promise.resolve();
			return {
				...client,
				asyncFeature: 42,
			};
		};

		const result = await applyPlugins(baseClient, [asyncPlugin]);

		expect(result.asyncFeature).toBe(42);
	});

	it('applies multiple plugins in sequence', async () => {
		const baseClient = createMockClient();
		const plugin1: Plugin<SolanaClient, SolanaClient & { first: string }> = (client) => ({
			...client,
			first: 'one',
		});
		const plugin2: Plugin<SolanaClient & { first: string }, SolanaClient & { first: string; second: number }> = (
			client,
		) => ({
			...client,
			second: 2,
		});

		const result = await applyPlugins(baseClient, [plugin1, plugin2]);

		expect(result.first).toBe('one');
		expect(result.second).toBe(2);
	});

	it('plugins can access properties added by previous plugins', async () => {
		const baseClient = createMockClient();
		const plugin1: Plugin<SolanaClient, SolanaClient & { value: number }> = (client) => ({
			...client,
			value: 10,
		});
		const plugin2: Plugin<SolanaClient & { value: number }, SolanaClient & { value: number; doubled: number }> = (
			client,
		) => ({
			...client,
			doubled: client.value * 2,
		});

		const result = await applyPlugins(baseClient, [plugin1, plugin2]);

		expect(result.value).toBe(10);
		expect(result.doubled).toBe(20);
	});

	it('returns a frozen object', async () => {
		const baseClient = createMockClient();
		const plugin: Plugin<SolanaClient, SolanaClient & { feature: string }> = (client) => ({
			...client,
			feature: 'test',
		});

		const result = await applyPlugins(baseClient, [plugin]);

		expect(Object.isFrozen(result)).toBe(true);
	});

	it('extended client has registerPlugins for chaining', async () => {
		const baseClient = createMockClient();
		const plugin1: Plugin<SolanaClient, SolanaClient & { first: string }> = (client) => ({
			...client,
			first: 'one',
		});

		const extended = await applyPlugins(baseClient, [plugin1]);

		expect(typeof extended.registerPlugins).toBe('function');

		const plugin2: Plugin<typeof extended, typeof extended & { second: number }> = (client) => ({
			...client,
			second: 2,
		});

		const chained = await extended.registerPlugins([plugin2] as const);

		expect(chained.first).toBe('one');
		expect(chained.second).toBe(2);
	});

	it('original client is not modified', async () => {
		const baseClient = createMockClient();
		const plugin: Plugin<SolanaClient, SolanaClient & { newProp: string }> = (client) => ({
			...client,
			newProp: 'added',
		});

		const result = await applyPlugins(baseClient, [plugin]);

		expect(result.newProp).toBe('added');
		expect((baseClient as unknown as { newProp?: string }).newProp).toBeUndefined();
	});

	it('handles empty plugin array', async () => {
		const baseClient = createMockClient();

		const result = await applyPlugins(baseClient, []);

		expect(result.runtime).toBe(baseClient.runtime);
		expect(Object.isFrozen(result)).toBe(true);
	});

	it('plugin can override existing client properties', async () => {
		const baseClient = createMockClient();
		const newActions = { custom: true } as unknown as SolanaClient['actions'];
		const plugin: Plugin<SolanaClient, SolanaClient> = (client) => ({
			...client,
			actions: newActions,
		});

		const result = await applyPlugins(baseClient, [plugin]);

		expect(result.actions).toBe(newActions);
	});
});
