import type { ClusterMoniker, WalletStatus } from '@solana/client';

/** Network configuration */
export interface Network {
	/** Unique identifier */
	id: ClusterMoniker;
	/** Display name */
	label: string;
	/** RPC endpoint URL (optional for custom) */
	endpoint?: string;
}

/** Props for NetworkSwitcher main component */
export interface NetworkSwitcherProps {
	/** Currently selected network */
	selectedNetwork: ClusterMoniker;
	/** Network connection status */
	status?: WalletStatus['status'];
	/** Callback when network is changed */
	onNetworkChange?: (network: ClusterMoniker) => void;
	/** Whether dropdown is open (controlled) */
	open?: boolean;
	/** Callback when open state changes */
	onOpenChange?: (open: boolean) => void;
	/** Custom networks to display */
	networks?: Network[];
	/** Additional CSS classes */
	className?: string;
	/** Disable the switcher */
	disabled?: boolean;
}

/** Props for NetworkTrigger component */
export interface NetworkTriggerProps {
	/** Whether dropdown is open */
	isOpen?: boolean;
	/** Label of the selected network (e.g. "Devnet") */
	selectedLabel?: string;
	/** Network connection status */
	status?: WalletStatus['status'];
	/** Click handler */
	onClick?: () => void;
	/** Additional CSS classes */
	className?: string;
	/** Disable the trigger */
	disabled?: boolean;
}

/** Props for NetworkDropdown component */
export interface NetworkDropdownProps {
	/** Currently selected network */
	selectedNetwork: ClusterMoniker;
	/** Network connection status */
	status?: WalletStatus['status'];
	/** Networks to display */
	networks: Network[];
	/** Callback when network is selected */
	onSelect?: (network: ClusterMoniker) => void;
	/** Additional CSS classes */
	className?: string;
}

/** Props for NetworkOption component */
export interface NetworkOptionProps {
	/** Network data */
	network: Network;
	/** Whether this option is selected */
	isSelected?: boolean;
	/** Network status (only shown for selected) */
	status?: WalletStatus['status'];
	/** Click handler */
	onClick?: () => void;
	/** Additional CSS classes */
	className?: string;
}

/** Props for NetworkHeader component */
export interface NetworkHeaderProps {
	/** Whether dropdown is open */
	isOpen?: boolean;
	/** Click handler to toggle */
	onClick?: () => void;
	/** Additional CSS classes */
	className?: string;
}

/** Props for StatusIndicator component */
export interface StatusIndicatorProps {
	/** Connection status */
	status: WalletStatus['status'];
	/** Additional CSS classes */
	className?: string;
}

/** Default networks */
export const DEFAULT_NETWORKS: Network[] = [
	{ id: 'mainnet-beta', label: 'Mainnet', endpoint: 'https://api.mainnet-beta.solana.com' },
	{ id: 'testnet', label: 'Testnet', endpoint: 'https://api.testnet.solana.com' },
	{ id: 'localnet', label: 'Localnet', endpoint: 'http://localhost:8899' },
	{ id: 'devnet', label: 'Devnet', endpoint: 'https://api.devnet.solana.com' },
];
