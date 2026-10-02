import type { Meta, StoryObj } from '@storybook/react';
import type { SwapTokenInfo } from '../kit-components/ui/swap-input';
import { SwapInput } from '../kit-components/ui/swap-input';

const SOL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png';
const USDC_LOGO =
	'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png';

const solToken: SwapTokenInfo = { symbol: 'SOL', name: 'Solana', logoURI: SOL_LOGO };
const usdcToken: SwapTokenInfo = { symbol: 'USDC', name: 'USD Coin', logoURI: USDC_LOGO };

const tokenList: SwapTokenInfo[] = [
	solToken,
	usdcToken,
	{ symbol: 'USDT', name: 'Tether' },
	{ symbol: 'BONK', name: 'Bonk' },
	{ symbol: 'JUP', name: 'Jupiter' },
	{ symbol: 'RAY', name: 'Raydium' },
];

const meta = {
	title: 'Kit Components/Input/SwapInput',
	component: SwapInput,
	tags: ['autodocs'],
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
		disabled: {
			control: 'boolean',
		},
		receiveReadOnly: {
			control: 'boolean',
		},
	},
	decorators: [
		(Story) => (
			<div style={{ width: '400px' }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SwapInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default with empty amounts
 */
export const Default: Story = {
	args: {
		payAmount: '',
		receiveAmount: '',
		payToken: solToken,
		receiveToken: usdcToken,
		payTokens: tokenList,
		receiveTokens: tokenList,
		payBalance: '4.32',
		onSwapDirection: () => console.log('Swap direction'),
		onPayAmountChange: () => {},
		onPayTokenChange: (t) => console.log('Pay token changed:', t.symbol),
		onReceiveTokenChange: (t) => console.log('Receive token changed:', t.symbol),
	},
};

/**
 * Zero amounts entered
 */
export const ZeroAmounts: Story = {
	args: {
		payAmount: '0.00',
		receiveAmount: '0.00',
		payToken: solToken,
		receiveToken: usdcToken,
		payTokens: tokenList,
		receiveTokens: tokenList,
		payBalance: '4.32',
		onSwapDirection: () => console.log('Swap direction'),
		onPayAmountChange: () => {},
	},
};

/**
 * Filled state with amounts entered
 */
export const Filled: Story = {
	args: {
		payAmount: '1.21',
		receiveAmount: '1324.13',
		payToken: solToken,
		receiveToken: usdcToken,
		payTokens: tokenList,
		receiveTokens: tokenList,
		payBalance: '4.32',
		onSwapDirection: () => console.log('Swap direction'),
		onPayAmountChange: () => {},
	},
};

/**
 * Insufficient balance error state
 */
export const InsufficientBalance: Story = {
	args: {
		payAmount: '4.68',
		receiveAmount: '1324.13',
		payToken: solToken,
		receiveToken: usdcToken,
		payTokens: tokenList,
		receiveTokens: tokenList,
		payBalance: '4.32',
		onSwapDirection: () => console.log('Swap direction'),
		onPayAmountChange: () => {},
	},
};

/**
 * Loading/skeleton state
 */
export const Loading: Story = {
	args: {
		payAmount: '',
		receiveAmount: '',
		isLoading: true,
	},
};

/**
 * No token selected yet — with dropdown to pick one
 */
export const NoTokenSelected: Story = {
	args: {
		payAmount: '',
		receiveAmount: '',
		payBalance: '4.32',
		payTokens: tokenList,
		receiveTokens: tokenList,
		onPayTokenChange: (t) => console.log('Pay token changed:', t.symbol),
		onReceiveTokenChange: (t) => console.log('Receive token changed:', t.symbol),
		onPayAmountChange: () => {},
	},
};

/**
 * Small size
 */
export const SmallSize: Story = {
	args: {
		...Filled.args,
		size: 'sm',
	},
};

/**
 * Large size
 */
export const LargeSize: Story = {
	args: {
		...Filled.args,
		size: 'lg',
	},
};

/**
 * Disabled state
 */
export const Disabled: Story = {
	args: {
		...Filled.args,
		disabled: true,
	},
};
