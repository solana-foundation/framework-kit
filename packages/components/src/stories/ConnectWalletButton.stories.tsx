import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';
import { ConnectWalletButton, WalletButton, WalletDropdown } from '../kit-components/ui/connect-wallet-button';
import backpackIcon from '../kit-components/ui/connect-wallet-button/assets/backpack.png';
import solflareIcon from '../kit-components/ui/connect-wallet-button/assets/solflare.png';
import type { WalletConnector } from '../kit-components/ui/connect-wallet-button/types';

/**
 * ConnectWalletButton - A composable Solana wallet connection component.
 *
 * This component handles all wallet connection states:
 * - **Disconnected**: Shows "Connect Wallet" button
 * - **Connecting**: Shows loading spinner
 * - **Connected**: Shows wallet icon with dropdown for address, balance, and disconnect
 *
 * ## Interactive Stories
 * The first stories are **fully interactive** - click through the entire flow!
 */
const meta = {
	title: 'Components/ConnectWalletButton',
	component: ConnectWalletButton,
	parameters: {
		layout: 'centered',
		backgrounds: {
			default: 'dark',
			values: [
				{ name: 'dark', value: '#1a1a1a' },
				{ name: 'light', value: '#f5f5f5' },
			],
		},
	},
	tags: ['autodocs'],
	argTypes: {
		theme: {
			control: 'radio',
			options: ['dark', 'light'],
			description: 'Color theme',
		},
		animate: {
			control: 'boolean',
			description: 'Enable Framer Motion animations',
		},
		status: {
			control: 'radio',
			options: ['disconnected', 'connecting', 'connected', 'error'],
			description: 'Current connection status',
		},
	},
} satisfies Meta<typeof ConnectWalletButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// MOCK DATA - Using actual wallet icons
// ============================================

const mockBackpackWallet: WalletConnector = {
	id: 'backpack',
	name: 'Backpack',
	icon: backpackIcon,
};

const mockSolflareWallet: WalletConnector = {
	id: 'solflare',
	name: 'Solflare',
	icon: solflareIcon,
};

const mockPhantomWallet: WalletConnector = {
	id: 'phantom',
	name: 'Phantom',
	icon: backpackIcon, // Using backpack icon as placeholder
};

const mockAddress = '6DMh7gJwvuTq3Bpf8rPVGPjzqnz1DkK3H1mVh9kP1DkK';
const mockBalance = 1120000000n; // 1.12 SOL

// ============================================
// INTERACTIVE STORIES - Full user flows
// ============================================

/**
 * **Interactive Demo (Dark)** - Full wallet connection flow
 *
 * Click through the entire flow:
 * 1. Click "Connect Wallet" -> shows loading spinner
 * 2. After 1.5s -> connected state
 * 3. Click wallet icon -> open dropdown
 * 4. Click "Disconnect" -> reset
 */
export const Interactive: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'disconnected',
	},
	render: function InteractiveRender(args) {
		type WalletType = 'backpack' | 'solflare' | 'phantom';
		type Status = 'disconnected' | 'connecting' | 'connected';

		const [status, setStatus] = useState<Status>('disconnected');
		const [selectedWallet, setSelectedWallet] = useState<WalletType>('backpack');

		const wallets: Record<WalletType, WalletConnector> = {
			backpack: mockBackpackWallet,
			solflare: mockSolflareWallet,
			phantom: mockPhantomWallet,
		};

		const handleConnect = useCallback(() => {
			setStatus('connecting');
			setTimeout(() => setStatus('connected'), 1500);
		}, []);

		const handleDisconnect = useCallback(async () => {
			setStatus('disconnected');
		}, []);

		return (
			<div className="flex flex-col items-center gap-6">
				<div className="flex gap-2 text-sm">
					<span className="text-zinc-500">Simulate wallet:</span>
					{(['backpack', 'solflare', 'phantom'] as const).map((w) => (
						<button
							key={w}
							type="button"
							onClick={() => setSelectedWallet(w)}
							className={`px-2 py-1 rounded transition-colors ${
								selectedWallet === w ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-300'
							}`}
						>
							{w.charAt(0).toUpperCase() + w.slice(1)}
						</button>
					))}
				</div>

				<ConnectWalletButton
					theme={args.theme}
					animate={args.animate}
					status={status}
					isReady={true}
					wallet={status === 'connected' ? { address: mockAddress } : undefined}
					currentConnector={status === 'connected' ? wallets[selectedWallet] : undefined}
					balance={mockBalance}
					balanceLoading={false}
					onConnect={handleConnect}
					onDisconnect={handleDisconnect}
				/>

				<div className="text-xs text-zinc-500">
					Status: <span className="text-zinc-300 font-mono">{status}</span>
				</div>
			</div>
		);
	},
};

/**
 * **Interactive Demo (Light)** - Same flow with light theme
 */
export const InteractiveLight: Story = {
	args: {
		theme: 'light',
		animate: true,
		status: 'disconnected',
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
	render: function InteractiveLightRender(args) {
		type Status = 'disconnected' | 'connecting' | 'connected';
		const [status, setStatus] = useState<Status>('disconnected');

		const handleConnect = useCallback(() => {
			setStatus('connecting');
			setTimeout(() => setStatus('connected'), 1500);
		}, []);

		const handleDisconnect = useCallback(async () => {
			setStatus('disconnected');
		}, []);

		return (
			<div className="flex flex-col items-center gap-6">
				<ConnectWalletButton
					theme="light"
					animate={args.animate}
					status={status}
					isReady={true}
					wallet={status === 'connected' ? { address: mockAddress } : undefined}
					currentConnector={status === 'connected' ? mockSolflareWallet : undefined}
					balance={2500000000n}
					onConnect={handleConnect}
					onDisconnect={handleDisconnect}
				/>
				<div className="text-xs text-zinc-600">
					Status: <span className="text-zinc-800 font-mono">{status}</span>
				</div>
			</div>
		);
	},
};

/**
 * **Interactive with Balance Loading** - Shows balance loading after connection
 */
export const InteractiveBalanceLoading: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'disconnected',
	},
	render: function BalanceLoadingRender(args) {
		type Status = 'disconnected' | 'connecting' | 'connected';
		const [status, setStatus] = useState<Status>('disconnected');
		const [balanceLoading, setBalanceLoading] = useState(true);
		const [balance, setBalance] = useState<bigint | null>(null);

		const handleConnect = useCallback(() => {
			setStatus('connecting');
			setBalanceLoading(true);
			setBalance(null);
			setTimeout(() => {
				setStatus('connected');
				setTimeout(() => {
					setBalance(3750000000n);
					setBalanceLoading(false);
				}, 2000);
			}, 1500);
		}, []);

		const handleDisconnect = useCallback(async () => {
			setStatus('disconnected');
			setBalance(null);
			setBalanceLoading(true);
		}, []);

		return (
			<div className="flex flex-col items-center gap-4">
				<ConnectWalletButton
					theme={args.theme}
					animate={args.animate}
					status={status}
					isReady={true}
					wallet={status === 'connected' ? { address: mockAddress } : undefined}
					currentConnector={status === 'connected' ? mockBackpackWallet : undefined}
					balance={balance ?? undefined}
					balanceLoading={balanceLoading}
					onConnect={handleConnect}
					onDisconnect={handleDisconnect}
				/>
				<p className="text-xs text-zinc-500">
					{status === 'disconnected' && 'Click to connect'}
					{status === 'connecting' && 'Connecting...'}
					{status === 'connected' && balanceLoading && '⏳ Balance loading...'}
					{status === 'connected' && !balanceLoading && balance && '✅ Balance loaded!'}
				</p>
			</div>
		);
	},
};

/**
 * **Both Themes Side-by-Side** - Compare dark and light interactive flows
 */
export const BothThemesInteractive: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'disconnected',
	},
	parameters: {
		backgrounds: { default: 'dark' },
	},
	render: function BothThemesRender(args) {
		type Status = 'disconnected' | 'connecting' | 'connected';
		const [darkStatus, setDarkStatus] = useState<Status>('disconnected');
		const [lightStatus, setLightStatus] = useState<Status>('disconnected');

		const handleDarkConnect = useCallback(() => {
			setDarkStatus('connecting');
			setTimeout(() => setDarkStatus('connected'), 1500);
		}, []);

		const handleLightConnect = useCallback(() => {
			setLightStatus('connecting');
			setTimeout(() => setLightStatus('connected'), 1500);
		}, []);

		return (
			<div className="flex gap-8 items-start">
				<div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-900">
					<span className="text-xs text-zinc-500 uppercase tracking-wider">Dark Theme</span>
					<ConnectWalletButton
						theme="dark"
						animate={args.animate}
						status={darkStatus}
						isReady={true}
						wallet={darkStatus === 'connected' ? { address: mockAddress } : undefined}
						currentConnector={darkStatus === 'connected' ? mockBackpackWallet : undefined}
						balance={mockBalance}
						onConnect={handleDarkConnect}
						onDisconnect={async () => setDarkStatus('disconnected')}
					/>
				</div>
				<div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-100">
					<span className="text-xs text-zinc-500 uppercase tracking-wider">Light Theme</span>
					<ConnectWalletButton
						theme="light"
						animate={args.animate}
						status={lightStatus}
						isReady={true}
						wallet={lightStatus === 'connected' ? { address: mockAddress } : undefined}
						currentConnector={lightStatus === 'connected' ? mockSolflareWallet : undefined}
						balance={mockBalance}
						onConnect={handleLightConnect}
						onDisconnect={async () => setLightStatus('disconnected')}
					/>
				</div>
			</div>
		);
	},
};

// ============================================
// STATIC STATES - Individual states for docs
// ============================================

/**
 * **Disconnected** - Default state when no wallet is connected
 */
export const Disconnected: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'disconnected',
		isReady: true,
		onConnect: () => console.log('Connect clicked'),
	},
};

/**
 * **Disconnected (Light)** - Light theme disconnected state
 */
export const DisconnectedLight: Story = {
	args: {
		theme: 'light',
		animate: true,
		status: 'disconnected',
		isReady: true,
		onConnect: () => console.log('Connect clicked'),
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
};

/**
 * **Connecting** - Loading state while connecting to wallet
 */
export const Connecting: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'connecting',
		isReady: true,
	},
};

/**
 * **Connecting (Light)** - Light theme loading state
 */
export const ConnectingLight: Story = {
	args: {
		theme: 'light',
		animate: true,
		status: 'connecting',
		isReady: true,
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
};

/**
 * **Connected** - Shows wallet icon, click to see dropdown
 */
export const Connected: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'connected',
		isReady: true,
		wallet: { address: mockAddress },
		currentConnector: mockBackpackWallet,
		balance: mockBalance,
		onDisconnect: async () => console.log('Disconnect clicked'),
	},
};

/**
 * **Connected (Light)** - Light theme connected state
 */
export const ConnectedLight: Story = {
	args: {
		theme: 'light',
		animate: true,
		status: 'connected',
		isReady: true,
		wallet: { address: mockAddress },
		currentConnector: mockSolflareWallet,
		balance: 2340000000n,
		onDisconnect: async () => console.log('Disconnect clicked'),
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
};

// ============================================
// DROPDOWN STANDALONE - For testing dropdown directly
// ============================================

/**
 * **Dropdown Only (Dark)** - Test dropdown component in isolation
 */
export const DropdownStandaloneDark: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'connected',
	},
	render: (args) => (
		<div className="relative pt-12">
			<WalletDropdown
				theme={args.theme}
				animate={args.animate}
				wallet={mockBackpackWallet}
				address={mockAddress}
				balance={mockBalance}
				balanceLoading={false}
				onDisconnect={async () => console.log('Disconnect')}
			/>
		</div>
	),
};

/**
 * **Dropdown Only (Light)** - Light theme dropdown
 */
export const DropdownStandaloneLight: Story = {
	args: {
		theme: 'light',
		animate: true,
		status: 'connected',
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
	render: (args) => (
		<div className="relative pt-12">
			<WalletDropdown
				theme="light"
				animate={args.animate}
				wallet={mockSolflareWallet}
				address={mockAddress}
				balance={2340000000n}
				balanceLoading={false}
				onDisconnect={async () => console.log('Disconnect')}
			/>
		</div>
	),
};

/**
 * **Dropdown with Balance Loading** - Skeleton animation
 */
export const DropdownBalanceLoading: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'connected',
	},
	render: (args) => (
		<div className="relative pt-12">
			<WalletDropdown
				theme={args.theme}
				animate={args.animate}
				wallet={mockBackpackWallet}
				address={mockAddress}
				balance={undefined}
				balanceLoading={true}
				onDisconnect={async () => console.log('Disconnect')}
			/>
		</div>
	),
};

// ============================================
// BUTTON VARIANTS - WalletButton states
// ============================================

/**
 * **Button Variants (Dark)** - All button states side-by-side
 */
export const ButtonVariantsDark: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'disconnected',
	},
	render: (args) => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<span className="text-zinc-500 text-sm w-24">Disconnected</span>
				<WalletButton
					connectionState="disconnected"
					theme="dark"
					variant="filled"
					animate={args.animate}
					onClick={() => console.log('Connect')}
				>
					Connect Wallet
				</WalletButton>
			</div>
			<div className="flex items-center gap-4">
				<span className="text-zinc-500 text-sm w-24">Connecting</span>
				<WalletButton
					connectionState="connecting"
					theme="dark"
					variant="loading"
					animate={args.animate}
					disabled
				/>
			</div>
			<div className="flex items-center gap-4">
				<span className="text-zinc-500 text-sm w-24">Connected</span>
				<WalletButton
					connectionState="connected"
					wallet={mockBackpackWallet}
					theme="dark"
					variant="connected"
					animate={args.animate}
					onClick={() => console.log('Toggle dropdown')}
				/>
			</div>
		</div>
	),
};

/**
 * **Button Variants (Light)** - Light theme button states
 */
export const ButtonVariantsLight: Story = {
	args: {
		theme: 'light',
		animate: true,
		status: 'disconnected',
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
	render: (args) => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<span className="text-zinc-600 text-sm w-24">Disconnected</span>
				<WalletButton
					connectionState="disconnected"
					theme="light"
					variant="outline"
					animate={args.animate}
					onClick={() => console.log('Connect')}
				>
					Connect Wallet
				</WalletButton>
			</div>
			<div className="flex items-center gap-4">
				<span className="text-zinc-600 text-sm w-24">Connecting</span>
				<WalletButton
					connectionState="connecting"
					theme="light"
					variant="loadingLight"
					animate={args.animate}
					disabled
				/>
			</div>
			<div className="flex items-center gap-4">
				<span className="text-zinc-600 text-sm w-24">Connected</span>
				<WalletButton
					connectionState="connected"
					wallet={mockSolflareWallet}
					theme="light"
					variant="connected"
					animate={args.animate}
					onClick={() => console.log('Toggle dropdown')}
				/>
			</div>
		</div>
	),
};

// ============================================
// ALL STATES GRID - Complete overview
// ============================================

/**
 * **All States Grid** - Every state at a glance
 */
export const AllStatesGrid: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'disconnected',
	},
	render: (args) => (
		<div className="grid grid-cols-2 gap-8">
			<div className="flex flex-col gap-4 p-6 rounded-xl bg-zinc-900">
				<h3 className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">Dark Theme</h3>
				<div className="flex flex-col gap-3">
					<WalletButton connectionState="disconnected" theme="dark" variant="filled" animate={args.animate}>
						Connect Wallet
					</WalletButton>
					<WalletButton
						connectionState="connecting"
						theme="dark"
						variant="loading"
						animate={args.animate}
						disabled
					/>
					<WalletButton
						connectionState="connected"
						wallet={mockBackpackWallet}
						theme="dark"
						variant="connected"
						animate={args.animate}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-4 p-6 rounded-xl bg-zinc-100">
				<h3 className="text-zinc-600 font-semibold text-sm uppercase tracking-wider">Light Theme</h3>
				<div className="flex flex-col gap-3">
					<WalletButton connectionState="disconnected" theme="light" variant="outline" animate={args.animate}>
						Connect Wallet
					</WalletButton>
					<WalletButton
						connectionState="connecting"
						theme="light"
						variant="loadingLight"
						animate={args.animate}
						disabled
					/>
					<WalletButton
						connectionState="connected"
						wallet={mockSolflareWallet}
						theme="light"
						variant="connected"
						animate={args.animate}
					/>
				</div>
			</div>
		</div>
	),
};

// ============================================
// EDGE CASES
// ============================================

/**
 * **Zero Balance** - When wallet has 0 SOL
 */
export const ZeroBalance: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'connected',
	},
	render: (args) => (
		<div className="relative pt-12">
			<WalletDropdown
				theme={args.theme}
				animate={args.animate}
				wallet={mockBackpackWallet}
				address={mockAddress}
				balance={0n}
				balanceLoading={false}
				onDisconnect={async () => console.log('Disconnect')}
			/>
		</div>
	),
};

/**
 * **Large Balance** - Whale wallet
 */
export const LargeBalance: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'connected',
	},
	render: (args) => (
		<div className="relative pt-12">
			<WalletDropdown
				theme={args.theme}
				animate={args.animate}
				wallet={mockBackpackWallet}
				address={mockAddress}
				balance={123456789012345678n}
				balanceLoading={false}
				onDisconnect={async () => console.log('Disconnect')}
			/>
		</div>
	),
};

/**
 * **Not Ready State** - SDK still initializing
 */
export const NotReady: Story = {
	args: {
		theme: 'dark',
		animate: true,
		status: 'disconnected',
		isReady: false,
	},
	render: (args) => (
		<div className="flex flex-col items-center gap-2">
			<WalletButton
				connectionState="connecting"
				theme={args.theme}
				variant="loading"
				animate={args.animate}
				disabled
			/>
			<span className="text-xs text-zinc-500">isReady: false (SDK initializing...)</span>
		</div>
	),
};

/**
 * **Animations Disabled** - For reduced motion preference
 */
export const AnimationsDisabled: Story = {
	args: {
		theme: 'dark',
		animate: false,
		status: 'disconnected',
	},
	render: function AnimationsDisabledRender(args) {
		type Status = 'disconnected' | 'connecting' | 'connected';
		const [status, setStatus] = useState<Status>('disconnected');

		const handleConnect = useCallback(() => {
			setStatus('connecting');
			setTimeout(() => setStatus('connected'), 500);
		}, []);

		return (
			<div className="flex flex-col items-center gap-4">
				<ConnectWalletButton
					theme={args.theme}
					animate={false}
					status={status}
					isReady={true}
					wallet={status === 'connected' ? { address: mockAddress } : undefined}
					currentConnector={status === 'connected' ? mockBackpackWallet : undefined}
					balance={mockBalance}
					onConnect={handleConnect}
					onDisconnect={async () => setStatus('disconnected')}
				/>
				<span className="text-xs text-zinc-500">animate: false (respects prefers-reduced-motion)</span>
			</div>
		);
	},
};
