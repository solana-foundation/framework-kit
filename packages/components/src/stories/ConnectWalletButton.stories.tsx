import type { ClusterMoniker, WalletConnectorMetadata } from '@solana/client';
import { lamports } from '@solana/client';
import type { Lamports } from '@solana/kit';
import { address } from '@solana/kit';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';
import { ConnectWalletButton, WalletButton, WalletDropdown } from '../kit-components/ui/connect-wallet-button';
import backpackIcon from '../kit-components/ui/connect-wallet-button/assets/backpack.png';
import solflareIcon from '../kit-components/ui/connect-wallet-button/assets/solflare.png';

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

const mockBackpackWallet: WalletConnectorMetadata = {
	id: 'backpack',
	name: 'Backpack',
	icon: backpackIcon,
};

const mockSolflareWallet: WalletConnectorMetadata = {
	id: 'solflare',
	name: 'Solflare',
	icon: solflareIcon,
};

const mockPhantomWallet: WalletConnectorMetadata = {
	id: 'phantom',
	name: 'Phantom',
	icon: backpackIcon, // Using backpack icon as placeholder
};

const mockAddress = address('6DMh7gJwvuTq3Bpf8rPVGPjzqnz1DkK3H1mVh9kP1DkK');
const mockBalance = lamports(1120000000n); // 1.12 SOL

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
		status: 'disconnected',
	},
	render: function InteractiveRender(_args) {
		type WalletType = 'backpack' | 'solflare' | 'phantom';
		type Status = 'disconnected' | 'connecting' | 'connected';

		const [status, setStatus] = useState<Status>('disconnected');
		const [selectedWallet, setSelectedWallet] = useState<WalletType>('backpack');
		const [selectedNetwork, setSelectedNetwork] = useState<ClusterMoniker>('devnet');

		const wallets: Record<WalletType, WalletConnectorMetadata> = {
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

		const handleNetworkChange = useCallback((network: ClusterMoniker) => {
			setSelectedNetwork(network);
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
					status={status}
					isReady={true}
					wallet={status === 'connected' ? { address: mockAddress } : undefined}
					currentConnector={status === 'connected' ? wallets[selectedWallet] : undefined}
					balance={mockBalance}
					balanceLoading={false}
					onConnect={handleConnect}
					onDisconnect={handleDisconnect}
					selectedNetwork={selectedNetwork}
					networkStatus="connected"
					onNetworkChange={handleNetworkChange}
				/>

				<div className="text-xs text-zinc-500">
					Status: <span className="text-zinc-300 font-mono">{status}</span>
					{status === 'connected' && (
						<>
							{' '}
							| Network: <span className="text-zinc-300 font-mono">{selectedNetwork}</span>
						</>
					)}
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
		status: 'disconnected',
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
	render: function InteractiveLightRender(_args) {
		type Status = 'disconnected' | 'connecting' | 'connected';
		const [status, setStatus] = useState<Status>('disconnected');
		const [selectedNetwork, setSelectedNetwork] = useState<ClusterMoniker>('mainnet-beta');

		const handleConnect = useCallback(() => {
			setStatus('connecting');
			setTimeout(() => setStatus('connected'), 1500);
		}, []);

		const handleDisconnect = useCallback(async () => {
			setStatus('disconnected');
		}, []);

		const handleNetworkChange = useCallback((network: ClusterMoniker) => {
			setSelectedNetwork(network);
		}, []);

		return (
			<div className="flex flex-col items-center gap-6">
				<ConnectWalletButton
					status={status}
					isReady={true}
					wallet={status === 'connected' ? { address: mockAddress } : undefined}
					currentConnector={status === 'connected' ? mockSolflareWallet : undefined}
					balance={lamports(2500000000n)}
					onConnect={handleConnect}
					onDisconnect={handleDisconnect}
					selectedNetwork={selectedNetwork}
					networkStatus="connected"
					onNetworkChange={handleNetworkChange}
				/>
				<div className="text-xs text-zinc-600">
					Status: <span className="text-zinc-800 font-mono">{status}</span>
					{status === 'connected' && (
						<>
							{' '}
							| Network: <span className="text-zinc-800 font-mono">{selectedNetwork}</span>
						</>
					)}
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
		status: 'disconnected',
	},
	render: function BalanceLoadingRender(_args) {
		type Status = 'disconnected' | 'connecting' | 'connected';
		const [status, setStatus] = useState<Status>('disconnected');
		const [balanceLoading, setBalanceLoading] = useState(true);
		const [balance, setBalance] = useState<Lamports | null>(null);

		const handleConnect = useCallback(() => {
			setStatus('connecting');
			setBalanceLoading(true);
			setBalance(null);
			setTimeout(() => {
				setStatus('connected');
				setTimeout(() => {
					setBalance(lamports(3750000000n));
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
export const BothStatesInteractive: Story = {
	args: {
		status: 'disconnected',
	},
	render: function BothStatesRender(_args) {
		type Status = 'disconnected' | 'connecting' | 'connected';
		const [firstStatus, setFirstStatus] = useState<Status>('disconnected');
		const [secondStatus, setSecondStatus] = useState<Status>('disconnected');
		const [firstNetwork, setFirstNetwork] = useState<ClusterMoniker>('devnet');
		const [secondNetwork, setSecondNetwork] = useState<ClusterMoniker>('mainnet-beta');

		const handleFirstConnect = useCallback(() => {
			setFirstStatus('connecting');
			setTimeout(() => setFirstStatus('connected'), 1500);
		}, []);

		const handleSecondConnect = useCallback(() => {
			setSecondStatus('connecting');
			setTimeout(() => setSecondStatus('connected'), 1500);
		}, []);

		return (
			<div className="flex gap-8 items-start">
				<div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-900">
					<span className="text-xs text-zinc-500 uppercase tracking-wider">Backpack</span>
					<ConnectWalletButton
						status={firstStatus}
						isReady={true}
						wallet={firstStatus === 'connected' ? { address: mockAddress } : undefined}
						currentConnector={firstStatus === 'connected' ? mockBackpackWallet : undefined}
						balance={mockBalance}
						onConnect={handleFirstConnect}
						onDisconnect={async () => setFirstStatus('disconnected')}
						selectedNetwork={firstNetwork}
						networkStatus="connected"
						onNetworkChange={setFirstNetwork}
					/>
				</div>
				<div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-100">
					<span className="text-xs text-zinc-500 uppercase tracking-wider">Solflare</span>
					<ConnectWalletButton
						status={secondStatus}
						isReady={true}
						wallet={secondStatus === 'connected' ? { address: mockAddress } : undefined}
						currentConnector={secondStatus === 'connected' ? mockSolflareWallet : undefined}
						balance={mockBalance}
						onConnect={handleSecondConnect}
						onDisconnect={async () => setSecondStatus('disconnected')}
						selectedNetwork={secondNetwork}
						networkStatus="connected"
						onNetworkChange={setSecondNetwork}
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
		status: 'connecting',
		isReady: true,
	},
};

/**
 * **Connecting (Light)** - Light theme loading state
 */
export const ConnectingLight: Story = {
	args: {
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
		status: 'connected',
		isReady: true,
		wallet: { address: mockAddress },
		currentConnector: mockSolflareWallet,
		balance: lamports(2340000000n),
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
export const DropdownStandalone: Story = {
	args: {
		status: 'connected',
	},
	render: () => (
		<div className="relative pt-12">
			<WalletDropdown
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
 * **Dropdown with Balance Loading** - Skeleton animation
 */
export const DropdownBalanceLoading: Story = {
	args: {
		status: 'connected',
	},
	render: () => (
		<div className="relative pt-12">
			<WalletDropdown
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
export const ButtonVariants: Story = {
	args: {
		status: 'disconnected',
	},
	render: (_args) => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<span className="text-zinc-500 text-sm w-24">Disconnected</span>
				<WalletButton connectionState="disconnected" variant="filled" onClick={() => console.log('Connect')}>
					Connect Wallet
				</WalletButton>
			</div>
			<div className="flex items-center gap-4">
				<span className="text-zinc-500 text-sm w-24">Connecting</span>
				<WalletButton connectionState="connecting" variant="loading" disabled />
			</div>
			<div className="flex items-center gap-4">
				<span className="text-zinc-500 text-sm w-24">Connected</span>
				<WalletButton
					connectionState="connected"
					wallet={mockBackpackWallet}
					variant="connected"
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
		status: 'disconnected',
	},
	render: (_args) => (
		<div className="flex flex-col gap-4 p-6 rounded-xl bg-zinc-900">
			<h3 className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">All States</h3>
			<div className="flex flex-col gap-3">
				<WalletButton connectionState="disconnected" variant="filled">
					Connect Wallet
				</WalletButton>
				<WalletButton connectionState="connecting" variant="loading" disabled />
				<WalletButton connectionState="connected" wallet={mockBackpackWallet} variant="connected" />
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
		status: 'connected',
	},
	render: () => (
		<div className="relative pt-12">
			<WalletDropdown
				wallet={mockBackpackWallet}
				address={mockAddress}
				balance={lamports(0n)}
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
		status: 'connected',
	},
	render: () => (
		<div className="relative pt-12">
			<WalletDropdown
				wallet={mockBackpackWallet}
				address={mockAddress}
				balance={lamports(123456789012345678n)}
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
		status: 'disconnected',
		isReady: false,
	},
	render: () => (
		<div className="flex flex-col items-center gap-2">
			<WalletButton connectionState="connecting" variant="loading" disabled />
			<span className="text-xs text-zinc-500">isReady: false (SDK initializing...)</span>
		</div>
	),
};
