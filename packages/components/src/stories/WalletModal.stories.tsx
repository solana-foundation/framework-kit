import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
	ConnectingView,
	ErrorView,
	ModalHeader,
	type ModalView,
	NoWalletLink,
	WalletCard,
	type WalletInfo,
	WalletLabel,
	WalletModal,
} from '../kit-components/ui/wallet-modal';
import backpackIcon from '../kit-components/ui/wallet-modal/assets/backpack.png';
// Import wallet icons from assets
import phantomIcon from '../kit-components/ui/wallet-modal/assets/phantom.png';
import solflareIcon from '../kit-components/ui/wallet-modal/assets/solflare.png';

// Mock wallet data
const MOCK_WALLETS: WalletInfo[] = [
	{
		id: 'phantom',
		name: 'Phantom',
		icon: phantomIcon,
		label: 'recent',
		installed: true,
	},
	{
		id: 'solflare',
		name: 'Solflare',
		icon: solflareIcon,
		label: 'detected',
		installed: true,
	},
	{
		id: 'backpack',
		name: 'Backpack',
		icon: backpackIcon,
		installed: true,
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
		theme: {
			control: 'select',
			options: ['dark', 'light'],
		},
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

/** Default wallet list view - Dark theme */
export const ListViewDark: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'list',
		theme: 'dark',
	},
};

/** Default wallet list view - Light theme */
export const ListViewLight: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'list',
		theme: 'light',
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
};

/** Connecting state - Dark theme */
export const ConnectingDark: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'connecting',
		theme: 'dark',
		connectingWallet: MOCK_WALLETS[0],
	},
};

/** Connecting state - Light theme */
export const ConnectingLight: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'connecting',
		theme: 'light',
		connectingWallet: MOCK_WALLETS[0],
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
};

/** Error state - Dark theme */
export const ErrorDark: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'error',
		theme: 'dark',
		error: {
			title: 'Connection failed',
			message: 'Unable to connect. Please try again.',
		},
	},
};

/** Error state - Light theme */
export const ErrorLight: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'error',
		theme: 'light',
		error: {
			title: 'Connection failed',
			message: 'Unable to connect. Please try again.',
		},
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
};

/** Empty wallet list */
export const EmptyWalletList: Story = {
	args: {
		wallets: [],
		view: 'list',
		theme: 'dark',
	},
};

/** Single wallet in list */
export const SingleWallet: Story = {
	args: {
		wallets: [MOCK_WALLETS[0]],
		view: 'list',
		theme: 'dark',
	},
};

/** Without "I don't have a wallet" link */
export const WithoutNoWalletLink: Story = {
	args: {
		wallets: MOCK_WALLETS,
		view: 'list',
		theme: 'dark',
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
		theme: 'dark',
	},
	render: function InteractiveModal(args) {
		const [view, setView] = useState<ModalView>('list');
		const [connectingWallet, setConnectingWallet] = useState<WalletInfo | null>(null);
		const [error, setError] = useState<{ title?: string; message?: string } | null>(null);

		const handleSelectWallet = (wallet: WalletInfo) => {
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

/** Interactive - Light theme */
export const InteractiveLight: Story = {
	args: {
		wallets: MOCK_WALLETS,
		theme: 'light',
	},
	parameters: {
		backgrounds: { default: 'light' },
	},
	render: function InteractiveModalLight(args) {
		const [view, setView] = useState<ModalView>('list');
		const [connectingWallet, setConnectingWallet] = useState<WalletInfo | null>(null);
		const [error, setError] = useState<{ title?: string; message?: string } | null>(null);

		const handleSelectWallet = (wallet: WalletInfo) => {
			setConnectingWallet(wallet);
			setView('connecting');

			setTimeout(() => {
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

		return (
			<WalletModal
				{...args}
				view={view}
				connectingWallet={connectingWallet}
				error={error}
				onSelectWallet={handleSelectWallet}
				onBack={handleBack}
				onRetry={handleRetry}
				onClose={() => alert('Modal closed')}
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
		<div className="flex flex-col gap-8">
			<div>
				<h3 className="text-white text-sm mb-2">Dark Theme</h3>
				<div className="w-[313px]">
					<WalletCard wallet={MOCK_WALLETS[0]} theme="dark" position="first" />
					<WalletCard wallet={MOCK_WALLETS[1]} theme="dark" position="middle" />
					<WalletCard wallet={MOCK_WALLETS[2]} theme="dark" position="last" />
				</div>
			</div>
			<div>
				<h3 className="text-zinc-800 text-sm mb-2">Light Theme</h3>
				<div className="w-[313px]">
					<WalletCard wallet={MOCK_WALLETS[0]} theme="light" position="first" />
					<WalletCard wallet={MOCK_WALLETS[1]} theme="light" position="middle" />
					<WalletCard wallet={MOCK_WALLETS[2]} theme="light" position="last" />
				</div>
			</div>
		</div>
	),
	parameters: {
		backgrounds: { default: 'dark' },
	},
};

/** WalletLabel - All variants */
export const WalletLabelVariants: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2">
				<WalletLabel type="recent" theme="dark" />
				<WalletLabel type="detected" theme="dark" />
				<WalletLabel type="installed" theme="dark" />
			</div>
			<div className="flex gap-2 bg-zinc-100 p-2 rounded">
				<WalletLabel type="recent" theme="light" />
				<WalletLabel type="detected" theme="light" />
				<WalletLabel type="installed" theme="light" />
			</div>
		</div>
	),
};

/** ModalHeader - Variants */
export const ModalHeaderVariants: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="flex flex-col gap-4 w-[313px]">
			<div className="bg-zinc-700 p-4 rounded">
				<ModalHeader title="Connect Wallet" theme="dark" />
			</div>
			<div className="bg-zinc-700 p-4 rounded">
				<ModalHeader title="" theme="dark" showBack />
			</div>
			<div className="bg-zinc-100 p-4 rounded">
				<ModalHeader title="Connect Wallet" theme="light" />
			</div>
			<div className="bg-zinc-100 p-4 rounded">
				<ModalHeader title="" theme="light" showBack />
			</div>
		</div>
	),
};

/** ConnectingView - Standalone */
export const ConnectingViewStandalone: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="flex gap-4">
			<div className="bg-[#3F3F46] p-6 rounded-[15px] w-[361px]">
				<ConnectingView wallet={MOCK_WALLETS[0]} theme="dark" />
			</div>
			<div className="bg-[#FAFAFA] p-6 rounded-[15px] w-[361px]">
				<ConnectingView wallet={MOCK_WALLETS[0]} theme="light" />
			</div>
		</div>
	),
	parameters: {
		backgrounds: { default: 'dark' },
	},
};

/** ErrorView - Standalone */
export const ErrorViewStandalone: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="flex gap-4">
			<div className="bg-[#3F3F46] p-6 rounded-[15px] w-[361px]">
				<ErrorView theme="dark" />
			</div>
			<div className="bg-[#FAFAFA] p-6 rounded-[15px] w-[361px]">
				<ErrorView theme="light" />
			</div>
		</div>
	),
	parameters: {
		backgrounds: { default: 'dark' },
	},
};

/** NoWalletLink - Standalone */
export const NoWalletLinkStandalone: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="flex flex-col gap-4 w-[313px]">
			<div className="bg-zinc-700 p-4 rounded">
				<NoWalletLink theme="dark" />
			</div>
			<div className="bg-zinc-100 p-4 rounded">
				<NoWalletLink theme="light" />
			</div>
		</div>
	),
};

/** All states grid */
export const AllStatesGrid: Story = {
	args: { wallets: MOCK_WALLETS },
	render: () => (
		<div className="grid grid-cols-2 gap-6">
			{/* Dark theme */}
			<div className="flex flex-col gap-4">
				<h3 className="text-white font-semibold">Dark Theme</h3>
				<WalletModal wallets={MOCK_WALLETS} view="list" theme="dark" />
				<WalletModal wallets={MOCK_WALLETS} view="connecting" theme="dark" connectingWallet={MOCK_WALLETS[0]} />
				<WalletModal wallets={MOCK_WALLETS} view="error" theme="dark" />
			</div>
			{/* Light theme */}
			<div className="flex flex-col gap-4">
				<h3 className="text-zinc-200 font-semibold">Light Theme</h3>
				<WalletModal wallets={MOCK_WALLETS} view="list" theme="light" />
				<WalletModal
					wallets={MOCK_WALLETS}
					view="connecting"
					theme="light"
					connectingWallet={MOCK_WALLETS[0]}
				/>
				<WalletModal wallets={MOCK_WALLETS} view="error" theme="light" />
			</div>
		</div>
	),
	parameters: {
		backgrounds: { default: 'dark' },
	},
};
