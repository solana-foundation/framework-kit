import type { ClusterMoniker, WalletStatus } from '@solana/client';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';
import {
	DEFAULT_NETWORKS,
	NetworkDropdown,
	NetworkHeader,
	NetworkOption,
	NetworkSwitcher,
	NetworkTrigger,
	StatusIndicator,
} from '../kit-components/ui/network-switcher';

const meta = {
	title: 'Components/NetworkSwitcher',
	component: NetworkSwitcher,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		selectedNetwork: {
			control: 'select',
			options: ['mainnet-beta', 'testnet', 'devnet', 'localnet', 'custom'],
			description: 'Currently selected network',
		},
		status: {
			control: 'radio',
			options: ['connected', 'error', 'connecting'],
			description: 'Network connection status',
		},
		disabled: {
			control: 'boolean',
			description: 'Disable the switcher',
		},
	},
} satisfies Meta<typeof NetworkSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// MAIN COMPONENT STORIES
// ============================================================================

/** Collapsed (trigger) */
export const Collapsed: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connected',
	},
};

/** Expanded (dropdown) */
export const Expanded: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connected',
		open: true,
	},
};

// ============================================================================
// STATUS STORIES
// ============================================================================

/** Connected status (green dot) */
export const StatusConnected: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connected',
		open: true,
	},
};

/** Error status (red dot) */
export const StatusError: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'error',
		open: true,
	},
};

/** Connecting status (spinner) */
export const StatusConnecting: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connecting',
		open: true,
	},
};

// ============================================================================
// INTERACTIVE STORIES
// ============================================================================

/** Interactive - click to open/close and switch networks */
export const Interactive: Story = {
	render: function InteractiveRender() {
		const [selectedNetwork, setSelectedNetwork] = useState<ClusterMoniker>('mainnet-beta');
		const [status, setStatus] = useState<WalletStatus['status']>('connected');

		const handleNetworkChange = useCallback((network: ClusterMoniker) => {
			setStatus('connecting');
			// Simulate connection delay
			setTimeout(() => {
				setSelectedNetwork(network);
				setStatus('connected');
			}, 1500);
		}, []);

		return (
			<div className="flex flex-col items-center gap-4">
				<NetworkSwitcher
					selectedNetwork={selectedNetwork}
					status={status}
					onNetworkChange={handleNetworkChange}
				/>
				<p className="text-xs text-zinc-500">
					Current: {selectedNetwork} ({status})
				</p>
			</div>
		);
	},
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};

// ============================================================================
// SUB-COMPONENT STORIES
// ============================================================================

/** NetworkTrigger - collapsed state */
export const TriggerStandalone: Story = {
	render: () => <NetworkTrigger selectedLabel="Mainnet" status="connected" />,
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};

/** NetworkDropdown - standalone */
export const DropdownStandalone: Story = {
	render: () => <NetworkDropdown selectedNetwork="mainnet-beta" status="connected" networks={DEFAULT_NETWORKS} />,
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};

/** NetworkHeader - header row */
export const HeaderStandalone: Story = {
	render: () => (
		<div className="bg-zinc-700 p-2 rounded w-[180px]">
			<NetworkHeader isOpen />
		</div>
	),
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};

/** NetworkOption - individual options */
export const OptionStandalone: Story = {
	render: () => (
		<div className="bg-zinc-700 p-2 rounded w-[180px] space-y-1">
			<NetworkOption network={{ id: 'mainnet-beta', label: 'Mainnet' }} isSelected status="connected" />
			<NetworkOption network={{ id: 'devnet', label: 'Devnet' }} />
		</div>
	),
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};

/** StatusIndicator - all states */
export const StatusIndicators: Story = {
	render: () => (
		<div className="flex gap-8 items-center">
			<div className="flex flex-col items-center gap-2">
				<StatusIndicator status="connected" />
				<span className="text-xs text-zinc-500">Connected</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<StatusIndicator status="error" />
				<span className="text-xs text-zinc-500">Error</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<StatusIndicator status="connecting" />
				<span className="text-xs text-zinc-500">Connecting</span>
			</div>
		</div>
	),
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};

// ============================================================================
// ALL STATES GRID
// ============================================================================

/** All states comparison */
export const AllStatesGrid: Story = {
	render: () => (
		<div className="space-y-4">
			<h3 className="text-sm font-medium text-zinc-400">All States</h3>
			<div className="flex flex-wrap gap-4">
				<div className="flex flex-col gap-2">
					<NetworkSwitcher selectedNetwork="mainnet-beta" status="connected" />
					<span className="text-xs text-zinc-500">Collapsed</span>
				</div>
				<div className="flex flex-col gap-2">
					<NetworkDropdown selectedNetwork="mainnet-beta" status="connected" networks={DEFAULT_NETWORKS} />
					<span className="text-xs text-zinc-500">Connected</span>
				</div>
				<div className="flex flex-col gap-2">
					<NetworkDropdown selectedNetwork="mainnet-beta" status="error" networks={DEFAULT_NETWORKS} />
					<span className="text-xs text-zinc-500">Error</span>
				</div>
				<div className="flex flex-col gap-2">
					<NetworkDropdown selectedNetwork="mainnet-beta" status="connecting" networks={DEFAULT_NETWORKS} />
					<span className="text-xs text-zinc-500">Connecting</span>
				</div>
			</div>
		</div>
	),
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};

// ============================================================================
// DISABLED STATE
// ============================================================================

/** Disabled state */
export const Disabled: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connected',
		disabled: true,
	},
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/** Code example */
export const UsageExample: Story = {
	render: () => (
		<div className="max-w-xl p-6 bg-zinc-900 rounded-xl">
			<h3 className="text-sm font-medium text-zinc-300 mb-4">Usage Example</h3>
			<pre className="text-xs text-zinc-400 overflow-auto whitespace-pre-wrap">
				{`import { NetworkSwitcher } from '@framework-kit/components';
import { useState } from 'react';

function MyApp() {
  const [network, setNetwork] = useState('mainnet-beta');
  const [status, setStatus] = useState('connected');

  const handleNetworkChange = async (newNetwork) => {
    setStatus('connecting');
    try {
      await switchRpcEndpoint(newNetwork);
      setNetwork(newNetwork);
      setStatus('connected');
    } catch {
      setStatus('error');
    }
  };

  return (
    <NetworkSwitcher
      selectedNetwork={network}
      status={status}
      onNetworkChange={handleNetworkChange}
    />
  );
}`}
			</pre>
		</div>
	),
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};
