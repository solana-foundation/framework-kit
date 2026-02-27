---
date: 2026-02-03T00:00:00Z
difficulty: beginner
title: "Getting Started with Framework Kit Components"
seoTitle: "Framework Kit Components for Solana - Quick Start Guide"
description:
  "Add pre-built UI components to your Solana app in minutes. Loading states,
  themed components, and copy-paste examples."
tags:
  - react
  - components
  - ui
  - solana
keywords:
  - solana react components
  - solana ui library
  - framework kit tutorial
  - solana loading states
  - react solana components
---

Build a themed loading card for your Solana app in under 5 minutes.

## What is Framework Kit?

Framework Kit is a UI component library for Solana apps, built on the Solana Kit ecosystem. It gives you production-ready React components for common patterns — loading states, address displays, transaction notifications, so you don't build them from scratch.

Built with React 19, TypeScript, Tailwind CSS v4, and Radix UI primitives. Shadcn-compatible, so you can copy, paste, and customize.

**Components available:**

| Component | Purpose |
|-----------|---------|
| Skeleton | Loading placeholders |
| AddressDisplay | Truncated addresses with copy and explorer link |
| TransactionToast | Transaction status notifications |
| ConnectWalletButton | Wallet connection with state management |
| NetworkSwitcher | Solana network selection dropdown |
| BalanceCard | Wallet balance display with token list |
| TransactionTable | Transaction history with filtering |
| WalletModal | Wallet selection modal |
| DashboardShell | Page layout with header and content slots |
| SwapInput | Token swap input with amount handling |

## Prerequisites

- React 19 project with TypeScript
- Tailwind CSS v4 configured
- `@solana/kit` and `@solana/client` installed (required for component types like `Address`, `Lamports`, `ClusterMoniker`)
- Basic React knowledge

## Setup

<Steps>

<Step title="Install the package">

<Callout type="info">
Framework Kit is currently available via the monorepo. NPM package coming soon.
</Callout>

Clone the repository and install dependencies:

```bash
git clone https://github.com/Kronos-Guild/framework-kit.git
cd framework-kit
pnpm install
```

If you're working within the monorepo, the components are at `packages/components`.

</Step>

<Step title="Configure Tailwind">

Add the components path to your CSS file. Tailwind v4 uses CSS-based configuration:

```css filename="globals.css"
@import "tailwindcss";

@source "./src/**/*.{ts,tsx}";
@source "./node_modules/@solana/components/**/*.{ts,tsx}";
```

</Step>

</Steps>

## Your First Component: Skeleton

Skeleton creates animated loading placeholders. No configuration required — just add dimensions.

```tsx
import { Skeleton } from "@solana/components";

function LoadingBar() {
  return <Skeleton className="h-4 w-32" />;
}
```

This renders an animated loading bar. The pulse animation runs automatically.

### Sizing with Tailwind

Use any Tailwind classes to control size and shape:

```tsx
// Rectangular bar
<Skeleton className="h-4 w-48" />

// Circle (avatars)
<Skeleton className="h-12 w-12 rounded-full" />

// Full width
<Skeleton className="h-4 w-full" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Tailwind classes for size and shape |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |

## Theming

All Framework Kit components support light and dark themes via the `theme` prop.

```tsx
// Light theme (default)
<Skeleton className="h-4 w-32" theme="light" />

// Dark theme
<Skeleton className="h-4 w-32" theme="dark" />
```

Components use Tailwind's zinc palette:
- **Light:** `zinc-200` background
- **Dark:** `zinc-800` background

## Build a Loading Card

Compose multiple skeletons to match your content layout. Here's a loading state for a wallet card:

```tsx filename="WalletCardSkeleton.tsx"
import { Skeleton } from "@solana/components";

function WalletCardSkeleton({ theme = "light" }: { theme?: "light" | "dark" }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
      {/* Avatar */}
      <Skeleton className="h-12 w-12 rounded-full" theme={theme} />

      <div className="flex-1 space-y-2">
        {/* Address */}
        <Skeleton className="h-4 w-32" theme={theme} />
        {/* Balance */}
        <Skeleton className="h-3 w-24" theme={theme} />
      </div>

      {/* Action button */}
      <Skeleton className="h-8 w-20 rounded-md" theme={theme} />
    </div>
  );
}
```

### Conditional Rendering

Show the skeleton while data loads, then swap in real content:

```tsx filename="WalletCard.tsx"
import { Skeleton } from "@solana/components";

interface WalletCardProps {
  address: string;
  balance: number;
  isLoading: boolean;
}

function WalletCard({ address, balance, isLoading }: WalletCardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="h-12 w-12 rounded-full bg-zinc-300" />
      <div>
        <p className="font-mono text-sm">
          {address.slice(0, 4)}...{address.slice(-4)}
        </p>
        <p className="text-zinc-500">{balance} SOL</p>
      </div>
    </div>
  );
}
```

## Complete Example

A full component with theme toggle and simulated loading:

```tsx filename="App.tsx"
import { useState, useEffect } from "react";
import { Skeleton } from "@solana/components";

type Theme = "light" | "dark";

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const reload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className={theme === "dark" ? "bg-zinc-900 text-white min-h-screen" : "bg-white min-h-screen"}>
      <div className="p-8 max-w-md mx-auto space-y-6">
        {/* Theme controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className="px-3 py-1 rounded border"
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className="px-3 py-1 rounded border"
          >
            Dark
          </button>
          <button
            onClick={reload}
            className="px-3 py-1 rounded border"
          >
            Reload
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" theme={theme} />

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border rounded-lg border-zinc-200 dark:border-zinc-700"
              >
                <Skeleton className="h-10 w-10 rounded-full" theme={theme} />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" theme={theme} />
                  <Skeleton className="h-3 w-2/3" theme={theme} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">My Wallets</h1>
            <p className="text-zinc-500">Your content loads here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

Copy this into your project. Click "Reload" to see the loading states. Toggle between light and dark themes.

## Next Steps

You've got loading states covered. Next:

- **[Building Transaction UIs with Framework Kit](/docs/guides/transaction-toasts)** — Display pending, success, and error states for Solana transactions using TransactionToast.

- **[Building a Complete Wallet UI](/docs/guides/wallet-ui)** — Combine Skeleton, AddressDisplay, and TransactionToast into a production-ready wallet interface.

For the full component API, check the source in the [Framework Kit repository](https://github.com/Kronos-Guild/framework-kit).
