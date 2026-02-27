---
date: 2026-02-03T00:00:00Z
difficulty: beginner
title: "Building Transaction UIs with Framework Kit"
seoTitle: "Solana Transaction Feedback UI - Toast Notifications Guide"
description:
  "Show users what's happening with their Solana transactions. Pending, success,
  and error states with Explorer links."
tags:
  - react
  - components
  - transactions
  - solana
keywords:
  - solana transaction toast
  - transaction feedback ui
  - solana ux
  - solana transaction status
---

Show users what's happening with their transactions; pending, success, or failed, with one component.

## Why Transaction Feedback Matters

Your user clicks "Send SOL." Then... nothing. They stare at the screen. Did it work? Is it pending? They click again. Now you might have a double spend problem.

Good transaction UX means three things:

1. Show a pending state immediately
2. Confirm success or explain failure
3. Give users a way to verify (Explorer link)

TransactionToast handles all of this.

## What You Get

- **Three states:** pending, success, error
- **Three types:** sent, received, swapped (each with appropriate messages)
- **Explorer link:** Users can click to verify on Solana Explorer
- **Auto-dismiss:** Success toasts disappear after 5 seconds; pending and error stay until dismissed
- **Theming:** Light and dark modes

## Prerequisites

- React 19 project with TypeScript
- Tailwind CSS v4 configured
- Framework Kit installed ([Guide 1](/docs/guides/getting-started) covers setup)

## Setup: The Provider

Wrap your app with `TransactionToastProvider`. This manages all toasts in your application.

<Steps>

<Step title="Add the provider"> 

```tsx filename="App.tsx"
import { TransactionToastProvider } from "@solana/components";

function App() {
  return (
    <TransactionToastProvider theme="light">
      <YourApp />
    </TransactionToastProvider>
  );
}
```

The `theme` prop sets the default theme for all toasts. You can use `"light"` or `"dark"`.

</Step>

</Steps>

## Your First Toast

Use the `useTransactionToast` hook to trigger toasts from any component inside the provider.

```tsx filename="SendButton.tsx"
import { useTransactionToast } from "@solana/components";

function SendButton() {
  const { toast } = useTransactionToast();

  const handleClick = () => {
    toast({
      signature: "5xG7abc...9Kp2",
      status: "success",
      type: "sent",
      network: "devnet",
    });
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
```

Click the button. A toast appears showing "Transaction sent successfully" with a link to Solana Explorer.

### Hook Return Values

| Method | Description |
|--------|-------------|
| `toast(data)` | Show a toast, returns an ID |
| `update(id, data)` | Update an existing toast |
| `dismiss(id)` | Remove a toast |

## The Core Pattern: Pending → Success/Error

Here's what you'll actually use in production. The pattern is:

1. Show a pending toast when the transaction starts
2. Capture the toast ID
3. Update the same toast when the transaction confirms or fails

```tsx filename="SendTransaction.tsx"
import { useTransactionToast } from "@solana/components";

function SendTransaction() {
  const { toast, update } = useTransactionToast();

  const handleSend = async () => {
    // 1. Show pending toast, capture ID
    const toastId = toast({
      signature: "5xG7abc...9Kp2",
      status: "pending",
      type: "sent",
      network: "devnet",
    });

    try {
      // 2. Wait for transaction confirmation
      await simulateTransaction();

      // 3a. Update to success
      update(toastId, { status: "success" });
    } catch (error) {
      // 3b. Update to error
      update(toastId, { status: "error" });
    }
  };

  return <button onClick={handleSend}>Send SOL</button>;
}

// Simulates network delay
function simulateTransaction() {
  return new Promise((resolve) => setTimeout(resolve, 2000));
}
```

<Callout type="info">
The toast ID is the key. It lets you update the same toast instead of creating new ones. Your users see one toast that changes state, not multiple toasts appearing.
</Callout>

## The Explorer Link

Every toast includes a "View" link to Solana Explorer. Users can click to verify their transaction on-chain.

The link is generated automatically using the `signature` and `network` props:

```
https://explorer.solana.com/tx/{signature}?cluster={network}
```

<Callout type="warn">
The `network` prop matters. If you're developing on devnet but pass `"mainnet-beta"`, the Explorer link will point to the wrong cluster and show "Transaction not found."
</Callout>

**Common networks:**
- `"devnet"` — for development
- `"testnet"` — for testing
- `"mainnet-beta"` — for production

## Transaction Types

The `type` prop changes the toast message. Choose based on what the user did:

| Type | Pending | Success | Error |
|------|---------|---------|-------|
| `sent` | Transaction pending... | Transaction sent successfully | Transaction failed |
| `received` | Transaction pending... | Transaction received successfully | Transaction failed |
| `swapped` | Swap pending... | Swap completed successfully | Swap failed |

```tsx
// User sent SOL
toast({ signature, status: "pending", type: "sent", network });

// User received SOL
toast({ signature, status: "pending", type: "received", network });

// User swapped tokens
toast({ signature, status: "pending", type: "swapped", network });
```

## Theming

Set the theme on the provider. All toasts inherit it.

```tsx
// Light theme (default)
<TransactionToastProvider theme="light">

// Dark theme
<TransactionToastProvider theme="dark">
```

Toasts use the zinc color palette:
- **Light:** `zinc-50` background, `zinc-900` text
- **Dark:** `zinc-800` background, `zinc-50` text

For more on theming, see [Guide 1](/docs/guides/getting-started#theming).

## Where Does the Signature Come From?

When you send a transaction on Solana, you get back a signature — a unique string identifying that transaction. That's what you pass to the toast.

```tsx
import { useSolTransfer } from "@solana/react-hooks";

function SendSol() {
  const { toast, update } = useTransactionToast();
  const { send } = useSolTransfer();

  const handleSend = async () => {
    // Send transaction, get signature back
    const signature = await send({
      destination: "J4AJ...MAAP",
      amount: 1_000_000_000, // 1 SOL in lamports
    });

    // Show pending toast with real signature
    const toastId = toast({
      signature,
      status: "pending",
      type: "sent",
      network: "devnet",
    });

    // Wait for confirmation, then update
    // (in practice, you'd listen for confirmation)
    update(toastId, { status: "success" });
  };

  return <button onClick={handleSend}>Send 1 SOL</button>;
}
```

This connects the component to real Solana transactions. Guide 3 covers the full integration pattern.

## Complete Example

Here's a full working example with multiple transaction simulations:

```tsx filename="App.tsx"
import { useState } from "react";
import {
  TransactionToastProvider,
  useTransactionToast,
} from "@solana/components";

type Theme = "light" | "dark";

function App() {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <TransactionToastProvider theme={theme}>
      <div
        className={
          theme === "dark"
            ? "bg-zinc-900 text-white min-h-screen"
            : "bg-white min-h-screen"
        }
      >
        <div className="p-8 max-w-md mx-auto space-y-6">
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
          </div>

          <TransactionButtons />
        </div>
      </div>
    </TransactionToastProvider>
  );
}

function TransactionButtons() {
  const { toast, update } = useTransactionToast();

  // Generates a fake signature for demo purposes
  const fakeSignature = () =>
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const simulateSuccess = async () => {
    const toastId = toast({
      signature: fakeSignature(),
      status: "pending",
      type: "sent",
      network: "devnet",
    });

    await new Promise((r) => setTimeout(r, 2000));
    update(toastId, { status: "success" });
  };

  const simulateError = async () => {
    const toastId = toast({
      signature: fakeSignature(),
      status: "pending",
      type: "sent",
      network: "devnet",
    });

    await new Promise((r) => setTimeout(r, 2000));
    update(toastId, { status: "error" });
  };

  const simulateSwap = async () => {
    const toastId = toast({
      signature: fakeSignature(),
      status: "pending",
      type: "swapped",
      network: "devnet",
    });

    await new Promise((r) => setTimeout(r, 3000));
    update(toastId, { status: "success" });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={simulateSuccess}
        className="w-full px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
      >
        Simulate Successful Send
      </button>
      <button
        onClick={simulateError}
        className="w-full px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
      >
        Simulate Failed Send
      </button>
      <button
        onClick={simulateSwap}
        className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Simulate Token Swap
      </button>
    </div>
  );
}

export default App;
```

Copy this into your project. Click the buttons to see pending → success/error transitions. Toggle themes. Click "View" to open Solana Explorer.

## Next Steps

You've got transaction feedback covered. Next:

- **[Building a Complete Wallet UI](/docs/guides/wallet-ui)** — Combine Skeleton, AddressDisplay, TransactionToast, and more into a production-ready wallet interface.

For the full component API, check the [Framework Kit repository](https://github.com/Kronos-Guild/framework-kit).
