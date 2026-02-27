import { address } from '@solana/kit';
import type { Meta, StoryObj } from '@storybook/react';
import type { ClassifiedTransaction } from 'tx-indexer';
import { TransactionTable } from '../kit-components/ui/transaction-table';

const meta: Meta<typeof TransactionTable> = {
	title: 'Kit Components/Data/TransactionTable',
	component: TransactionTable,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
		},
		isLoading: {
			control: 'boolean',
		},
		dateFilter: {
			control: 'select',
			options: ['all', '7d', '30d', '90d'],
		},
		typeFilter: {
			control: 'select',
			options: ['all', 'sent', 'received'],
		},
	},
	decorators: [
		(Story) => (
			<div className="p-8">
				<div className="mx-auto max-w-5xl">
					<Story />
				</div>
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

const WALLET = address('6DMh7fYHrKdCJwCFUQfMfNAdLADi9xqsRKNzmZA31DkK');
const OTHER = address('Hb6dzd4pYxmFYKkJDWuhzBEUkkaE93sFcvXYtriTkmw9');

function makeTransferTx(params: {
	signature: string;
	blockTimeSeconds: number;
	sender: string;
	receiver: string;
	symbol: string;
	amountUi: number;
	fiat?: number;
	logoURI?: string;
}): ClassifiedTransaction {
	return {
		tx: {
			signature: params.signature,
			slot: 0,
			blockTime: params.blockTimeSeconds,
			err: null,
			programIds: [],
			protocol: null,
			memo: null,
		},
		classification: {
			primaryType: 'transfer',
			primaryAmount: {
				token: {
					mint: 'So11111111111111111111111111111111111111112',
					symbol: params.symbol,
					decimals: 9,
					logoURI: params.logoURI,
				},
				amountRaw: '0',
				amountUi: params.amountUi,
				fiat: params.fiat
					? {
							currency: 'USD',
							amount: params.fiat,
							pricePerUnit: params.fiat / Math.max(params.amountUi, 1),
						}
					: undefined,
			},
			sender: params.sender,
			receiver: params.receiver,
			counterparty: {
				type: 'unknown',
				address: params.sender === WALLET ? params.receiver : params.sender,
			},
			confidence: 1,
		},
		legs: [
			{
				accountId: params.sender,
				side: 'debit',
				amount: {
					token: {
						mint: 'So11111111111111111111111111111111111111112',
						symbol: params.symbol,
						decimals: 9,
						logoURI: params.logoURI,
					},
					amountRaw: '0',
					amountUi: params.amountUi,
				},
				role: 'sent',
			},
			{
				accountId: params.receiver,
				side: 'credit',
				amount: {
					token: {
						mint: 'So11111111111111111111111111111111111111112',
						symbol: params.symbol,
						decimals: 9,
						logoURI: params.logoURI,
					},
					amountRaw: '0',
					amountUi: params.amountUi,
				},
				role: 'received',
			},
		],
	} as unknown as ClassifiedTransaction;
}

const SOL_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png';
const USDC_LOGO =
	'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png';

const SAMPLE_TXS: ClassifiedTransaction[] = [
	makeTransferTx({
		signature: '5xG7abc...9Kp2',
		blockTimeSeconds: 1767139200,
		sender: WALLET,
		receiver: OTHER,
		symbol: 'SOL',
		amountUi: 3,
		fiat: 399.62,
		logoURI: SOL_LOGO,
	}),
	makeTransferTx({
		signature: '6xG7abc...9Kp3',
		blockTimeSeconds: 1768435200,
		sender: OTHER,
		receiver: WALLET,
		symbol: 'USDC',
		amountUi: 95,
		logoURI: USDC_LOGO,
	}),
	makeTransferTx({
		signature: '7xG7abc...9Kp4',
		blockTimeSeconds: 1767139200,
		sender: WALLET,
		receiver: OTHER,
		symbol: 'SOL',
		amountUi: 3,
		fiat: 399.62,
		logoURI: SOL_LOGO,
	}),
	makeTransferTx({
		signature: '8xG7abc...9Kp5',
		blockTimeSeconds: 1767139200,
		sender: OTHER,
		receiver: WALLET,
		symbol: 'USDC',
		amountUi: 95,
		logoURI: USDC_LOGO,
	}),
];

const handleViewTransaction = (tx: ClassifiedTransaction) => {
	window.open(`https://explorer.solana.com/tx/${String(tx.tx.signature)}`, '_blank');
};

export const Default: Story = {
	args: {
		walletAddress: WALLET,
		transactions: SAMPLE_TXS,
		onViewTransaction: handleViewTransaction,
	},
};

export const Loading: Story = {
	args: {
		walletAddress: WALLET,
		transactions: SAMPLE_TXS,
		isLoading: true,
	},
};

export const Empty: Story = {
	args: {
		walletAddress: WALLET,
		transactions: [],
	},
};
