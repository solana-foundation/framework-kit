import type { Meta, StoryObj } from '@storybook/react';
import {
	TransactionToast,
	TransactionToastProvider,
	useTransactionToast,
} from '../kit-components/ui/transaction-toast';

const mockSignature = '5UfDuX7hXrVoNMYhFpFdYxGE8mLqZnzCYQEHZ8Bj9K8xN2FvYYv5VT7qYRqXLwGKSk3nYhZx';

const meta: Meta<typeof TransactionToast> = {
	title: 'Kit Components/Feedback/TransactionToast',
	component: TransactionToast,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Displays transaction status notifications with a link to Solana Explorer. Supports pending, success, and error states for sent, received, and swap transactions.',
			},
		},
	},
	argTypes: {
		signature: {
			description: 'Solana transaction signature (base58 encoded)',
			table: {
				type: { summary: 'string' },
			},
		},
		status: {
			description: 'Current status of the transaction',
			control: 'select',
			options: ['pending', 'success', 'error'],
			table: {
				type: { summary: "'pending' | 'success' | 'error'" },
			},
		},
		type: {
			description: 'Type of transaction - determines the message shown',
			control: 'select',
			options: ['sent', 'received', 'swapped'],
			table: {
				defaultValue: { summary: 'sent' },
				type: { summary: "'sent' | 'received' | 'swapped'" },
			},
		},
		network: {
			description: 'Solana network for Explorer URL generation',
			control: 'select',
			options: ['mainnet-beta', 'devnet', 'testnet'],
			table: {
				defaultValue: { summary: 'mainnet-beta' },
				type: { summary: 'ClusterMoniker' },
			},
		},
		className: {
			description: 'Additional CSS classes to apply',
			table: {
				type: { summary: 'string' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// default

export const Default: Story = {
	args: {
		signature: mockSignature,
		status: 'success',
		type: 'sent',
	},
};

// for status variants

export const Pending: Story = {
	name: 'Status: Pending',
	args: {
		signature: mockSignature,
		status: 'pending',
		type: 'sent',
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows a spinning loader while the transaction is being confirmed.',
			},
		},
	},
};

export const Success: Story = {
	name: 'Status: Success',
	args: {
		signature: mockSignature,
		status: 'success',
		type: 'sent',
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows a green checkmark when the transaction is confirmed.',
			},
		},
	},
};

export const ErrorState: Story = {
	name: 'Status: Error',
	args: {
		signature: mockSignature,
		status: 'error',
		type: 'sent',
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows a red X icon when the transaction fails. Has assertive aria-live for accessibility.',
			},
		},
	},
};

// for transaction type variants

export const Sent: Story = {
	name: 'Type: Sent',
	args: {
		signature: mockSignature,
		status: 'success',
		type: 'sent',
	},
	parameters: {
		docs: {
			description: {
				story: 'Message: "Transaction sent successfully"',
			},
		},
	},
};

export const Received: Story = {
	name: 'Type: Received',
	args: {
		signature: mockSignature,
		status: 'success',
		type: 'received',
	},
	parameters: {
		docs: {
			description: {
				story: 'Message: "Transaction received successfully"',
			},
		},
	},
};

export const Swapped: Story = {
	name: 'Type: Swapped',
	args: {
		signature: mockSignature,
		status: 'success',
		type: 'swapped',
	},
	parameters: {
		docs: {
			description: {
				story: 'Message: "Swap completed successfully"',
			},
		},
	},
};

// for network variants

export const Mainnet: Story = {
	name: 'Network: Mainnet',
	args: {
		signature: mockSignature,
		status: 'success',
		type: 'sent',
		network: 'mainnet-beta',
	},
	parameters: {
		docs: {
			description: {
				story: 'Explorer link points to mainnet (no cluster param in URL).',
			},
		},
	},
};

export const Devnet: Story = {
	name: 'Network: Devnet',
	args: {
		signature: mockSignature,
		status: 'success',
		type: 'sent',
		network: 'devnet',
	},
	parameters: {
		docs: {
			description: {
				story: 'Explorer link includes ?cluster=devnet.',
			},
		},
	},
};

export const Testnet: Story = {
	name: 'Network: Testnet',
	args: {
		signature: mockSignature,
		status: 'success',
		type: 'sent',
		network: 'testnet',
	},
	parameters: {
		docs: {
			description: {
				story: 'Explorer link includes ?cluster=testnet.',
			},
		},
	},
};

// for all status × type combinations

export const AllCombinations: Story = {
	name: 'All Combinations',
	render: () => (
		<div className="space-y-6">
			<div>
				<h3 className="text-sm font-medium mb-2 text-zinc-600">Sent</h3>
				<div className="space-y-2">
					<TransactionToast signature={mockSignature} status="pending" type="sent" />
					<TransactionToast signature={mockSignature} status="success" type="sent" />
					<TransactionToast signature={mockSignature} status="error" type="sent" />
				</div>
			</div>
			<div>
				<h3 className="text-sm font-medium mb-2 text-zinc-600">Received</h3>
				<div className="space-y-2">
					<TransactionToast signature={mockSignature} status="pending" type="received" />
					<TransactionToast signature={mockSignature} status="success" type="received" />
					<TransactionToast signature={mockSignature} status="error" type="received" />
				</div>
			</div>
			<div>
				<h3 className="text-sm font-medium mb-2 text-zinc-600">Swapped</h3>
				<div className="space-y-2">
					<TransactionToast signature={mockSignature} status="pending" type="swapped" />
					<TransactionToast signature={mockSignature} status="success" type="swapped" />
					<TransactionToast signature={mockSignature} status="error" type="swapped" />
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'All 9 combinations of status (pending/success/error) and type (sent/received/swapped).',
			},
		},
	},
};

// for composition: with provider

const InteractiveDemo = () => {
	const { toast, update } = useTransactionToast();

	const handleTriggerToast = () => {
		const id = toast({
			signature: mockSignature,
			status: 'pending',
			type: 'sent',
		});

		// Simulate transaction confirmation after 2 seconds
		setTimeout(() => {
			update(id, { status: 'success' });
		}, 2000);
	};

	const handleTriggerError = () => {
		toast({
			signature: mockSignature,
			status: 'error',
			type: 'sent',
		});
	};

	return (
		<div className="space-x-2">
			<button
				type="button"
				onClick={handleTriggerToast}
				className="px-4 py-2 bg-zinc-800 text-white rounded-md text-sm hover:bg-zinc-700"
			>
				Send Transaction
			</button>
			<button
				type="button"
				onClick={handleTriggerError}
				className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-500"
			>
				Trigger Error
			</button>
		</div>
	);
};

export const WithProvider: Story = {
	name: 'Composition: With Provider',
	render: () => (
		<TransactionToastProvider>
			<InteractiveDemo />
		</TransactionToastProvider>
	),
	parameters: {
		docs: {
			description: {
				story: 'Interactive demo using TransactionToastProvider and useTransactionToast hook. Click "Send Transaction" to see a pending toast that updates to success after 2 seconds.',
			},
		},
	},
};

export const WithProviderDark: Story = {
	name: 'Composition: With Provider (Dark)',
	render: () => (
		<TransactionToastProvider>
			<div className="p-4 bg-zinc-900 rounded-lg">
				<InteractiveDemo />
			</div>
		</TransactionToastProvider>
	),
	parameters: {
		backgrounds: { default: 'dark' },
		docs: {
			description: {
				story: 'Same interactive demo with dark background.',
			},
		},
	},
};

// for playground

export const Playground: Story = {
	name: 'Playground',
	args: {
		signature: mockSignature,
		status: 'success',
		type: 'sent',
		network: 'mainnet-beta',
	},
	parameters: {
		docs: {
			description: {
				story: 'Use the controls panel to experiment with all props.',
			},
		},
	},
};
