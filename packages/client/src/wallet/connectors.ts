import { getWallets } from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';
import { StandardConnect } from '@wallet-standard/features';
import type { WalletConnector } from '../types';
import { createWalletStandardConnector } from './standard';

type DiscoveryOptions = Readonly<{
	overrides?: (wallet: Wallet) => Parameters<typeof createWalletStandardConnector>[1];
	filter?: (wallet: Wallet) => boolean;
}>;

/**
 * Returns connectors for all Wallet Standard wallets currently registered.
 */
export function autoDiscover(options: DiscoveryOptions = {}): readonly WalletConnector[] {
	const { get } = getWallets();
	const wallets = get().filter((wallet) => (options.filter ? options.filter(wallet) : true));
	const connectors = wallets.map((wallet) => createWalletStandardConnector(wallet, options.overrides?.(wallet)));

	// Deduplicate by connector id.
	const seen = new Set<string>();
	return connectors.filter((connector) => {
		if (seen.has(connector.id)) return false;
		seen.add(connector.id);
		return true;
	});
}

/**
 * Creates a connector for any Wallet Standard wallet that supports connect.
 */
export function injected(options?: Parameters<typeof createWalletStandardConnector>[1]): WalletConnector {
	const connector: WalletConnector = {
		canAutoConnect: true,
		id: 'wallet-standard:injected',
		kind: 'wallet-standard',
		name: 'Injected Wallet',
		ready: typeof window !== 'undefined',
		async connect() {
			const wallets = getWallets().get();
			const first = wallets.find((wallet) => StandardConnect in wallet.features);
			if (!first) {
				throw new Error('No Wallet Standard wallets available.');
			}
			return createWalletStandardConnector(first, options).connect();
		},
		async disconnect() {
			// No-op: injected aggregate does not manage specific wallet state.
		},
		isSupported() {
			return typeof window !== 'undefined';
		},
	};
	return connector;
}

function filterByName(name: string) {
	const lower = name.toLowerCase();
	return (wallet: Wallet) => wallet.name.toLowerCase().includes(lower);
}

/**
 * Factory for a Phantom-only connector.
 */
export function phantom(options?: Parameters<typeof createWalletStandardConnector>[1]): readonly WalletConnector[] {
	return autoDiscover({
		filter: filterByName('phantom'),
		overrides: () => ({ ...options, id: 'wallet-standard:phantom' }),
	});
}

/**
 * Factory for a Solflare-only connector.
 */
export function solflare(options?: Parameters<typeof createWalletStandardConnector>[1]): readonly WalletConnector[] {
	return autoDiscover({
		filter: filterByName('solflare'),
		overrides: () => ({ ...options, id: 'wallet-standard:solflare' }),
	});
}

/**
 * Factory for a Backpack-only connector.
 */
export function backpack(options?: Parameters<typeof createWalletStandardConnector>[1]): readonly WalletConnector[] {
	return autoDiscover({
		filter: filterByName('backpack'),
		overrides: () => ({ ...options, id: 'wallet-standard:backpack' }),
	});
}
