export type { WalletHarness } from '../types';
export { BackpackHarness, createBackpackHarness } from './backpack';
export { BaseWalletHarness } from './base';
export { createPhantomHarness, PhantomHarness } from './phantom';
export { createSolflareHarness, SolflareHarness } from './solflare';

import type { WalletHarness, WalletType } from '../types';
import { createBackpackHarness } from './backpack';
import { createPhantomHarness } from './phantom';
import { createSolflareHarness } from './solflare';

/**
 * Create a wallet harness for the specified wallet type.
 */
export function createWalletHarness(type: WalletType): WalletHarness {
	switch (type) {
		case 'phantom':
			return createPhantomHarness();
		case 'solflare':
			return createSolflareHarness();
		case 'backpack':
			return createBackpackHarness();
		default:
			throw new Error(`Unsupported wallet type: ${type}`);
	}
}
