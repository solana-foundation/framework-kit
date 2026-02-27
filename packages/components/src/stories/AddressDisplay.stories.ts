import { address } from '@solana/kit';
import type { Meta, StoryObj } from '@storybook/react';
import { AddressDisplay } from '../kit-components/ui/address-display';

const sampleAddress = address('Hb6dzd4pYxmFYKkJDWuhzBEUkkaE93sFcvXYtriTkmw9');

const meta: Meta<typeof AddressDisplay> = {
	title: 'Kit Components/Display/AddressDisplay',
	component: AddressDisplay,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Displays a truncated Solana address with copy-to-clipboard functionality and an optional link to Solana Explorer. Shows full address on hover.',
			},
		},
	},
	argTypes: {
		address: {
			description: 'Solana public key in base58 format',
			table: {
				type: { summary: 'Address' },
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
		showExplorerLink: {
			description: 'Whether to show the Solana Explorer link icon',
			control: 'boolean',
			table: {
				defaultValue: { summary: 'true' },
				type: { summary: 'boolean' },
			},
		},
		showTooltip: {
			description: 'Whether to show the full address tooltip on hover',
			control: 'boolean',
			table: {
				defaultValue: { summary: 'true' },
				type: { summary: 'boolean' },
			},
		},
		onCopy: {
			description: 'Callback fired after address is copied to clipboard',
			table: {
				type: { summary: '() => void' },
			},
		},
		className: {
			description: 'Additional CSS classes to apply to the container',
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
		address: sampleAddress,
	},
};

// for network variants

export const Mainnet: Story = {
	name: 'Network: Mainnet',
	args: {
		address: sampleAddress,
		network: 'mainnet-beta',
	},
};

export const Devnet: Story = {
	name: 'Network: Devnet',
	args: {
		address: sampleAddress,
		network: 'devnet',
	},
};

export const Testnet: Story = {
	name: 'Network: Testnet',
	args: {
		address: sampleAddress,
		network: 'testnet',
	},
};

// for feature variants

export const WithoutExplorerLink: Story = {
	name: 'Without Explorer Link',
	args: {
		address: sampleAddress,
		showExplorerLink: false,
	},
};

export const WithoutTooltip: Story = {
	name: 'Without Tooltip',
	args: {
		address: sampleAddress,
		showTooltip: false,
	},
	parameters: {
		docs: {
			description: {
				story: 'Hides the full-address tooltip on hover. Useful when the address is embedded in a tight layout like a dropdown.',
			},
		},
	},
};

export const WithCopyCallback: Story = {
	name: 'With Copy Callback',
	args: {
		address: sampleAddress,
		onCopy: () => console.log('Address copied!'),
	},
	parameters: {
		docs: {
			description: {
				story: 'Open the browser console and click the copy icon to see the callback fire.',
			},
		},
	},
};

// for playground

export const Playground: Story = {
	name: 'Playground',
	args: {
		address: sampleAddress,
		network: 'mainnet-beta',
		showExplorerLink: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Use the controls panel to experiment with all props.',
			},
		},
	},
};
