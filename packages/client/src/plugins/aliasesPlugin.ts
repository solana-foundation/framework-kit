import type { SolTransferHelper } from '../features/sol';
import type { SplTokenHelper, SplTokenHelperConfig } from '../features/spl';
import type { StakeHelper } from '../features/stake';
import type { TransactionHelper } from '../features/transactions';
import type { WsolHelper } from '../features/wsol';
import type { ClientHelpers } from '../types';

type AliasesInputClient = {
	helpers: ClientHelpers;
};

type AliasesOutput = {
	solTransfer: SolTransferHelper;
	SolTransfer: SolTransferHelper;
	splToken(config: SplTokenHelperConfig): SplTokenHelper;
	SplToken(config: SplTokenHelperConfig): SplTokenHelper;
	SplHelper(config: SplTokenHelperConfig): SplTokenHelper;
	stake: StakeHelper;
	transaction: TransactionHelper;
	wsol: WsolHelper;
	prepareTransaction: ClientHelpers['prepareTransaction'];
};

/**
 * Creates a plugin that adds legacy helper aliases to the client.
 * These aliases provide backwards compatibility with the original API.
 *
 * @returns A plugin that adds helper aliases to the client.
 */
export function aliasesPlugin() {
	return <T extends AliasesInputClient>(client: T): T & AliasesOutput => {
		const { helpers } = client;

		return {
			...client,
			get solTransfer() {
				return helpers.solTransfer;
			},
			get SolTransfer() {
				return helpers.solTransfer;
			},
			splToken: helpers.splToken,
			SplToken: helpers.splToken,
			SplHelper: helpers.splToken,
			get stake() {
				return helpers.stake;
			},
			get transaction() {
				return helpers.transaction;
			},
			get wsol() {
				return helpers.wsol;
			},
			prepareTransaction: helpers.prepareTransaction,
		};
	};
}
