import * as walletApp from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';
import { StandardConnect } from '@wallet-standard/features';
import { describe, expect, it, vi } from 'vitest';

import { autoDiscover, backpack, injected, phantom, solflare } from './connectors';

vi.mock('@wallet-standard/app', () => {
	let wallets: Wallet[] = [];
	return {
		getWallets: () => ({
			get: () => wallets,
			on: vi.fn(),
		}),
		__setWallets(newWallets: Wallet[]) {
			wallets = newWallets;
		},
	};
});

const mockApp = walletApp as unknown as { __setWallets: (wallets: Wallet[]) => void };

function stubWallet(name: string, addressBase58: string): Wallet {
	const account = {
		address: addressBase58,
		chains: ['solana:devnet'],
		features: [],
		label: 'Primary',
		publicKey: new Uint8Array([1, 2, 3]),
	};
	const connectFeature = {
		connect: vi.fn(async () => ({ accounts: [account] })),
	};
	return {
		accounts: [account],
		features: {
			[StandardConnect]: connectFeature,
		},
		name,
		version: '1.0.0',
	};
}

describe('wallet connectors factories', () => {
	it('autoDiscover returns connectors with stable id/kind/ready and dedupes by id', () => {
		const walletA = stubWallet('Demo Wallet', '11111111111111111111111111111111');
		const walletB = stubWallet('Demo Wallet', '11111111111111111111111111111112');
		mockApp.__setWallets([walletA, walletB]);

		const connectors = autoDiscover();

		expect(connectors).toHaveLength(1);
		expect(connectors[0]).toMatchObject({
			id: 'wallet-standard:demo-wallet',
			kind: 'wallet-standard',
		});
	});

	it('injected connector aggregates the first available wallet', async () => {
		const walletA = stubWallet('Wallet A', '11111111111111111111111111111111');
		mockApp.__setWallets([walletA]);
		const connector = injected();
		expect(connector.id).toBe('wallet-standard:injected');
		await expect(connector.connect()).resolves.toMatchObject({
			account: { address: '11111111111111111111111111111111' },
		});
	});

	it('phantom/solflare/backpack filters by name and overrides ids', () => {
		mockApp.__setWallets([
			stubWallet('Phantom', '11111111111111111111111111111111'),
			stubWallet('Solflare', '22222222222222222222222222222222'),
			stubWallet('Backpack', '33333333333333333333333333333333'),
		]);

		expect(phantom()).toHaveLength(1);
		expect(phantom()[0].id).toBe('wallet-standard:phantom');

		expect(solflare()).toHaveLength(1);
		expect(solflare()[0].id).toBe('wallet-standard:solflare');

		expect(backpack()).toHaveLength(1);
		expect(backpack()[0].id).toBe('wallet-standard:backpack');
	});
});
