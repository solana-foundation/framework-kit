import { describe, expect, it } from 'vitest';
import { createWalletRegistry } from './registry';
import type { WalletConnector } from './types';

describe('wallet registry', () => {
	const connector = (id: string): WalletConnector => ({
		id,
		name: `wallet-${id}`,
		connect: async () => {
			throw new Error('not implemented');
		},
		disconnect: async () => undefined,
		isSupported: () => true,
	});

	it('deduplicates connectors by id and exposes lookups', () => {
		const registry = createWalletRegistry([connector('a'), connector('b'), connector('a')]);
		expect(registry.all).toHaveLength(2);
		expect(registry.get('a')?.id).toBe('a');
		expect(registry.get('unknown')).toBeUndefined();
	});

	it('resolves bare ids to canonical wallet-standard ids', () => {
		const registry = createWalletRegistry([connector('wallet-standard:phantom')]);
		expect(registry.get('phantom')?.id).toBe('wallet-standard:phantom');
	});

	it('prefers wallet-standard aliases over mwa aliases', () => {
		const registry = createWalletRegistry([connector('mwa:phantom'), connector('wallet-standard:phantom')]);
		expect(registry.get('phantom')?.id).toBe('wallet-standard:phantom');
	});

	it('falls back to mwa aliases when wallet-standard is missing', () => {
		const registry = createWalletRegistry([connector('mwa:phantom')]);
		expect(registry.get('phantom')?.id).toBe('mwa:phantom');
	});

	it('does not alias namespaced ids or walletconnect', () => {
		const registry = createWalletRegistry([connector('wallet-standard:phantom')]);
		expect(registry.get('wallet-standard:phantom')?.id).toBe('wallet-standard:phantom');
		expect(registry.get('walletconnect')).toBeUndefined();
	});

	it('keeps explicit bare connector ids as the winner', () => {
		const registry = createWalletRegistry([connector('phantom'), connector('wallet-standard:phantom')]);
		expect(registry.get('phantom')?.id).toBe('phantom');
	});
});
