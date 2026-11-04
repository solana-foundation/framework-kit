import type { WalletConnectorMetadata } from '@solana/client';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
	ConnectingView,
	ErrorView,
	ModalHeader,
	type ModalView,
	NoWalletLink,
	WalletCard,
	WalletLabel,
	WalletModal,
} from '../kit-components/ui/wallet-modal';
import backpackIcon from '../kit-components/ui/wallet-modal/assets/backpack.png';
// Import wallet icons from assets
import phantomIcon from '../kit-components/ui/wallet-modal/assets/phantom.png';
import solflareIcon from '../kit-components/ui/wallet-modal/assets/solflare.png';

// Mock wallet data
const MOCK_WALLETS: WalletConnectorMetadata[] = [
	{
		id: 'phantom',
		name: 'Phantom',
		icon: phantomIcon,
		ready: true,
	},
	{
		id: 'solflare',
		name: 'Solflare',
		icon: solflareIcon,
		ready: true,
	},
	{
		id: 'backpack',
		name: 'Backpack',
		icon: backpackIcon,
		ready: true,
	},
];

const meta = {
	title: 'Components/WalletModal',
	component: WalletModal,
	parameters: {
		layout: 'centered',
		backgrounds: {
			default: 'dark',
			values: [
				{ name: 'dark', value: '#18181B' },
				{ name: 'light', value: '#F4F4F5' },
			],
		},
	},
	tags: ['autodocs'],
	argTypes: {
		view: {
			control: 'select',
			options: ['list', 'connecting', 'error'],
		},
	},
} satisfies Meta<typeof WalletModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// MAIN MODAL STORIES
// ============================================

/** Default wallet list view */
export const ListView: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'list',
	},
};

/** Connecting state */
export const Connecting: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'connecting',
		connectingWallet: MOCK_WALLETS[0],
	},
};

/** Error state */
export const ErrorState: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'error',
		error: {
			title: 'Connection failed',
			message: 'Unable to connect. Please try again.',
		},
	},
};

/** Empty wallet list */
export const EmptyWalletList: Story = {
	args: {
		wallets: [],
		view: 'list',
	},
};

/** Single wallet in list */
export const SingleWallet: Story = {
	args: {
		wallets: [MOCK_WALLETS[0]],
		view: 'list',
	},
};

/** Without "I don't have a wallet" link */
export const WithoutNoWalletLink: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'list',
		showNoWalletLink: false,
	},
};

// ============================================
// INTERACTIVE STORIES
// ============================================

/** Interactive modal with full flow */
export const Interactive: Story = {
	args: {
		wallets: MOCK_WALLETS,
	},
	render: function InteractiveModal(args) {
		const [view, setView] = useState<ModalView>('list');
		const [connectingWallet, setConnectingWallet] = useState<WalletConnectorMetadata | null>(null);
		const [error, setError] = useState<{ title?: string; message?: string } | null>(null);

		const handleSelectWallet = (wallet: WalletConnectorMetadata) => {
			setConnectingWallet(wallet);
			setView('connecting');

			// Simulate connection attempt
			setTimeout(() => {
				// 50% chance of success
				if (Math.random() > 0.5) {
					alert(`Connected to ${wallet.name}!`);
					setView('list');
					setConnectingWallet(null);
				} else {
					setError({
						title: 'Connection failed',
						message: 'User rejected the connection request.',
					});
					setView('error');
				}
			}, 2000);
		};

		const handleBack = () => {
			setView('list');
			setConnectingWallet(null);
			setError(null);
		};

		const handleRetry = () => {
			if (connectingWallet) {
				handleSelectWallet(connectingWallet);
			}
		};

		const handleClose = () => {
			alert('Modal closed');
		};

		return (
			<WalletModal
				{...args}
				view={view}
				connectingWallet={connectingWallet}
				error={error}
				onSelectWallet={handleSelectWallet}
				onBack={handleBack}
				onRetry={handleRetry}
				onClose={handleClose}
			/>
		);
	},
};

// ============================================
// SUB-COMPONENT STORIES
// ============================================

/** WalletCard - All positions */
export const WalletCardPositions: Story = {
	args: {
		wallets: MOCK_WALLETS,
	},
	render: () => (
		<div className="w-[313px]">
			<WalletCard wallet={MOCK_WALLETS[0]} position="first" />
			<WalletCard wallet={MOCK_WALLETS[1]} position="middle" />
			<WalletCard wallet={MOCK_WALLETS[2]} position="last" />
		</div>
	),
};

/** WalletLabel - All variants */
export const WalletLabelVariants: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="flex gap-2">
			<WalletLabel type="recent" />
			<WalletLabel type="detected" />
			<WalletLabel type="installed" />
		</div>
	),
};

/** ModalHeader - Variants */
export const ModalHeaderVariants: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="flex flex-col gap-4 w-[313px]">
			<div className="bg-zinc-700 p-4 rounded">
				<ModalHeader title="Connect Wallet" />
			</div>
			<div className="bg-zinc-700 p-4 rounded">
				<ModalHeader title="" showBack />
			</div>
		</div>
	),
};

/** ConnectingView - Standalone */
export const ConnectingViewStandalone: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="bg-zinc-700 p-6 rounded-[15px] w-[361px]">
			<ConnectingView wallet={MOCK_WALLETS[0]} />
		</div>
	),
};

/** ErrorView - Standalone */
export const ErrorViewStandalone: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="bg-zinc-700 p-6 rounded-[15px] w-[361px]">
			<ErrorView />
		</div>
	),
};

/** NoWalletLink - Standalone */
export const NoWalletLinkStandalone: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="w-[313px] bg-zinc-700 p-4 rounded">
			<NoWalletLink />
		</div>
	),
};

/** All states grid */
export const AllStatesGrid: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="flex flex-col gap-4">
			<WalletModal wallets={MOCK_WALLETS} view="list" />
			<WalletModal wallets={MOCK_WALLETS} view="connecting" connectingWallet={MOCK_WALLETS[0]} />
			<WalletModal wallets={MOCK_WALLETS} view="error" />
		</div>
	),
};
