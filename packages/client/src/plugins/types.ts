import type { ClientPlugin } from '@solana/plugin-core';
import type { SolTransferHelper } from '../features/sol';
import type { SplTokenHelper, SplTokenHelperConfig } from '../features/spl';
import type { StakeHelper } from '../features/stake';
import type { TransactionHelper } from '../features/transactions';
import type { WsolHelper } from '../features/wsol';
import type { SolanaClientRuntime } from '../rpc/types';
import type {
	ClientActions,
	ClientHelpers,
	ClientStore,
	ClientWatchers,
	ResolvedClientConfig,
	SolanaClientConfig,
} from '../types';
import type { WalletConnector, WalletRegistry } from '../wallet/types';

/**
 * Resolved configuration after applying defaults and cluster resolution.
 * Re-exported from main types for convenience.
 */
export type ResolvedConfig = ResolvedClientConfig;

/**
 * Client with config plugin applied.
 */
export type ClientWithConfig = Readonly<{
	config: ResolvedConfig;
}>;

/**
 * Client with store plugin applied.
 */
export type ClientWithStore = ClientWithConfig &
	Readonly<{
		store: ClientStore;
	}>;

/**
 * Client with connectors plugin applied.
 */
export type ClientWithConnectors = Readonly<{
	connectors: WalletRegistry;
}>;

/**
 * Client with runtime plugin applied.
 */
export type ClientWithRuntime = ClientWithConfig &
	Readonly<{
		runtime: SolanaClientRuntime;
	}>;

/**
 * Client with actions plugin applied.
 */
export type ClientWithActions = ClientWithRuntime &
	ClientWithStore &
	ClientWithConnectors &
	Readonly<{
		actions: ClientActions;
	}>;

/**
 * Client with watchers plugin applied.
 */
export type ClientWithWatchers = ClientWithRuntime &
	ClientWithStore &
	Readonly<{
		watchers: ClientWatchers;
	}>;

/**
 * Client with helpers plugin applied.
 */
export type ClientWithHelpers = ClientWithRuntime &
	ClientWithStore &
	Readonly<{
		helpers: ClientHelpers;
	}>;

/**
 * Client with legacy aliases plugin applied.
 */
export type ClientWithAliases = ClientWithHelpers &
	Readonly<{
		solTransfer: SolTransferHelper;
		SolTransfer: SolTransferHelper;
		splToken(config: SplTokenHelperConfig): SplTokenHelper;
		SplToken(config: SplTokenHelperConfig): SplTokenHelper;
		SplHelper(config: SplTokenHelperConfig): SplTokenHelper;
		stake: StakeHelper;
		transaction: TransactionHelper;
		wsol: WsolHelper;
		prepareTransaction: ClientHelpers['prepareTransaction'];
	}>;

/**
 * Client with lifetime plugin applied.
 */
export type ClientWithLifetime = Readonly<{
	destroy(): void;
}>;

/**
 * Re-export ClientPlugin type for convenience.
 */
export type { ClientPlugin };

/**
 * Options for the config plugin.
 */
export type ConfigPluginOptions = SolanaClientConfig;

/**
 * Options for the store plugin.
 */
export type StorePluginOptions = Readonly<{
	existingStore?: ClientStore;
}>;

/**
 * Options for the connectors plugin.
 */
export type ConnectorsPluginOptions = Readonly<{
	connectors?: readonly WalletConnector[];
}>;
