/**
 * Mock Wallet Standard Implementation for E2E Testing
 *
 * This module provides a mock wallet that implements the Wallet Standard interface,
 * allowing E2E tests to run without actual browser extensions.
 */

export {
	injectMockWallet,
	setMockWalletRejectConnection,
	setMockWalletRejectTransaction,
	isMockWalletConnected,
	disconnectMockWallet,
	type InjectMockWalletOptions,
} from './inject';
