/** Available Solana networks */
export type NetworkId = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet' | 'custom';

/** Network connection status */
export type NetworkStatus = 'connected' | 'error' | 'connecting';

/** Theme variant */
export type Theme = 'dark' | 'light';

/** Network configuration */
export interface Network {
	/** Unique identifier */
	id: NetworkId;
	/** Display name */
	label: string;
	/** RPC endpoint URL (optional for custom) */
	endpoint?: string;
}

/** Props for NetworkSwitcher main component */
export interface NetworkSwitcherProps {
	/** Currently selected network */
	selectedNetwork: NetworkId;
	/** Network connection status */
	status?: NetworkStatus;
	/** Callback when network is changed */
	onNetworkChange?: (network: NetworkId) => void;
	/** Whether dropdown is open (controlled) */
	open?: boolean;
	/** Callback when open state changes */
	onOpenChange?: (open: boolean) => void;
	/** Theme variant */
	theme?: Theme;
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
	/** Theme variant */
	theme?: Theme;
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
	selectedNetwork: NetworkId;
	/** Network connection status */
	status?: NetworkStatus;
	/** Networks to display */
	networks: Network[];
	/** Callback when network is selected */
	onSelect?: (network: NetworkId) => void;
	/** Theme variant */
	theme?: Theme;
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
	status?: NetworkStatus;
	/** Theme variant */
	theme?: Theme;
	/** Click handler */
	onClick?: () => void;
	/** Additional CSS classes */
	className?: string;
}

/** Props for NetworkHeader component */
export interface NetworkHeaderProps {
	/** Whether dropdown is open */
	isOpen?: boolean;
	/** Theme variant */
	theme?: Theme;
	/** Click handler to toggle */
	onClick?: () => void;
	/** Additional CSS classes */
	className?: string;
}

/** Props for StatusIndicator component */
export interface StatusIndicatorProps {
	/** Connection status */
	status: NetworkStatus;
	/** Additional CSS classes */
	className?: string;
}

/** Default networks */
export const DEFAULT_NETWORKS: Network[] = [
	{ id: 'mainnet-beta', label: 'Mainnet', endpoint: 'https://api.mainnet-beta.solana.com' },
	{ id: 'testnet', label: 'Testnet', endpoint: 'https://api.testnet.solana.com' },
	{ id: 'localnet', label: 'Localnet', endpoint: 'http://localhost:8899' },
	{ id: 'custom', label: 'Custom RPC' },
	{ id: 'devnet', label: 'Devnet', endpoint: 'https://api.devnet.solana.com' },
];
