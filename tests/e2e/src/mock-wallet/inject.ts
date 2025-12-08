/**
 * Inject Mock Wallet Script
 *
 * This script is injected into the page to register a mock wallet
 * with the Wallet Standard registry.
 */

import type { Page } from '@playwright/test';

/**
 * Script that will be injected into the page to create and register a mock wallet.
 * This is a self-contained script that doesn't rely on external modules.
 */
const MOCK_WALLET_SCRIPT = `
(function() {
  // Check if already injected
  if (window.__mockWalletInjected) return;
  window.__mockWalletInjected = true;

  const config = window.__mockWalletConfig || {};
  const walletName = config.name || 'Mock Wallet';
  const publicKeyBase58 = config.publicKey || 'MockPubKey11111111111111111111111111111111111';
  const autoApprove = config.autoApprove !== false;
  const delay = config.delay || 100;

  // Generate a mock public key (32 bytes)
  const publicKeyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    publicKeyBytes[i] = Math.floor(Math.random() * 256);
  }

  // Event listeners storage
  const listeners = { change: [] };
  let connectedAccounts = [];
  let shouldRejectConnection = config.shouldRejectConnection || false;
  let shouldRejectTransaction = config.shouldRejectTransaction || false;

  // Create account object
  function createAccount() {
    return {
      address: publicKeyBase58,
      publicKey: publicKeyBytes,
      chains: ['solana:devnet', 'solana:testnet', 'solana:mainnet'],
      features: [
        'standard:connect',
        'standard:disconnect', 
        'standard:events',
        'solana:signMessage',
        'solana:signTransaction'
      ]
    };
  }

  // Emit events
  function emit(event, data) {
    const eventListeners = listeners[event] || [];
    eventListeners.forEach(listener => listener(data));
  }

  // Simulate delay
  function simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Mock wallet implementation
  const mockWallet = {
    version: '1.0.0',
    name: walletName,
    icon: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#9945FF" width="100" height="100" rx="20"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="40">M</text></svg>'),
    chains: ['solana:devnet', 'solana:testnet', 'solana:mainnet'],
    accounts: connectedAccounts,
    features: {
      'standard:connect': {
        version: '1.0.0',
        connect: async function(input) {
          await simulateDelay();
          
          if (shouldRejectConnection) {
            shouldRejectConnection = false;
            throw new Error('User rejected the connection request');
          }

          const account = createAccount();
          connectedAccounts = [account];
          mockWallet.accounts = connectedAccounts;
          
          emit('change', { accounts: connectedAccounts });
          
          return { accounts: connectedAccounts };
        }
      },
      'standard:disconnect': {
        version: '1.0.0',
        disconnect: async function() {
          await simulateDelay();
          connectedAccounts = [];
          mockWallet.accounts = [];
          emit('change', { accounts: [] });
        }
      },
      'standard:events': {
        version: '1.0.0',
        on: function(event, listener) {
          if (!listeners[event]) {
            listeners[event] = [];
          }
          listeners[event].push(listener);
          
          return function() {
            const idx = listeners[event].indexOf(listener);
            if (idx !== -1) {
              listeners[event].splice(idx, 1);
            }
          };
        }
      },
      'solana:signMessage': {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signMessage: async function(inputs) {
          await simulateDelay();
          
          return inputs.map(input => ({
            signedMessage: input.message,
            signature: new Uint8Array(64).fill(1) // Mock signature
          }));
        }
      },
      'solana:signTransaction': {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signTransaction: async function(inputs) {
          await simulateDelay();
          
          if (shouldRejectTransaction) {
            shouldRejectTransaction = false;
            throw new Error('User rejected the transaction');
          }

          return inputs.map(input => ({
            signedTransaction: input.transaction // Return as-is for mock
          }));
        }
      }
    }
  };

  // Control methods exposed on window for testing
  window.__mockWallet = {
    setRejectConnection: function(reject) { shouldRejectConnection = reject; },
    setRejectTransaction: function(reject) { shouldRejectTransaction = reject; },
    getPublicKey: function() { return publicKeyBase58; },
    isConnected: function() { return connectedAccounts.length > 0; },
    disconnect: async function() {
      await mockWallet.features['standard:disconnect'].disconnect();
    }
  };

  // Register with Wallet Standard
  // The wallet-standard library uses a global event to discover wallets
  function registerWallet() {
    const callback = ({ register }) => {
      register(mockWallet);
      console.log('[Mock Wallet] Registered with Wallet Standard');
    };

    // Try to register immediately if wallets API exists
    if (window.navigator?.wallets) {
      try {
        window.navigator.wallets.push(callback);
        return;
      } catch (e) {
        // Fall through to event-based registration
      }
    }

    // Use the standard registration event
    const event = new CustomEvent('wallet-standard:register-wallet', {
      detail: callback
    });
    window.dispatchEvent(event);

    // Also try the app-ready event pattern
    window.addEventListener('wallet-standard:app-ready', (e) => {
      const { register } = e.detail || {};
      if (register) {
        register(mockWallet);
        console.log('[Mock Wallet] Registered via app-ready event');
      }
    });
  }

  // Register immediately and also on DOMContentLoaded
  registerWallet();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerWallet);
  }

  console.log('[Mock Wallet] Injected and ready');
})();
`;

export interface InjectMockWalletOptions {
	/** Wallet name to display */
	name?: string;
	/** Public key to use (base58 encoded) */
	publicKey?: string;
	/** Whether to auto-approve connections */
	autoApprove?: boolean;
	/** Simulated delay in ms */
	delay?: number;
	/** Start with connection rejection enabled */
	shouldRejectConnection?: boolean;
	/** Start with transaction rejection enabled */
	shouldRejectTransaction?: boolean;
}

/**
 * Injects a mock wallet into the page that implements the Wallet Standard interface.
 * This allows E2E tests to test wallet connection flows without real browser extensions.
 *
 * @param page - Playwright page instance
 * @param options - Configuration options for the mock wallet
 */
export async function injectMockWallet(
	page: Page,
	options: InjectMockWalletOptions = {}
): Promise<void> {
	// Set config before injecting script
	await page.addInitScript((config) => {
		(window as unknown as { __mockWalletConfig: InjectMockWalletOptions }).__mockWalletConfig = config;
	}, options);

	// Inject the mock wallet script
	await page.addInitScript(MOCK_WALLET_SCRIPT);
}

/**
 * Controls the mock wallet behavior from the test.
 */
export async function setMockWalletRejectConnection(
	page: Page,
	reject: boolean
): Promise<void> {
	await page.evaluate((r) => {
		(window as unknown as { __mockWallet: { setRejectConnection: (r: boolean) => void } }).__mockWallet?.setRejectConnection(r);
	}, reject);
}

/**
 * Controls the mock wallet behavior from the test.
 */
export async function setMockWalletRejectTransaction(
	page: Page,
	reject: boolean
): Promise<void> {
	await page.evaluate((r) => {
		(window as unknown as { __mockWallet: { setRejectTransaction: (r: boolean) => void } }).__mockWallet?.setRejectTransaction(r);
	}, reject);
}

/**
 * Checks if the mock wallet is connected.
 */
export async function isMockWalletConnected(page: Page): Promise<boolean> {
	return page.evaluate(() => {
		return (window as unknown as { __mockWallet: { isConnected: () => boolean } }).__mockWallet?.isConnected() ?? false;
	});
}

/**
 * Disconnects the mock wallet.
 */
export async function disconnectMockWallet(page: Page): Promise<void> {
	await page.evaluate(() => {
		return (window as unknown as { __mockWallet: { disconnect: () => Promise<void> } }).__mockWallet?.disconnect();
	});
}
