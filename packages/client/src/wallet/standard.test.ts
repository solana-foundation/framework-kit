import * as walletApp from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';
import { StandardConnect } from '@wallet-standard/features';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createWalletStandardConnector, getWalletStandardConnectors } from './standard';

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

function createStubWallet(name: string): Wallet {
	const account = {
		address: `${name}-address`,
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

describe('Wallet Standard connector metadata', () => {
	beforeEach(() => {
		(globalThis as Record<string, unknown>).window = {};
	});

	it('sets a stable id, kind, and ready flag on connectors', () => {
		const wallet = createStubWallet('Demo Wallet');
		const connector = createWalletStandardConnector(wallet);

		expect(connector.id).toBe('wallet-standard:demo-wallet');
		expect(connector.kind).toBe('wallet-standard');
		expect(connector.ready).toBe(true);
		expect(connector.canAutoConnect).toBe(true);
	});

	it('deduplicates connectors by id when discovering wallets', () => {
		const walletA = createStubWallet('Demo Wallet');
		const walletB = createStubWallet('Demo Wallet'); // same name => same derived id

		mockApp.__setWallets([walletA, walletB]);

		const connectors = getWalletStandardConnectors();
		expect(connectors).toHaveLength(1);
		expect(connectors[0].id).toBe('wallet-standard:demo-wallet');
	});
});
