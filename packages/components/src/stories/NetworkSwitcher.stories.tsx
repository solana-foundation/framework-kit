import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';
import {
	DEFAULT_NETWORKS,
	NetworkDropdown,
	NetworkHeader,
	type NetworkId,
	NetworkOption,
	type NetworkStatus,
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
		theme: {
			control: 'radio',
			options: ['dark', 'light'],
			description: 'Color theme',
		},
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

/** Dark theme - collapsed (trigger) */
export const DarkCollapsed: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connected',
		theme: 'dark',
	},
};

/** Light theme - collapsed (trigger) */
export const LightCollapsed: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connected',
		theme: 'light',
	},
	decorators: [
		(Story) => (
			<div className="bg-zinc-200 p-8 rounded-xl">
				<Story />
			</div>
		),
	],
};

/** Dark theme - expanded (dropdown) */
export const DarkExpanded: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connected',
		theme: 'dark',
		open: true,
	},
};

/** Light theme - expanded (dropdown) */
export const LightExpanded: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connected',
		theme: 'light',
		open: true,
	},
	decorators: [
		(Story) => (
			<div className="bg-zinc-200 p-8 rounded-xl">
				<Story />
			</div>
		),
	],
};

// ============================================================================
// STATUS STORIES
// ============================================================================

/** Connected status (green dot) */
export const StatusConnected: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connected',
		theme: 'dark',
		open: true,
	},
};

/** Error status (red dot) */
export const StatusError: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'error',
		theme: 'dark',
		open: true,
	},
};

/** Connecting status (spinner) */
export const StatusConnecting: Story = {
	args: {
		selectedNetwork: 'mainnet-beta',
		status: 'connecting',
		theme: 'dark',
		open: true,
	},
};

// ============================================================================
// INTERACTIVE STORIES
// ============================================================================

/** Interactive - click to open/close and switch networks */
export const Interactive: Story = {
	render: function InteractiveRender() {
		const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>('mainnet-beta');
		const [status, setStatus] = useState<NetworkStatus>('connected');

		const handleNetworkChange = useCallback((network: NetworkId) => {
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
					theme="dark"
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

/** Interactive Light Theme */
export const InteractiveLight: Story = {
	render: function InteractiveLightRender() {
		const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>('devnet');
		const [status, setStatus] = useState<NetworkStatus>('connected');

		const handleNetworkChange = useCallback((network: NetworkId) => {
			setStatus('connecting');
			setTimeout(() => {
				setSelectedNetwork(network);
				// Simulate occasional errors
				setStatus(Math.random() > 0.8 ? 'error' : 'connected');
			}, 1000);
		}, []);

		return (
			<div className="bg-zinc-100 p-8 rounded-xl flex flex-col items-center gap-4">
				<NetworkSwitcher
					selectedNetwork={selectedNetwork}
					status={status}
					onNetworkChange={handleNetworkChange}
					theme="light"
				/>
				<p className="text-xs text-zinc-600">
					Current: {selectedNetwork} ({status})
				</p>
			</div>
		);
	},
	args: {
		selectedNetwork: 'devnet',
	},
};

// ============================================================================
// SUB-COMPONENT STORIES
// ============================================================================

/** NetworkTrigger - collapsed state */
export const TriggerDark: Story = {
	render: () => (
		<div className="flex gap-4">
			<NetworkTrigger theme="dark" />
			<div className="bg-zinc-100 p-2 rounded">
				<NetworkTrigger theme="light" />
			</div>
		</div>
	),
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};

/** NetworkDropdown - standalone */
export const DropdownStandalone: Story = {
	render: () => (
		<div className="flex gap-8">
			<NetworkDropdown
				selectedNetwork="mainnet-beta"
				status="connected"
				networks={DEFAULT_NETWORKS}
				theme="dark"
			/>
			<div className="bg-zinc-100 p-2 rounded">
				<NetworkDropdown
					selectedNetwork="mainnet-beta"
					status="connected"
					networks={DEFAULT_NETWORKS}
					theme="light"
				/>
			</div>
		</div>
	),
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};

/** NetworkHeader - header row */
export const HeaderStandalone: Story = {
	render: () => (
		<div className="flex gap-8">
			<div className="bg-zinc-700 p-2 rounded w-[180px]">
				<NetworkHeader theme="dark" isOpen />
			</div>
			<div className="bg-zinc-100 p-2 rounded w-[180px]">
				<NetworkHeader theme="light" isOpen />
			</div>
		</div>
	),
	args: {
		selectedNetwork: 'mainnet-beta',
	},
};

/** NetworkOption - individual options */
export const OptionStandalone: Story = {
	render: () => (
		<div className="flex gap-8">
			<div className="bg-zinc-700 p-2 rounded w-[180px] space-y-1">
				<NetworkOption
					network={{ id: 'mainnet-beta', label: 'Mainnet' }}
					isSelected
					status="connected"
					theme="dark"
				/>
				<NetworkOption network={{ id: 'devnet', label: 'Devnet' }} theme="dark" />
			</div>
			<div className="bg-zinc-100 p-2 rounded w-[180px] space-y-1">
				<NetworkOption
					network={{ id: 'mainnet-beta', label: 'Mainnet' }}
					isSelected
					status="error"
					theme="light"
				/>
				<NetworkOption network={{ id: 'devnet', label: 'Devnet' }} theme="light" />
			</div>
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
		<div className="space-y-8">
			{/* Dark Theme */}
			<div className="space-y-4">
				<h3 className="text-sm font-medium text-zinc-400">Dark Theme</h3>
				<div className="flex flex-wrap gap-4">
					<div className="flex flex-col gap-2">
						<NetworkSwitcher selectedNetwork="mainnet-beta" status="connected" theme="dark" />
						<span className="text-xs text-zinc-500">Collapsed</span>
					</div>
					<div className="flex flex-col gap-2">
						<NetworkDropdown
							selectedNetwork="mainnet-beta"
							status="connected"
							networks={DEFAULT_NETWORKS}
							theme="dark"
						/>
						<span className="text-xs text-zinc-500">Connected</span>
					</div>
					<div className="flex flex-col gap-2">
						<NetworkDropdown
							selectedNetwork="mainnet-beta"
							status="error"
							networks={DEFAULT_NETWORKS}
							theme="dark"
						/>
						<span className="text-xs text-zinc-500">Error</span>
					</div>
					<div className="flex flex-col gap-2">
						<NetworkDropdown
							selectedNetwork="mainnet-beta"
							status="connecting"
							networks={DEFAULT_NETWORKS}
							theme="dark"
						/>
						<span className="text-xs text-zinc-500">Connecting</span>
					</div>
				</div>
			</div>

			{/* Light Theme */}
			<div className="bg-zinc-100 p-6 rounded-xl space-y-4">
				<h3 className="text-sm font-medium text-zinc-600">Light Theme</h3>
				<div className="flex flex-wrap gap-4">
					<div className="flex flex-col gap-2">
						<NetworkSwitcher selectedNetwork="mainnet-beta" status="connected" theme="light" />
						<span className="text-xs text-zinc-500">Collapsed</span>
					</div>
					<div className="flex flex-col gap-2">
						<NetworkDropdown
							selectedNetwork="mainnet-beta"
							status="connected"
							networks={DEFAULT_NETWORKS}
							theme="light"
						/>
						<span className="text-xs text-zinc-500">Connected</span>
					</div>
					<div className="flex flex-col gap-2">
						<NetworkDropdown
							selectedNetwork="mainnet-beta"
							status="error"
							networks={DEFAULT_NETWORKS}
							theme="light"
						/>
						<span className="text-xs text-zinc-500">Error</span>
					</div>
					<div className="flex flex-col gap-2">
						<NetworkDropdown
							selectedNetwork="mainnet-beta"
							status="connecting"
							networks={DEFAULT_NETWORKS}
							theme="light"
						/>
						<span className="text-xs text-zinc-500">Connecting</span>
					</div>
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
		theme: 'dark',
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
      theme="dark"
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
