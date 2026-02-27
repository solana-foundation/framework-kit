/**
 * NetworkSwitcher - A dropdown component for switching between Solana networks.
 *
 * @packageDocumentation
 *
 * ## Quick Start
 *
 * ```tsx
 * import { NetworkSwitcher } from '@framework-kit/components';
 *
 * <NetworkSwitcher
 *   selectedNetwork="mainnet-beta"
 *   status="connected"
 *   onNetworkChange={(network) => console.log(network)}
 * />
 * ```
 *
 * ## Composable Sub-components
 *
 * ```tsx
 * import { NetworkDropdown, NetworkTrigger, NetworkOption } from '@framework-kit/components';
 *
 * // Build custom layouts with sub-components
 * <NetworkDropdown
 *   selectedNetwork="devnet"
 *   status="connected"
 *   networks={[...]}
 *   onSelect={handleSelect}
 * />
 * ```
 */

// Sub-components
export { NetworkDropdown } from './NetworkDropdown';
export { NetworkHeader } from './NetworkHeader';
export { NetworkOption } from './NetworkOption';
// Main component
export { NetworkSwitcher } from './NetworkSwitcher';
export { NetworkTrigger } from './NetworkTrigger';
export { StatusIndicator } from './StatusIndicator';
export type {
	Network,
	NetworkDropdownProps,
	NetworkHeaderProps,
	NetworkOptionProps,
	NetworkSwitcherProps,
	NetworkTriggerProps,
	StatusIndicatorProps,
} from './types';
// Types and constants
export { DEFAULT_NETWORKS } from './types';
