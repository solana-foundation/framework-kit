import { address, lamports } from '@solana/kit';
import type { Meta, StoryObj } from '@storybook/react';
import { BalanceCard } from '../kit-components/ui/balance-card';

// Sample wallet address for stories
const sampleWalletAddress = address('6DMh7fYHrKdCJwCFUQfMfNAdLADi9xqsRKNzmZA31DkK');
const altWalletAddress = address('9xQeWvG816hKfA2H2HnXHoGZTMbNJrPpT4Hz8knSjLm4');

const meta = {
	title: 'UI/BalanceCard',
	component: BalanceCard,
	parameters: {
		layout: 'centered',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
		},
		isLoading: {
			control: 'boolean',
		},
		isFiatBalance: {
			control: 'boolean',
		},
		defaultExpanded: {
			control: 'boolean',
		},
	},
	decorators: [
		(Story) => (
			<div style={{ width: '320px' }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof BalanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample token data
const sampleTokens = [
	{ symbol: 'USDC', balance: 15.5, fiatValue: 15.5 },
	{ symbol: 'USDT', balance: 10.18, fiatValue: 10.18 },
	{ symbol: 'USDG', balance: 15.5, fiatValue: 15.5 },
];

/**
 * Default with balance and tokens
 */
export const Default: Story = {
	args: {
		walletAddress: sampleWalletAddress,
		totalBalance: lamports(34_810_000_000n),
		tokenSymbol: 'SOL',
		tokens: sampleTokens,
	},
};

/**
 * Empty balance
 */
export const EmptyBalance: Story = {
	args: {
		walletAddress: altWalletAddress,
		totalBalance: lamports(0n),
		isFiatBalance: false,
		tokens: [],
		defaultExpanded: true,
	},
};

/**
 * Loading state - shows skeleton
 */
export const Loading: Story = {
	args: {
		walletAddress: sampleWalletAddress,
		totalBalance: lamports(0n),
		isLoading: true,
	},
};

/**
 * Zero balance state
 */
export const ZeroBalance: Story = {
	args: {
		walletAddress: sampleWalletAddress,
		totalBalance: lamports(0n),
		isFiatBalance: false,
		tokens: [],
	},
};

/**
 * Zero balance with expanded empty token list
 */
export const ZeroBalanceExpanded: Story = {
	args: {
		walletAddress: sampleWalletAddress,
		totalBalance: lamports(0n),
		isFiatBalance: false,
		tokens: [],
		defaultExpanded: true,
	},
};

/**
 * With tokens expanded
 */
export const WithTokensExpanded: Story = {
	args: {
		walletAddress: sampleWalletAddress,
		totalBalance: lamports(34_810_000_000n),
		isFiatBalance: true,
		tokens: sampleTokens,
		defaultExpanded: true,
	},
};

/**
 * Error state
 */
export const WithError: Story = {
	args: {
		walletAddress: sampleWalletAddress,
		totalBalance: lamports(0n),
		isFiatBalance: true,
		error: 'Error loading tokens.',
		onRetry: () => console.log('Retry clicked'),
	},
};

/**
 * Small size
 */
export const SmallSize: Story = {
	args: {
		walletAddress: sampleWalletAddress,
		totalBalance: lamports(34_810_000_000n),
		isFiatBalance: true,
		tokens: sampleTokens,
		size: 'sm',
	},
};

/**
 * Large size
 */
export const LargeSize: Story = {
	args: {
		walletAddress: sampleWalletAddress,
		totalBalance: lamports(34_810_000_000n),
		isFiatBalance: true,
		tokens: sampleTokens,
		size: 'lg',
	},
};

/**
 * Crypto balance display (non-fiat)
 */
export const CryptoBalance: Story = {
	args: {
		walletAddress: sampleWalletAddress,
		totalBalance: lamports(1_523_400_000n),
		isFiatBalance: false,
		tokenSymbol: 'SOL',
		displayDecimals: 4,
		tokens: [{ symbol: 'SOL', balance: 1.5234 }],
	},
};

/**
 * Token symbol balance display (e.g. "4.50 SOL")
 */
export const TokenSymbolBalance: Story = {
	args: {
		walletAddress: sampleWalletAddress,
		totalBalance: lamports(4_500_000_000n),
		tokenSymbol: 'SOL',
		tokens: sampleTokens,
	},
};
