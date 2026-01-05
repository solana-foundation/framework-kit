import type { Commitment } from '@solana/kit';

import { createSolTransferHelper, type SolTransferHelper } from '../features/sol';
import { createSplTokenHelper, type SplTokenHelper, type SplTokenHelperConfig } from '../features/spl';
import { createStakeHelper, type StakeHelper } from '../features/stake';
import { createTransactionHelper, type TransactionHelper } from '../features/transactions';
import { createWsolHelper, type WsolHelper } from '../features/wsol';
import type { SolanaClientRuntime } from '../rpc/types';
import {
	type PrepareTransactionMessage,
	type PrepareTransactionOptions,
	prepareTransaction as prepareTransactionUtility,
} from '../transactions/prepareTransaction';
import type { ClientHelpers, ClientStore } from '../types';

type SplTokenCacheEntry = Readonly<{
	baseCommitment?: Commitment;
	scoped: SplTokenHelper;
}>;

function withDefaultCommitment<T extends { commitment?: Commitment }>(
	config: T,
	getFallback: () => Commitment,
	baseCommitment?: Commitment,
): T {
	if (config.commitment !== undefined) {
		return config;
	}
	const commitment = baseCommitment ?? getFallback();
	return {
		...config,
		commitment,
	};
}

function wrapSolTransferHelper(helper: SolTransferHelper, getFallback: () => Commitment): SolTransferHelper {
	return {
		prepareTransfer: (config) => helper.prepareTransfer(withDefaultCommitment(config, getFallback)),
		sendPreparedTransfer: helper.sendPreparedTransfer,
		sendTransfer: (config, options) => helper.sendTransfer(withDefaultCommitment(config, getFallback), options),
	};
}

function wrapSplTokenHelper(
	helper: SplTokenHelper,
	getFallback: () => Commitment,
	baseCommitment?: Commitment,
): SplTokenHelper {
	const resolveCommitment = (commitment?: Commitment) => commitment ?? baseCommitment ?? getFallback();

	return {
		deriveAssociatedTokenAddress: helper.deriveAssociatedTokenAddress,
		fetchBalance: (owner, commitment) => helper.fetchBalance(owner, resolveCommitment(commitment)),
		prepareTransfer: (config) => helper.prepareTransfer(withDefaultCommitment(config, getFallback, baseCommitment)),
		sendPreparedTransfer: helper.sendPreparedTransfer,
		sendTransfer: (config, options) =>
			helper.sendTransfer(withDefaultCommitment(config, getFallback, baseCommitment), options),
	};
}

function wrapStakeHelper(helper: StakeHelper, getFallback: () => Commitment): StakeHelper {
	return {
		getStakeAccounts: helper.getStakeAccounts,
		prepareStake: (config) => helper.prepareStake(withDefaultCommitment(config, getFallback)),
		prepareUnstake: (config) => helper.prepareUnstake(withDefaultCommitment(config, getFallback)),
		prepareWithdraw: (config) => helper.prepareWithdraw(withDefaultCommitment(config, getFallback)),
		sendPreparedStake: helper.sendPreparedStake,
		sendPreparedUnstake: helper.sendPreparedUnstake,
		sendPreparedWithdraw: helper.sendPreparedWithdraw,
		sendStake: (config, options) => helper.sendStake(withDefaultCommitment(config, getFallback), options),
		sendUnstake: (config, options) => helper.sendUnstake(withDefaultCommitment(config, getFallback), options),
		sendWithdraw: (config, options) => helper.sendWithdraw(withDefaultCommitment(config, getFallback), options),
	};
}

function wrapWsolHelper(helper: WsolHelper, getFallback: () => Commitment): WsolHelper {
	return {
		deriveWsolAddress: helper.deriveWsolAddress,
		fetchWsolBalance: (owner, commitment) => helper.fetchWsolBalance(owner, commitment ?? getFallback()),
		prepareWrap: (config) => helper.prepareWrap(withDefaultCommitment(config, getFallback)),
		prepareUnwrap: (config) => helper.prepareUnwrap(withDefaultCommitment(config, getFallback)),
		sendPreparedWrap: helper.sendPreparedWrap,
		sendPreparedUnwrap: helper.sendPreparedUnwrap,
		sendWrap: (config, options) => helper.sendWrap(withDefaultCommitment(config, getFallback), options),
		sendUnwrap: (config, options) => helper.sendUnwrap(withDefaultCommitment(config, getFallback), options),
	};
}

function normaliseConfigValue(value: unknown): string | undefined {
	if (value === null || value === undefined) {
		return undefined;
	}
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'object' && 'toString' in value) {
		return String((value as { toString(): unknown }).toString());
	}
	return JSON.stringify(value);
}

function serialiseSplConfig(config: SplTokenHelperConfig): string {
	return JSON.stringify({
		associatedTokenProgram: normaliseConfigValue(config.associatedTokenProgram),
		commitment: normaliseConfigValue(config.commitment),
		decimals: config.decimals,
		mint: normaliseConfigValue(config.mint),
		tokenProgram: normaliseConfigValue(config.tokenProgram),
	});
}

export function createClientHelpers(runtime: SolanaClientRuntime, store: ClientStore): ClientHelpers {
	const getFallbackCommitment = () => store.getState().cluster.commitment;
	const splTokenCache = new Map<string, SplTokenCacheEntry>();
	let solTransfer: SolTransferHelper | undefined;
	let stake: StakeHelper | undefined;
	let transaction: TransactionHelper | undefined;
	let wsol: WsolHelper | undefined;

	const getSolTransfer = () => {
		if (!solTransfer) {
			solTransfer = wrapSolTransferHelper(createSolTransferHelper(runtime), getFallbackCommitment);
		}
		return solTransfer;
	};

	const getStake = () => {
		if (!stake) {
			stake = wrapStakeHelper(createStakeHelper(runtime), getFallbackCommitment);
		}
		return stake;
	};

	const getTransaction = () => {
		if (!transaction) {
			transaction = createTransactionHelper(runtime, getFallbackCommitment);
		}
		return transaction;
	};

	const getWsol = () => {
		if (!wsol) {
			wsol = wrapWsolHelper(createWsolHelper(runtime), getFallbackCommitment);
		}
		return wsol;
	};

	function getSplTokenHelper(config: SplTokenHelperConfig): SplTokenHelper {
		const cacheKey = serialiseSplConfig(config);
		const cached = splTokenCache.get(cacheKey);
		if (cached) {
			return cached.scoped;
		}
		const helper = createSplTokenHelper(runtime, config);
		const scoped = wrapSplTokenHelper(helper, getFallbackCommitment, config.commitment);
		splTokenCache.set(cacheKey, {
			baseCommitment: config.commitment,
			scoped,
		});
		return scoped;
	}

	const prepareTransactionWithRuntime = <TMessage extends PrepareTransactionMessage>(
		options: PrepareTransactionOptions<TMessage>,
	) =>
		prepareTransactionUtility({
			...options,
			rpc: runtime.rpc as Parameters<typeof prepareTransactionUtility>[0]['rpc'],
		});

	return Object.freeze({
		get solTransfer() {
			return getSolTransfer();
		},
		splToken: getSplTokenHelper,
		get stake() {
			return getStake();
		},
		get transaction() {
			return getTransaction();
		},
		get wsol() {
			return getWsol();
		},
		prepareTransaction: prepareTransactionWithRuntime,
	});
}
