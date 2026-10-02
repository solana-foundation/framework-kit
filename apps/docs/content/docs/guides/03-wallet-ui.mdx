---
date: 2026-02-06T00:00:00Z
difficulty: intermediate
title: "The First 60 Seconds: Building a Complete Wallet UI"
seoTitle: "Complete Solana Wallet UI - Connect, Display Balance, Switch Networks"
description:
  "Build the complete wallet connection experience. From Connect Wallet button
  to showing balance, copying addresses, and switching networks."
tags:
  - react
  - components
  - wallet
  - ui
  - solana
keywords:
  - solana wallet connect
  - solana wallet ui
  - connect wallet button react
  - solana balance display
  - network switcher solana
---

Your users judge your dApp in the first 10 seconds.

Before they see your killer feature, before they experience your protocol, they see a button that says "Connect Wallet." What happens next determines whether they stay or leave.

This guide builds the complete first-impression experience.

## What You'll Build

By the end of this guide, you'll have:

- A "Connect Wallet" button that opens a wallet selection modal
- Wallet modal with multiple provider options (Phantom, Solflare, Backpack)
- Connected state showing truncated address with copy functionality
- Balance card displaying SOL and token balances
- Network switcher for mainnet/devnet/testnet
- Proper loading, error, and empty states throughout

## Prerequisites

- Completed [Guide 1: Getting Started](/docs/guides/getting-started) or equivalent setup
- React 19 + TypeScript + Tailwind CSS v4
- Familiarity with Solana wallets (you've used one before)

## The Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `ConnectWalletButton` | Entry point, shows "Connect" or connected state | `status`, `wallet`, `onConnect`, `onDisconnect` |
| `WalletModal` | Wallet selection dialog | `wallets`, `view`, `onSelectWallet`, `onClose` |
| `BalanceCard` | Display balance + token list | `totalBalance`, `tokens`, `walletAddress` |
| `NetworkSwitcher` | Switch between networks | `selectedNetwork`, `onNetworkChange` |
| `AddressDisplay` | Truncated address + copy + explorer | `address`, `network` |

We'll build these incrementally, starting with the connect button.

## Step 1: The Connect Button

The `ConnectWalletButton` is your entry point. It handles three states: disconnected, connecting, and connected.

### Disconnected State

```tsx filename="WalletButton.tsx"
import { ConnectWalletButton } from '@solana/components';

function WalletButton() {
  return (
    <ConnectWalletButton
      status="disconnected"
      onConnect={() => console.log('Open wallet modal')}
    />
  );
}
```

This renders a button with "Connect Wallet" text. When clicked, it fires `onConnect`, you'll wire this to open the wallet modal.

### Connecting State

```tsx
<ConnectWalletButton status="connecting" />
```

The button disables and shows a loading indicator. Users know something is happening.

### Connected State

```tsx filename="WalletButton.tsx"
import { ConnectWalletButton } from '@solana/components';
import { address, lamports } from '@solana/kit';

function WalletButton() {
  const wallet = { address: address('6DMh7fYHrKdCJwCFUQfMfNAdLADi9xqsRKNzmZA31DkK') };
  const connector = { id: 'phantom', name: 'Phantom', icon: '/phantom.svg' };
  const balance = lamports(2_500_000_000n); // 2.5 SOL

  return (
    <ConnectWalletButton
      status="connected"
      wallet={wallet}
      currentConnector={connector}
      balance={balance}
      onDisconnect={() => console.log('Disconnect')}
    />
  );
}
```

When connected, the button shows the wallet icon and truncated address. Click it to open a dropdown with balance info and a disconnect option.

<Callout type="info">
The button manages its own dropdown state. You control the connection status; it handles the rest.
</Callout>

### Full Example with State

```tsx filename="WalletButton.tsx"
import { ConnectWalletButton } from '@solana/components';
import { type Address } from '@solana/kit';
import { useState } from 'react';

type Status = 'disconnected' | 'connecting' | 'connected' | 'error';

function WalletButton({ onOpenModal }: { onOpenModal: () => void }) {
  const [status, setStatus] = useState<Status>('disconnected');
  const [wallet, setWallet] = useState<{ address: Address } | null>(null);

  const handleConnect = () => {
    onOpenModal();
  };

  const handleDisconnect = async () => {
    setStatus('disconnected');
    setWallet(null);
  };

  return (
    <ConnectWalletButton
      status={status}
      wallet={wallet ?? undefined}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      theme="dark"
    />
  );
}
```

## Step 2: The Wallet Modal

When users click "Connect Wallet," they need to choose which wallet to use. The `WalletModal` handles this with three views: list, connecting, and error.

### List View

```tsx filename="WalletConnect.tsx"
import { WalletModal } from '@solana/components';
import type { WalletConnectorMetadata } from '@solana/client';

const wallets: WalletConnectorMetadata[] = [
  { id: 'phantom', name: 'Phantom', icon: 'https://phantom.app/icon.png' },
  { id: 'solflare', name: 'Solflare', icon: 'https://solflare.com/icon.png' },
  { id: 'backpack', name: 'Backpack', icon: 'https://backpack.app/icon.png' },
];

function WalletConnect({ onClose }: { onClose: () => void }) {
  const handleSelect = (wallet: WalletConnectorMetadata) => {
    console.log('Selected:', wallet.name);
    // Start connection flow
  };

  return (
    <WalletModal
      wallets={wallets}
      view="list"
      onSelectWallet={handleSelect}
      onClose={onClose}
      theme="dark"
    />
  );
}
```

Each wallet shows as a clickable row with icon and name. The "I don't have a wallet" link appears at the bottom by default.

### Connecting View

```tsx
<WalletModal
  wallets={wallets}
  view="connecting"
  connectingWallet={{ id: 'phantom', name: 'Phantom', icon: '...' }}
  onBack={() => setView('list')}
  onClose={onClose}
/>
```

Shows which wallet you're connecting to with a loading indicator. The back button returns to the list.

### Error View

```tsx
<WalletModal
  wallets={wallets}
  view="error"
  error={{ title: 'Connection Failed', message: 'User rejected the request' }}
  onRetry={() => setView('connecting')}
  onClose={onClose}
/>
```

<Callout type="warn">
Always handle the error state. Users will click the wrong wallet, decline the connection, or have extension issues. Make recovery obvious.
</Callout>

### Modal Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `wallets` | `WalletConnectorMetadata[]` | Available wallets to display |
| `view` | `'list' \| 'connecting' \| 'error'` | Current modal view |
| `connectingWallet` | `WalletConnectorMetadata` | Wallet being connected (for connecting view) |
| `error` | `{ title?: string; message?: string }` | Error info (for error view) |
| `onSelectWallet` | `(wallet) => void` | Fires when wallet is selected |
| `onBack` | `() => void` | Fires when back button is clicked |
| `onClose` | `() => void` | Fires when close button is clicked |
| `onRetry` | `() => void` | Fires when retry button is clicked |
| `showNoWalletLink` | `boolean` | Show "I don't have a wallet" (default: true) |
| `theme` | `'light' \| 'dark'` | Color theme |

## Step 3: Showing the Balance

Once connected, users want to see their balance. The `BalanceCard` handles this with support for loading states, errors, and token lists.

### Basic Usage

```tsx filename="WalletDashboard.tsx"
import { BalanceCard } from '@solana/components';
import { address, lamports } from '@solana/kit';

function WalletDashboard() {
  const walletAddress = address('6DMh7fYHrKdCJwCFUQfMfNAdLADi9xqsRKNzmZA31DkK');
  const balance = lamports(34_810_000_000n); // ~34.81 SOL

  return (
    <BalanceCard
      walletAddress={walletAddress}
      totalBalance={balance}
    />
  );
}
```

This displays the wallet address (truncated, with copy button) and the balance converted from lamports.

### Fiat Display

```tsx
<BalanceCard
  walletAddress={walletAddress}
  totalBalance={balance}
  isFiatBalance={true}
  currency="USD"
/>
```

When `isFiatBalance` is true, the balance shows with a currency symbol ($34.81 instead of 34.81 SOL).

### With Token List

```tsx filename="WalletDashboard.tsx"
const tokens = [
  { symbol: 'USDC', balance: 150.50, fiatValue: 150.50 },
  { symbol: 'USDT', balance: 75.25, fiatValue: 75.25 },
  { symbol: 'BONK', balance: 1_000_000, fiatValue: 12.50 },
];

<BalanceCard
  walletAddress={walletAddress}
  totalBalance={balance}
  tokens={tokens}
  defaultExpanded={false}
/>
```

The token list is collapsible. Click "View all tokens" to expand. Empty state shows "No tokens yet."

### Loading State

```tsx
<BalanceCard
  totalBalance={lamports(0n)}
  isLoading={true}
/>
```

Shows an animated skeleton while data loads.

### Error State

```tsx
<BalanceCard
  totalBalance={lamports(0n)}
  error="Failed to load balance"
  onRetry={() => refetchBalance()}
/>
```

Shows the error message with a "Try again" button.

### BalanceCard Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `walletAddress` | `Address` | Wallet address to display |
| `totalBalance` | `Lamports` | Balance in lamports (bigint) |
| `tokens` | `TokenInfo[]` | Token list for expandable section |
| `isFiatBalance` | `boolean` | Display as fiat with currency symbol |
| `currency` | `string` | Currency code (default: "USD") |
| `isLoading` | `boolean` | Show skeleton loading state |
| `error` | `string \| Error` | Error message to display |
| `onRetry` | `() => void` | Callback for retry button |
| `onCopyAddress` | `(address) => void` | Callback when address is copied |
| `variant` | `'default' \| 'dark' \| 'light'` | Color variant |
| `size` | `'sm' \| 'md' \| 'lg'` | Size variant |

## Step 4: Network Switching

Let users switch between mainnet, devnet, and testnet with `NetworkSwitcher`.

### Basic Usage

```tsx filename="NetworkControl.tsx"
import { NetworkSwitcher } from '@solana/components';
import type { ClusterMoniker } from '@solana/client';
import { useState } from 'react';

function NetworkControl() {
  const [network, setNetwork] = useState<ClusterMoniker>('mainnet-beta');

  return (
    <NetworkSwitcher
      selectedNetwork={network}
      onNetworkChange={setNetwork}
      theme="dark"
    />
  );
}
```

Click the trigger to open a dropdown. Select a network and it closes automatically.

### Custom Networks

```tsx
const networks = [
  { id: 'mainnet-beta', label: 'Mainnet' },
  { id: 'devnet', label: 'Devnet' },
  // Omit testnet if you don't need it
];

<NetworkSwitcher
  selectedNetwork={network}
  networks={networks}
  onNetworkChange={setNetwork}
/>
```

### Controlled Mode

```tsx
const [open, setOpen] = useState(false);

<NetworkSwitcher
  selectedNetwork={network}
  open={open}
  onOpenChange={setOpen}
  onNetworkChange={(n) => {
    setNetwork(n);
    setOpen(false);
  }}
/>
```

Use `open` and `onOpenChange` when you need external control over the dropdown.

## Putting It Together

Here's a complete wallet UI that combines all components:

```tsx filename="CompleteWalletUI.tsx"
import {
  ConnectWalletButton,
  WalletModal,
  BalanceCard,
  NetworkSwitcher,
} from '@solana/components';
import { address, lamports, type Address } from '@solana/kit';
import type { ClusterMoniker } from '@solana/client';
import { useState } from 'react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
type ModalView = 'list' | 'connecting' | 'error';

const WALLETS = [
  { id: 'phantom', name: 'Phantom', icon: 'https://phantom.app/icon.png' },
  { id: 'solflare', name: 'Solflare', icon: 'https://solflare.com/icon.png' },
];

export function CompleteWalletUI() {
  // Connection state
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [wallet, setWallet] = useState<{ address: Address } | null>(null);
  const [connector, setConnector] = useState<typeof WALLETS[0] | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('list');
  const [connectingWallet, setConnectingWallet] = useState<typeof WALLETS[0] | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  // Network state
  const [network, setNetwork] = useState<ClusterMoniker>('devnet');

  // Mock balance (in real app, fetch from RPC)
  const balance = lamports(2_500_000_000n);

  const handleSelectWallet = async (selected: typeof WALLETS[0]) => {
    setConnectingWallet(selected);
    setModalView('connecting');
    setStatus('connecting');

    try {
      // Simulate connection delay
      await new Promise((r) => setTimeout(r, 1500));

      // Success
      setWallet({ address: address('6DMh7fYHrKdCJwCFUQfMfNAdLADi9xqsRKNzmZA31DkK') });
      setConnector(selected);
      setStatus('connected');
      setModalOpen(false);
      setModalView('list');
    } catch (err) {
      setError({ title: 'Connection Failed', message: 'User rejected the request' });
      setModalView('error');
      setStatus('disconnected');
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    setConnector(null);
    setStatus('disconnected');
  };

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-white">My dApp</h1>
        <div className="flex items-center gap-3">
          <NetworkSwitcher
            selectedNetwork={network}
            onNetworkChange={setNetwork}
            theme="dark"
          />
          <ConnectWalletButton
            status={status}
            wallet={wallet ?? undefined}
            currentConnector={connector ?? undefined}
            balance={balance}
            onConnect={() => setModalOpen(true)}
            onDisconnect={handleDisconnect}
            theme="dark"
          />
        </div>
      </header>

      {/* Main Content */}
      <main>
        {status === 'connected' && wallet ? (
          <BalanceCard
            walletAddress={address(wallet.address)}
            totalBalance={balance}
            variant="dark"
            tokens={[
              { symbol: 'USDC', balance: 150.5, fiatValue: 150.5 },
              { symbol: 'BONK', balance: 1_000_000, fiatValue: 12.5 },
            ]}
          />
        ) : (
          <div className="text-center py-16 text-zinc-400">
            Connect your wallet to get started
          </div>
        )}
      </main>

      {/* Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <WalletModal
            wallets={WALLETS}
            view={modalView}
            connectingWallet={connectingWallet}
            error={error}
            onSelectWallet={handleSelectWallet}
            onBack={() => setModalView('list')}
            onClose={() => {
              setModalOpen(false);
              setModalView('list');
              if (status === 'connecting') setStatus('disconnected');
            }}
            onRetry={() => connectingWallet && handleSelectWallet(connectingWallet)}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
}
```

This gives you a complete, working wallet UI. Users can:
1. Click "Connect Wallet" to open the modal
2. Select their wallet provider
3. See the connecting state while the wallet extension responds
4. View their balance and tokens once connected
5. Switch networks
6. Disconnect when done

## Production Considerations

### SSR and Hydration

If you're using Next.js or another SSR framework, wallet state isn't available on the server. Use the `isReady` prop:

```tsx
<ConnectWalletButton
  status={status}
  isReady={mounted} // false during SSR, true after hydration
  wallet={wallet}
  onConnect={openModal}
/>
```

When `isReady` is false, the button shows "Connect Wallet" and is disabled, preventing hydration mismatches.

### Accessibility

All components include proper ARIA attributes out of the box:
- Modal has `role="dialog"` and `aria-modal="true"`
- Buttons have `aria-expanded` and `aria-haspopup` where appropriate
- Escape key closes dropdowns and modals

### Error Recovery

Handle these common scenarios:
- **Wallet not installed**: Show a link to install (the modal's "I don't have a wallet" helps here)
- **User rejected**: Display the error view with a clear retry path
- **Network timeout**: Show error with retry button
- **Wrong network**: The NetworkSwitcher lets users fix this themselves

## Next Steps

You've built the foundation. Your users can now connect their wallet, see their balance, and switch networks, all with proper loading states and error handling.

Everything else you build sits on top of this experience.

**Next: [Guide 4: Sending Your First Transaction](/docs/guides/sending-transactions)** (coming soon)

**Resources:**
- [Component API Reference](/docs/components)
- [Source code on GitHub](https://github.com/Kronos-Guild/framework-kit)
