# Framework Kit Components

Headless-friendly, theme-aware UI components for Solana dApps. Built with React 19, Tailwind CSS v4, and the Solana Web3.js v2 type system (`@solana/kit`, `@solana/client`).

All components are purely presentational — they accept data and callbacks as props and own zero chain logic. Your app provides wallet connection, balance fetching, transaction signing, and price quoting through hooks and services; these components render the result.

## Quick start

```tsx
import {
  DashboardShell,
  ConnectWalletButton,
  NetworkSwitcher,
  BalanceCard,
  SwapInput,
  TransactionTable,
  WalletModal,
  TransactionToastProvider,
} from './kit-components/ui';
```

Every component lives under `src/kit-components/ui/<component-name>/` and is re-exported from the barrel `src/kit-components/ui/index.ts`.

## Theming

Components use CSS custom properties mapped through Tailwind's `@theme inline` block in `src/index.css`. Override any token on an ancestor element to re-theme an entire subtree with zero code changes.

### Core tokens

| Token | Tailwind class | Purpose |
|---|---|---|
| `--background` | `bg-background` | Page / shell background |
| `--foreground` | `text-foreground` | Default body text |
| `--card` / `--card-foreground` | `bg-card`, `text-card-foreground` | Card surfaces |
| `--secondary` | `bg-secondary` | Subtle surfaces (skeleton, triggers) |
| `--muted` / `--muted-foreground` | `bg-muted`, `text-muted-foreground` | De-emphasized UI |
| `--accent` / `--accent-foreground` | `bg-accent` | Hover / active highlights |
| `--primary` / `--primary-foreground` | `bg-primary` | Primary buttons |
| `--destructive` | `text-destructive` | Errors |
| `--success` / `--success-foreground` | `text-success`, `bg-success` | Success states |
| `--warning` / `--warning-foreground` | `text-warning` | Warnings |
| `--border` | `border-border` | All borders |
| `--ring` | `ring-ring` | Focus rings |

Dark mode activates via the `.dark` class on any ancestor (custom variant `&:is(.dark *)`).

### Custom theme example

```css
.my-theme {
  --background: oklch(0.15 0.02 280);
  --primary: oklch(0.65 0.25 300);
  --card: oklch(0.2 0.02 280);
  /* ... override any token */
}
```

```tsx
<div className="my-theme">
  <BalanceCard totalBalance={balance} tokenSymbol="SOL" />
  {/* All children pick up the overridden tokens */}
</div>
```

---

## Components

### DashboardShell

Full-page layout wrapper with a header slot, main content area, and optional dot-grid background pattern.

```tsx
<DashboardShell
  header={
    <div className="flex w-full items-center justify-between">
      <NetworkSwitcher selectedNetwork="mainnet-beta" />
      <ConnectWalletButton status={status} onConnect={openModal} />
    </div>
  }
>
  <BalanceCard totalBalance={balance} tokenSymbol="SOL" />
</DashboardShell>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `header` | `ReactNode` | — | Slot for nav, wallet buttons, etc. Renders inside `<header>` |
| `children` | `ReactNode` | — | Main content. Renders inside `<main>` |
| `showDotGrid` | `boolean` | `true` | Radial-gradient dot pattern background |
| `rounded` | `boolean` | `true` | Applies `rounded-3xl` to the shell |
| `headerClassName` | `string` | — | Extra classes on the `<header>` |
| `contentClassName` | `string` | — | Extra classes on `<main>` |

Both `<header>` and `<main>` use `relative` positioning without `z-index`, so dropdown menus inside the header can layer above main content naturally.

---

### ConnectWalletButton

Wallet connection button with three visual states (disconnected, connecting, connected) and an integrated dropdown for the connected wallet.

```tsx
const { status, wallet, isReady, disconnect, currentConnector } = useWalletConnection();
const { lamports } = useBalance(wallet?.address);

<ConnectWalletButton
  status={status}
  isReady={isReady}
  wallet={wallet ? { address: wallet.address } : undefined}
  currentConnector={currentConnector}
  balance={lamports}
  onConnect={modal.open}
  onDisconnect={disconnect}
  selectedNetwork="mainnet-beta"
  networkStatus="connected"
  onNetworkChange={handleNetworkChange}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `status` | `'disconnected' \| 'connecting' \| 'connected' \| 'error'` | **required** | Current connection status |
| `isReady` | `boolean` | `true` | SSR hydration guard — shows disconnected until `true` |
| `wallet` | `{ address: Address; publicKey?: ... }` | — | Connected wallet session |
| `currentConnector` | `{ id: string; name: string; icon?: string }` | — | Wallet adapter metadata |
| `balance` | `Lamports` | — | Wallet balance in lamports (bigint) |
| `balanceLoading` | `boolean` | `false` | Show loading indicator for balance |
| `onConnect` | `() => void` | — | Called when button is clicked in disconnected state |
| `onDisconnect` | `() => Promise<void> \| void` | — | Called from the dropdown disconnect action |
| `labels` | `{ connect?, connecting?, disconnect? }` | — | Override button text |
| `selectedNetwork` | `ClusterMoniker` | — | For the embedded network trigger |
| `networkStatus` | `WalletStatus['status']` | — | Network connection status |
| `onNetworkChange` | `(network: ClusterMoniker) => void` | — | Network switch handler |

The dropdown closes on outside click and Escape. It includes balance display (with a visibility toggle), address display, an embedded network trigger, and a disconnect button.

---

### NetworkSwitcher

Dropdown for switching between Solana clusters. Supports both controlled and uncontrolled open state.

```tsx
<NetworkSwitcher
  selectedNetwork="mainnet-beta"
  status="connected"
  onNetworkChange={(network) => {
    const resolved = resolveCluster({ moniker: network });
    actions.setCluster(resolved.endpoint);
  }}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `selectedNetwork` | `ClusterMoniker` | **required** | Currently active network |
| `status` | `WalletStatus['status']` | `'connected'` | Status indicator (green dot / spinner / red dot) |
| `onNetworkChange` | `(network: ClusterMoniker) => void` | — | Fired when a network is selected |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Open state change handler |
| `networks` | `Network[]` | `DEFAULT_NETWORKS` | Available networks |
| `disabled` | `boolean` | `false` | Disable the trigger |

Default networks: Mainnet, Testnet, Localnet, Devnet. The trigger button displays the selected network name and a status indicator.

**Sub-components** (all exported): `NetworkTrigger`, `NetworkDropdown`, `NetworkOption`, `NetworkHeader`, `StatusIndicator`.

---

### BalanceCard

Displays a wallet balance with optional token list, loading skeleton, and error state.

```tsx
<BalanceCard
  walletAddress={walletAddress}
  totalBalance={4_500_000_000n as Lamports}
  tokenSymbol="SOL"
  tokens={[
    { symbol: 'SOL', name: 'Solana', balance: 4.5, fiatValue: 598.5 },
    { symbol: 'USDC', name: 'USD Coin', balance: 250.0, fiatValue: 250.0 },
  ]}
  isLoading={false}
  size="md"
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `totalBalance` | `Lamports` | **required** | Balance as lamports bigint |
| `tokenSymbol` | `string` | — | Symbol shown after balance (e.g. `"SOL"` renders `"4.50 SOL"`) |
| `isFiatBalance` | `boolean` | `false` | When `true`, formats as fiat (e.g. `"$4.50"`) |
| `tokenDecimals` | `number` | `9` | Decimals for the balance token |
| `displayDecimals` | `number` | `2` | Number of decimal places to show |
| `currency` | `string` | `'USD'` | Currency code for fiat formatting |
| `tokens` | `TokenInfo[]` | `[]` | Expandable token list |
| `walletAddress` | `Address` | — | For the copy-address action |
| `isLoading` | `boolean` | `false` | Shows `BalanceCardSkeleton` |
| `error` | `string \| Error` | — | Shows `ErrorState` with retry button |
| `onRetry` | `() => void` | — | Retry callback for error state |
| `defaultExpanded` | `boolean` | `false` | Initial expanded state for token list |
| `isExpanded` | `boolean` | — | Controlled expanded state |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Expansion change handler |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `locale` | `string` | `'en-US'` | Number formatting locale |

**Important**: `totalBalance` is always a `Lamports` bigint. The component converts it internally. When `isFiatBalance` is `false` (default), the balance displays as a plain number with the optional `tokenSymbol` appended. Set `isFiatBalance={true}` only if you've already converted to fiat.

**Sub-components**: `BalanceAmount`, `BalanceCardSkeleton`, `ErrorState`, `TokenList`.

**Exported utilities**: `formatBalance`, `formatFiatValue`, `copyToClipboard`, `stringToColor`, `formatPercentageChange`, `truncateAddress`.

---

### SwapInput

Two-card swap widget with a pay input, receive input, and swap-direction button. Handles insufficient balance validation automatically.

```tsx
const [payAmount, setPayAmount] = useState('');
const [receiveAmount, setReceiveAmount] = useState('');
const [payToken, setPayToken] = useState(SOL_TOKEN);
const [receiveToken, setReceiveToken] = useState(USDC_TOKEN);

<SwapInput
  payAmount={payAmount}
  onPayAmountChange={setPayAmount}
  receiveAmount={receiveAmount}
  payToken={payToken}
  payTokens={SWAP_TOKEN_LIST}
  onPayTokenChange={setPayToken}
  receiveToken={receiveToken}
  receiveTokens={SWAP_TOKEN_LIST}
  onReceiveTokenChange={setReceiveToken}
  onSwapDirection={handleSwapDirection}
  payBalance="4.32"
  receiveReadOnly
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `payAmount` | `string` | **required** | Controlled pay amount |
| `onPayAmountChange` | `(value: string) => void` | — | Pay amount change handler |
| `receiveAmount` | `string` | **required** | Controlled receive amount |
| `onReceiveAmountChange` | `(value: string) => void` | — | Receive amount change handler |
| `payToken` | `SwapTokenInfo` | — | Selected pay token |
| `payTokens` | `SwapTokenInfo[]` | — | Available pay tokens (enables dropdown) |
| `onPayTokenChange` | `(token: SwapTokenInfo) => void` | — | Pay token change handler |
| `receiveToken` | `SwapTokenInfo` | — | Selected receive token |
| `receiveTokens` | `SwapTokenInfo[]` | — | Available receive tokens |
| `onReceiveTokenChange` | `(token: SwapTokenInfo) => void` | — | Receive token change handler |
| `onSwapDirection` | `() => void` | — | Swap direction button handler |
| `payBalance` | `string` | — | User's balance for pay token (display string) |
| `receiveReadOnly` | `boolean` | `true` | Lock the receive input (computed externally) |
| `isLoading` | `boolean` | `false` | Shows `SwapInputSkeleton` |
| `isSwapping` | `boolean` | `false` | Disables swap button during execution |
| `disabled` | `boolean` | `false` | Disables all interactions |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |

#### Expected integration: Jupiter API

The `SwapInput` component is display-only — it renders amounts and tokens but does **not** fetch prices or execute swaps. For a fully functional swap UI, you need to wire it to a price quoting and swap execution service. The expected integration is the **Jupiter API** (or similar exchange aggregator).

**What the component expects from your integration layer:**

1. **Price quotes** — When the user types a `payAmount` or changes tokens, your app should call the Jupiter Quote API to get the `receiveAmount`. Set this on the `receiveAmount` prop (the receive side is `readOnly` by default for this reason).

2. **Token list** — Pass the available tokens as `SwapTokenInfo[]` to `payTokens` and `receiveTokens`. You can source these from Jupiter's token list API or your own registry. Each token needs at minimum: `symbol`, and optionally `name`, `logoURI`, `mintAddress`, `decimals`.

3. **Swap execution** — When the user confirms, your app calls the Jupiter Swap API, signs the transaction, and sends it. Use `isSwapping={true}` while the transaction is in flight to disable interactions. Pair with `TransactionToast` to show progress.

4. **Balance** — Pass the user's balance for the selected pay token as a display string to `payBalance`. The component auto-validates and shows "Insufficient balance" when `payAmount > payBalance`.

**Example integration pattern:**

```tsx
// Your hook or effect that calls Jupiter
useEffect(() => {
  if (!payAmount || !payToken || !receiveToken) return;
  const quote = await jupiterApi.getQuote({
    inputMint: payToken.mintAddress,
    outputMint: receiveToken.mintAddress,
    amount: parseFloat(payAmount) * 10 ** payToken.decimals,
  });
  setReceiveAmount(String(quote.outAmount / 10 ** receiveToken.decimals));
}, [payAmount, payToken, receiveToken]);
```

**Sub-components**: `TokenInput` (can be used standalone for send/stake flows), `SwapInputSkeleton`.

**Exported utilities**: `sanitizeAmountInput`, `isInsufficientBalance`.

---

### TransactionTable

Filterable table of classified transactions with date and type filters.

```tsx
<TransactionTable
  transactions={transactions}
  walletAddress={walletAddress}
  isLoading={isLoading}
  onViewTransaction={(tx) => window.open(`https://explorer.solana.com/tx/${tx.tx.signature}`)}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `transactions` | `ReadonlyArray<ClassifiedTransaction>` | **required** | From `tx-indexer` |
| `walletAddress` | `Address` | — | For sent/received classification |
| `isLoading` | `boolean` | `false` | Shows `TransactionTableSkeleton` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `dateFilter` | `'all' \| '7d' \| '30d' \| '90d'` | — | Controlled date filter |
| `onDateFilterChange` | `(value) => void` | — | Date filter handler |
| `typeFilter` | `'all' \| 'sent' \| 'received'` | — | Controlled type filter |
| `onTypeFilterChange` | `(value) => void` | — | Type filter handler |
| `emptyMessage` | `string` | `'No transactions yet'` | Empty state text |
| `onViewTransaction` | `(tx) => void` | — | Adds a view action per row |
| `renderRowAction` | `(tx) => ReactNode` | — | Custom row action (overrides view icon) |
| `locale` | `string` | `'en-US'` | Date/number formatting locale |

**Transaction data**: This component expects `ClassifiedTransaction` objects from the `tx-indexer` package. Each transaction includes a `classification` with `primaryType`, `primaryAmount` (token + amount), `sender`, `receiver`, and `counterparty` fields. The component derives direction (sent/received/other) from the transaction legs and wallet address.

**Sub-components**: `TransactionRow`, `TransactionTableSkeleton`, `FilterDropdown`.

**Exported utilities**: `getTransactionDirection`, `getCounterpartyAddress`, `getPrimaryAmount`, `formatTxDate`, `formatTokenAmount`, `formatFiatAmount`.

---

### TransactionToast

Toast notifications for transaction lifecycle (pending, success, error). Built on Radix Toast.

```tsx
// 1. Wrap your app with the provider
<TransactionToastProvider>
  <App />
</TransactionToastProvider>

// 2. Use the hook anywhere inside
const { toast, update, dismiss } = useTransactionToast();

// 3. Fire-and-update pattern
const id = toast({
  signature: txSignature,
  status: 'pending',
  type: 'sent',
  network: 'mainnet-beta',
});

// Later, when confirmed:
update(id, { status: 'success' });
```

| Toast data | Type | Default | Description |
|---|---|---|---|
| `signature` | `string` | **required** | Solana transaction signature |
| `status` | `'pending' \| 'success' \| 'error'` | **required** | Transaction state |
| `type` | `'sent' \| 'received' \| 'swapped'` | `'sent'` | Determines message text |
| `network` | `ClusterMoniker` | `'mainnet-beta'` | For explorer link |

Auto-dismiss: `pending` = never, `success` = 5s, `error` = never. Each toast includes a link to the Solana explorer.

**Static rendering**: `TransactionToast` can be rendered directly (without the provider) for static previews.

---

### WalletModal

Multi-view modal for wallet selection, connection progress, and error recovery. Fully controlled — the caller owns all state.

```tsx
const [view, setView] = useState<'list' | 'connecting' | 'error'>('list');
const [connectingWallet, setConnectingWallet] = useState(null);
const [error, setError] = useState(null);

const handleSelect = async (wallet) => {
  setConnectingWallet(wallet);
  setView('connecting');
  try {
    await connect(wallet.id);
    closeModal();
  } catch (err) {
    setView('error');
    setError({ title: 'Connection failed', message: err.message });
  }
};

{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <WalletModal
      wallets={walletList}
      view={view}
      connectingWallet={connectingWallet}
      error={error}
      onSelectWallet={handleSelect}
      onBack={() => setView('list')}
      onClose={closeModal}
      onRetry={() => connectingWallet && handleSelect(connectingWallet)}
    />
  </div>
)}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `wallets` | `WalletConnectorMetadata[]` | **required** | Available wallets |
| `view` | `'list' \| 'connecting' \| 'error'` | `'list'` | Current modal view |
| `connectingWallet` | `WalletConnectorMetadata` | — | Wallet being connected (for connecting view) |
| `error` | `{ title?: string; message?: string }` | — | Error info (for error view) |
| `onSelectWallet` | `(wallet) => void` | — | Wallet selection handler |
| `onBack` | `() => void` | — | Back button handler |
| `onClose` | `() => void` | — | Close button handler |
| `onRetry` | `() => void` | — | Retry button handler |
| `showNoWalletLink` | `boolean` | `true` | Show "I don't have a wallet" link |
| `walletGuideUrl` | `string` | Solana ecosystem wallets page | URL for the "no wallet" link |

**Important**: This component does **not** render its own overlay or portal. You must provide the backdrop and positioning (as shown above). This gives you full control over animation, z-index, and dismissal behavior.

**Sub-components**: `ConnectingView`, `ErrorView`, `ModalHeader`, `WalletList`, `WalletCard`, `WalletLabel`, `NoWalletLink`.

---

### AddressDisplay

Truncated wallet address with copy-to-clipboard and Solana Explorer link.

```tsx
<AddressDisplay
  address={walletAddress}
  network="mainnet-beta"
  onCopy={() => console.log('Copied!')}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `address` | `Address` | **required** | Solana address (base58) |
| `onCopy` | `() => void` | — | Called after successful clipboard copy |
| `showExplorerLink` | `boolean` | `true` | Show external link to Solana Explorer |
| `showTooltip` | `boolean` | `true` | Hover tooltip with full address |
| `network` | `ClusterMoniker` | `'mainnet-beta'` | Explorer URL cluster param |

---

### Skeleton

Low-level building block for loading states. All other skeleton components compose this.

```tsx
<Skeleton className="h-4 w-32" />        {/* Text line */}
<Skeleton className="h-12 w-12 rounded-full" />  {/* Avatar */}
<Skeleton className="h-32 rounded-xl" />  {/* Card */}
```

Renders a `<div>` with `animate-pulse rounded-md bg-muted`. Pass any `className` to control size and shape.

---

## Customization

Components support three levels of customization, from lightest touch to full control.

### CSS token overrides

Override CSS custom properties on any ancestor element to re-theme an entire subtree. See the [Theming](#theming) section above for the full token table.

```css
.my-brand {
  --primary: oklch(0.65 0.25 160);
  --card: oklch(0.18 0.02 160);
}
```

```tsx
<div className="my-brand">
  <BalanceCard totalBalance={balance} tokenSymbol="SOL" />
</div>
```

### className overrides

Every component accepts a `className` prop. Classes are merged with [tailwind-merge](https://github.com/dcastil/tailwind-merge), so your overrides always win over defaults — no `!important` needed.

```tsx
{/* Sharp corners */}
<BalanceCard className="rounded-none" totalBalance={balance} tokenSymbol="SOL" />

{/* Extra rounded with shadow */}
<BalanceCard className="rounded-3xl shadow-xl border-0" totalBalance={balance} tokenSymbol="SOL" />

{/* Pill-shaped wallet button */}
<WalletButton className="rounded-full" connectionState="disconnected">
  Connect
</WalletButton>

{/* Custom skeleton color */}
<Skeleton className="bg-primary/20 h-4 w-32" />
```

### Sub-component composition

Each composite component exports its building blocks so you can assemble custom layouts without the parent wrapper.

#### BalanceCard exports

| Export | Description |
|---|---|
| `BalanceCard` | Full card with header, balance, token list |
| `BalanceAmount` | Formatted balance display (bigint → human-readable) |
| `TokenList` | Expandable token list with icons and fiat values |
| `BalanceCardSkeleton` | Loading skeleton |
| `ErrorState` | Error with retry button |

#### ConnectWalletButton exports

| Export | Description |
|---|---|
| `ConnectWalletButton` | Full button with dropdown |
| `WalletButton` | Styled button (no dropdown logic) |
| `ButtonIcon` | Wallet icon renderer |
| `ButtonContent` | Label text wrapper |
| `ButtonSpinner` | Loading spinner |
| `WalletDropdown` | Connected-state dropdown |

#### NetworkSwitcher exports

| Export | Description |
|---|---|
| `NetworkSwitcher` | Full dropdown switcher |
| `NetworkTrigger` | Trigger button with status dot |
| `StatusIndicator` | Connection status dot (green/spinner/red) |
| `NetworkDropdown` | Dropdown panel |
| `NetworkOption` | Single network row |

#### SwapInput exports

| Export | Description |
|---|---|
| `SwapInput` | Two-card swap widget |
| `TokenInput` | Single token input card (usable standalone for send/stake flows) |
| `SwapInputSkeleton` | Loading skeleton |

#### Composition example

Build a custom portfolio card using sub-components directly:

```tsx
import { BalanceAmount, TokenList } from './kit-components/ui/balance-card';
import { WalletButton, ButtonIcon } from './kit-components/ui/connect-wallet-button';
import { NetworkTrigger, StatusIndicator } from './kit-components/ui/network-switcher';
import { TokenInput } from './kit-components/ui/swap-input';

{/* Custom portfolio card */}
<div className="rounded-xl border border-border bg-card p-6">
  <BalanceAmount balance={4_500_000_000n} tokenSymbol="SOL" size="lg" />
  <TokenList tokens={tokens} defaultExpanded />
</div>

{/* Standalone wallet trigger */}
<WalletButton connectionState="disconnected">
  Launch Wallet
</WalletButton>

{/* Standalone send input */}
<TokenInput label="Send" amount="" token={solToken} balance="4.5" />
```

---

## Solana types reference

These types come from the Solana packages and appear throughout the component APIs:

| Type | Package | Description |
|---|---|---|
| `Address` | `@solana/kit` | Base58-encoded Solana address (branded string) |
| `Lamports` | `@solana/kit` | SOL balance in lamports (branded bigint, 1 SOL = 1e9) |
| `ClusterMoniker` | `@solana/client` | `'mainnet-beta' \| 'testnet' \| 'devnet' \| 'localnet'` |
| `WalletConnectorMetadata` | `@solana/client` | `{ id, name, icon?, ready }` — wallet adapter info |
| `WalletStatus` | `@solana/client` | `{ status: 'connected' \| 'connecting' \| 'error' }` |
| `ClassifiedTransaction` | `tx-indexer` | Parsed and classified transaction with legs, amounts, and counterparty |

---

## Development

```bash
pnpm dev              # Vite dev server
pnpm storybook        # Storybook on :6006
pnpm build            # TypeScript check + Vite build
pnpm lint             # Biome linter
pnpm format           # Biome formatter
```

Tests run with Vitest:

```bash
npx vitest run        # All tests
npx vitest run --reporter=verbose  # Verbose output
```

Visual integration tests live in `tests/e2e-visual/` and exercise all components in a real DashboardShell layout with mock and live chain data.
