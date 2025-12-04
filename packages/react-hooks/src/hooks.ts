import {
	type AccountCacheEntry,
	type AddressLike,
	type AddressLookupTableData,
	type AsyncState,
	type ClientState,
	type ConfirmationCommitment,
	confirmationMeetsCommitment,
	createAsyncState,
	createInitialAsyncState,
	createSolTransferController,
	createSplTransferController,
	createStakeController,
	createTransactionPoolController,
	deriveConfirmationStatus,
	type LatestBlockhashCache,
	type NonceAccountData,
	normalizeSignature,
	SIGNATURE_STATUS_TIMEOUT_MS,
	type SignatureLike,
	type SolanaClient,
	type SolTransferHelper,
	type SolTransferInput,
	type SolTransferSendOptions,
	type SplTokenBalance,
	type SplTokenHelper,
	type SplTokenHelperConfig,
	type SplTransferController,
	type SplTransferInput,
	type StakeAccount,
	type StakeHelper,
	type StakeInput,
	type StakeSendOptions,
	type TransactionHelper,
	type TransactionInstructionInput,
	type TransactionInstructionList,
	type TransactionPoolController,
	type TransactionPoolPrepareAndSendOptions,
	type TransactionPoolPrepareOptions,
	type TransactionPoolSendOptions,
	type TransactionPoolSignOptions,
	type TransactionPrepareAndSendRequest,
	type TransactionPrepared,
	type TransactionSendOptions,
	toAddress,
	type UnstakeInput,
	type UnstakeSendOptions,
	type WalletSession,
	type WalletStatus,
	type WithdrawInput,
	type WithdrawSendOptions,
} from '@solana/client';
import type { Commitment, Lamports, Signature } from '@solana/kit';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import useSWR, { type BareFetcher, type SWRConfiguration } from 'swr';

import { useSolanaClient } from './context';
import { type SolanaQueryResult, type UseSolanaRpcQueryOptions, useSolanaRpcQuery } from './query';
import { type UseLatestBlockhashParameters, type UseLatestBlockhashReturnType, useLatestBlockhash } from './queryHooks';
import { getSignatureStatusKey } from './queryKeys';
import { useQuerySuspensePreference } from './querySuspenseContext';
import { useClientStore } from './useClientStore';

type ClusterState = ClientState['cluster'];
type ClusterStatus = ClientState['cluster']['status'];
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type RpcInstance = SolanaClient['runtime']['rpc'];

type SignatureStatusesPlan = ReturnType<RpcInstance['getSignatureStatuses']>;

type SignatureStatusesResponse = Awaited<ReturnType<SignatureStatusesPlan['send']>>;

type SignatureStatusValue = SignatureStatusesResponse['value'][number];

type SignatureStatusConfig = Parameters<RpcInstance['getSignatureStatuses']>[1];

type UseAccountOptions = Readonly<{
	commitment?: Commitment;
	fetch?: boolean;
	skip?: boolean;
	watch?: boolean;
}>;

type UseBalanceOptions = Readonly<{
	watch?: boolean;
}> &
	UseAccountOptions;

function createClusterSelector(): (state: ClientState) => ClusterState {
	return (state) => state.cluster;
}

function createClusterStatusSelector(): (state: ClientState) => ClusterStatus {
	return (state) => state.cluster.status;
}

function createWalletSelector(): (state: ClientState) => WalletStatus {
	return (state) => state.wallet;
}

function createAccountSelector(key?: string) {
	return (state: ClientState): AccountCacheEntry | undefined => (key ? state.accounts[key] : undefined);
}

type SuspensePromiseRef = {
	key: string | null;
	promise: Promise<unknown>;
};

function useSuspenseFetcher(
	config: Readonly<{
		enabled: boolean;
		fetcher: () => Promise<unknown>;
		key: string | null;
		ready: boolean;
	}>,
) {
	const preference = useQuerySuspensePreference();
	const suspenseEnabled = Boolean(preference) && config.enabled;
	const pendingRef = useRef<SuspensePromiseRef | null>(null);

	useEffect(() => {
		if (!suspenseEnabled) {
			pendingRef.current = null;
			return;
		}
		if (pendingRef.current && pendingRef.current.key !== config.key) {
			pendingRef.current = null;
		}
	}, [config.key, suspenseEnabled]);

	if (pendingRef.current && pendingRef.current.key !== config.key) {
		pendingRef.current = null;
	}

	if (suspenseEnabled && config.key && !config.ready) {
		if (!pendingRef.current) {
			const promise = config.fetcher();
			pendingRef.current = {
				key: config.key,
				promise: promise.finally(() => {
					if (pendingRef.current?.promise === promise) {
						pendingRef.current = null;
					}
				}),
			};
		}
		throw pendingRef.current.promise;
	}
}

/**
 * Read the full cluster state managed by the client store.
 *
 * @example
 * ```ts
 * const cluster = useClusterState();
 * console.log(cluster.endpoint, cluster.status);
 * ```
 */
export function useClusterState(): ClusterState {
	const selector = useMemo(createClusterSelector, []);
	return useClientStore(selector);
}

/**
 * Read just the cluster connection status slice (connecting/ready/error).
 *
 * @example
 * ```ts
 * const status = useClusterStatus();
 * if (status.status === 'error') console.error(status.error);
 * ```
 */
export function useClusterStatus(): ClusterStatus {
	const selector = useMemo(createClusterStatusSelector, []);
	return useClientStore(selector);
}

/**
 * Access the wallet status tracked by the client store (connected/connecting/error/disconnected).
 *
 * @example
 * ```ts
 * const wallet = useWallet();
 * if (wallet.status === 'connected') {
 *   console.log(wallet.session.account.address.toString());
 * }
 * ```
 */
export function useWallet(): WalletStatus {
	const selector = useMemo(createWalletSelector, []);
	return useClientStore(selector);
}

/**
 * Convenience helper that returns the active wallet session when connected, otherwise `undefined`.
 *
 * @example
 * ```ts
 * const session = useWalletSession();
 * const address = session?.account.address.toString();
 * ```
 */
export function useWalletSession(): WalletSession | undefined {
	const wallet = useWallet();
	if (wallet.status === 'connected') {
		return wallet.session;
	}
	return undefined;
}

/**
 * Access the headless client actions (setCluster, fetchAccount, connectWallet, etc.).
 *
 * @example
 * ```ts
 * const actions = useWalletActions();
 * await actions.connectWallet('phantom');
 * ```
 */
export function useWalletActions() {
	const client = useSolanaClient();
	return client.actions;
}

/**
 * Stable connect helper that resolves to {@link ClientActions.connectWallet}.
 *
 * @example
 * ```ts
 * const connect = useConnectWallet();
 * await connect('phantom', { autoConnect: true });
 * ```
 */
export function useConnectWallet(): (
	connectorId: string,
	options?: Readonly<{ autoConnect?: boolean; allowInteractiveFallback?: boolean }>,
) => Promise<void> {
	const client = useSolanaClient();
	return useCallback(
		(connectorId: string, options?: Readonly<{ autoConnect?: boolean; allowInteractiveFallback?: boolean }>) =>
			client.actions.connectWallet(connectorId, options),
		[client],
	);
}

/**
 * Stable disconnect helper mapping to {@link ClientActions.disconnectWallet}.
 *
 * @example
 * ```ts
 * const disconnect = useDisconnectWallet();
 * await disconnect();
 * ```
 */
export function useDisconnectWallet(): () => Promise<void> {
	const client = useSolanaClient();
	return useCallback(() => client.actions.disconnectWallet(), [client]);
}

type SolTransferSignature = UnwrapPromise<ReturnType<SolTransferHelper['sendTransfer']>>;

/**
 * Convenience wrapper around the SOL transfer helper that tracks status and signature.
 *
 * @example
 * ```ts
 * const { send, signature, status } = useSolTransfer();
 * await send({ amount: 1_000_000n, destination: toAddress('...') });
 * console.log(signature, status);
 * ```
 */
export function useSolTransfer(): Readonly<{
	error: unknown;
	helper: SolTransferHelper;
	isSending: boolean;
	reset(): void;
	send(config: SolTransferInput, options?: SolTransferSendOptions): Promise<SolTransferSignature>;
	signature: SolTransferSignature | null;
	status: AsyncState<SolTransferSignature>['status'];
}> {
	const client = useSolanaClient();
	const session = useWalletSession();
	const helper = client.solTransfer;
	const sessionRef = useRef(session);

	useEffect(() => {
		sessionRef.current = session;
	}, [session]);

	const controller = useMemo(
		() =>
			createSolTransferController({
				authorityProvider: () => sessionRef.current,
				helper,
			}),
		[helper],
	);

	const state = useSyncExternalStore<AsyncState<SolTransferSignature>>(
		controller.subscribe,
		controller.getState,
		controller.getState,
	);

	const send = useCallback(
		(config: SolTransferInput, options?: SolTransferSendOptions) => controller.send(config, options),
		[controller],
	);

	return {
		error: state.error ?? null,
		helper,
		isSending: state.status === 'loading',
		reset: controller.reset,
		send,
		signature: state.data ?? null,
		status: state.status,
	};
}

type StakeSignature = UnwrapPromise<ReturnType<StakeHelper['sendStake']>>;
type UnstakeSignature = UnwrapPromise<ReturnType<StakeHelper['sendUnstake']>>;
type WithdrawSignature = UnwrapPromise<ReturnType<StakeHelper['sendWithdraw']>>;

/**
 * Convenience wrapper around the stake helper that tracks status and signature for native SOL staking.
 * Allows staking SOL to a validator and returns transaction details.
 */
export function useStake(validatorId: AddressLike): Readonly<{
	error: unknown;
	getStakeAccounts(wallet: AddressLike, validatorIdFilter?: AddressLike): Promise<StakeAccount[]>;
	helper: StakeHelper;
	isStaking: boolean;
	isUnstaking: boolean;
	isWithdrawing: boolean;
	reset(): void;
	resetUnstake(): void;
	resetWithdraw(): void;
	stake(config: Omit<StakeInput, 'validatorId'>, options?: StakeSendOptions): Promise<StakeSignature>;
	unstake(config: Omit<UnstakeInput, 'validatorId'>, options?: UnstakeSendOptions): Promise<UnstakeSignature>;
	withdraw(config: Omit<WithdrawInput, 'validatorId'>, options?: WithdrawSendOptions): Promise<WithdrawSignature>;
	signature: StakeSignature | null;
	unstakeSignature: UnstakeSignature | null;
	withdrawSignature: WithdrawSignature | null;
	status: AsyncState<StakeSignature>['status'];
	unstakeStatus: AsyncState<UnstakeSignature>['status'];
	withdrawStatus: AsyncState<WithdrawSignature>['status'];
	unstakeError: unknown;
	withdrawError: unknown;
	validatorId: string;
}> {
	const client = useSolanaClient();
	const session = useWalletSession();
	const helper = client.stake;
	const sessionRef = useRef(session);
	const normalizedValidatorId = useMemo(() => String(validatorId), [validatorId]);

	useEffect(() => {
		sessionRef.current = session;
	}, [session]);

	const controller = useMemo(
		() =>
			createStakeController({
				authorityProvider: () => sessionRef.current,
				helper,
			}),
		[helper],
	);

	const state = useSyncExternalStore<AsyncState<StakeSignature>>(
		controller.subscribe,
		controller.getState,
		controller.getState,
	);

	const unstakeState = useSyncExternalStore<AsyncState<UnstakeSignature>>(
		controller.subscribeUnstake,
		controller.getUnstakeState,
		controller.getUnstakeState,
	);

	const withdrawState = useSyncExternalStore<AsyncState<WithdrawSignature>>(
		controller.subscribeWithdraw,
		controller.getWithdrawState,
		controller.getWithdrawState,
	);

	const stake = useCallback(
		(config: Omit<StakeInput, 'validatorId'>, options?: StakeSendOptions) =>
			controller.stake({ ...config, validatorId: normalizedValidatorId }, options),
		[controller, normalizedValidatorId],
	);

	const unstake = useCallback(
		(config: Omit<UnstakeInput, 'validatorId'>, options?: UnstakeSendOptions) =>
			controller.unstake({ ...config }, options),
		[controller],
	);

	const withdraw = useCallback(
		(config: Omit<WithdrawInput, 'validatorId'>, options?: WithdrawSendOptions) =>
			controller.withdraw({ ...config }, options),
		[controller],
	);

	const getStakeAccounts = useCallback(
		async (wallet: AddressLike, validatorIdFilter?: AddressLike) => {
			if (!helper.getStakeAccounts) {
				throw new Error(
					'getStakeAccounts is not available. Make sure you have the latest version of @solana/client package.',
				);
			}
			const walletAddr = typeof wallet === 'string' ? wallet : String(wallet);
			const filterAddr = validatorIdFilter
				? typeof validatorIdFilter === 'string'
					? validatorIdFilter
					: String(validatorIdFilter)
				: undefined;
			return helper.getStakeAccounts(walletAddr, filterAddr);
		},
		[helper],
	);

	return {
		error: state.error ?? null,
		getStakeAccounts,
		helper,
		isStaking: state.status === 'loading',
		isUnstaking: unstakeState.status === 'loading',
		isWithdrawing: withdrawState.status === 'loading',
		reset: controller.reset,
		resetUnstake: controller.resetUnstake,
		resetWithdraw: controller.resetWithdraw,
		stake,
		unstake,
		withdraw,
		signature: state.data ?? null,
		unstakeSignature: unstakeState.data ?? null,
		withdrawSignature: withdrawState.data ?? null,
		status: state.status,
		unstakeStatus: unstakeState.status,
		withdrawStatus: withdrawState.status,
		unstakeError: unstakeState.error ?? null,
		withdrawError: withdrawState.error ?? null,
		validatorId: normalizedValidatorId,
	};
}

type SplTokenBalanceResult = SplTokenBalance;
type SplTransferSignature = UnwrapPromise<ReturnType<SplTokenHelper['sendTransfer']>>;
type UseSplTokenOptions = Readonly<{
	commitment?: Commitment;
	config?: Omit<SplTokenHelperConfig, 'commitment' | 'mint'>;
	owner?: AddressLike;
	revalidateOnFocus?: boolean;
	swr?: Omit<
		SWRConfiguration<SplTokenBalanceResult, unknown, BareFetcher<SplTokenBalanceResult>>,
		'fallback' | 'suspense'
	>;
}>;

/**
 * Simplified SPL token hook that scopes helpers by mint and manages balance state.
 *
 * @example
 * ```ts
 * const { balance, send, owner } = useSplToken(mintAddress);
 * if (owner && balance?.exists) {
 *   await send({ amount: 1n, destinationOwner: toAddress('...') });
 * }
 * ```
 */
export function useSplToken(
	mint: AddressLike,
	options: UseSplTokenOptions = {},
): Readonly<{
	balance: SplTokenBalanceResult | null;
	error: unknown;
	helper: SplTokenHelper;
	isFetching: boolean;
	isSending: boolean;
	owner: string | null;
	refresh(): Promise<SplTokenBalanceResult | undefined>;
	refreshing: boolean;
	resetSend(): void;
	send(config: SplTransferInput, options?: SolTransferSendOptions): Promise<SplTransferSignature>;
	sendError: unknown;
	sendSignature: SplTransferSignature | null;
	sendStatus: AsyncState<SplTransferSignature>['status'];
	status: 'disconnected' | 'error' | 'loading' | 'ready';
}> {
	const client = useSolanaClient();
	const session = useWalletSession();
	const suspense = Boolean(useQuerySuspensePreference());

	const normalizedMint = useMemo(() => String(mint), [mint]);

	const helperConfig = useMemo<SplTokenHelperConfig>(
		() => ({
			commitment: options.commitment,
			mint: normalizedMint,
			...(options.config ?? {}),
		}),
		[normalizedMint, options.commitment, options.config],
	);

	const helper = useMemo(() => client.splToken(helperConfig), [client, helperConfig]);

	const ownerRaw = options.owner ?? session?.account.address;
	const owner = useMemo(() => (ownerRaw ? String(ownerRaw) : null), [ownerRaw]);

	const balanceKey = owner ? ['spl-balance', normalizedMint, owner, options.commitment ?? null] : null;

	const fetchBalance = useCallback(() => {
		if (!owner) {
			throw new Error('Unable to fetch SPL balance without an owner.');
		}
		return helper.fetchBalance(owner, options.commitment);
	}, [helper, owner, options.commitment]);

	const swrOptions = useMemo(
		() => ({
			revalidateOnFocus: options.revalidateOnFocus ?? false,
			suspense,
			...(options.swr ?? {}),
		}),
		[options.revalidateOnFocus, options.swr, suspense],
	);

	const { data, error, isLoading, isValidating, mutate } = useSWR<SplTokenBalanceResult>(
		balanceKey,
		fetchBalance,
		swrOptions,
	);

	const sessionRef = useRef(session);
	useEffect(() => {
		sessionRef.current = session;
	}, [session]);

	const ownerRef = useRef(owner);
	useEffect(() => {
		ownerRef.current = owner;
	}, [owner]);

	const controller = useMemo<SplTransferController>(
		() =>
			createSplTransferController({
				authorityProvider: () => sessionRef.current ?? undefined,
				helper,
				sourceOwnerProvider: () => ownerRef.current ?? undefined,
			}),
		[helper],
	);

	const sendState = useSyncExternalStore<AsyncState<SplTransferSignature>>(
		controller.subscribe,
		controller.getState,
		controller.getState,
	);

	const refresh = useCallback(() => {
		if (!owner) {
			return Promise.resolve(undefined);
		}
		return mutate(() => helper.fetchBalance(owner, options.commitment), { revalidate: false });
	}, [helper, mutate, owner, options.commitment]);

	const send = useCallback(
		async (config: SplTransferInput, sendOptions?: SolTransferSendOptions) => {
			const signature = await controller.send(config, sendOptions);
			if (owner) {
				await mutate(() => helper.fetchBalance(owner, options.commitment), { revalidate: false });
			}
			return signature;
		},
		[controller, helper, mutate, options.commitment, owner],
	);

	const resetSend = useCallback(() => {
		controller.reset();
	}, [controller]);

	const status: 'disconnected' | 'error' | 'loading' | 'ready' =
		owner === null ? 'disconnected' : error ? 'error' : isLoading && !data ? 'loading' : 'ready';

	return {
		balance: data ?? null,
		error: error ?? null,
		helper,
		isFetching: Boolean(owner) && (isLoading || isValidating),
		isSending: sendState.status === 'loading',
		owner,
		refresh,
		refreshing: Boolean(owner) && isValidating,
		resetSend,
		send,
		sendError: sendState.error ?? null,
		sendSignature: sendState.data ?? null,
		sendStatus: sendState.status,
		status,
	};
}

/**
 * Subscribe to the account cache for a given address, optionally triggering fetch & watch helpers.
 *
 * @example
 * ```ts
 * const account = useAccount(pubkey, { watch: true });
 * const lamports = account?.lamports ?? null;
 * ```
 */
export function useAccount(addressLike?: AddressLike, options: UseAccountOptions = {}): AccountCacheEntry | undefined {
	const client = useSolanaClient();
	const shouldSkip = options.skip ?? !addressLike;
	const address = useMemo(() => {
		if (shouldSkip || !addressLike) {
			return undefined;
		}
		return toAddress(addressLike);
	}, [addressLike, shouldSkip]);
	const accountKey = useMemo(() => address?.toString(), [address]);
	const selector = useMemo(() => createAccountSelector(accountKey), [accountKey]);
	const account = useClientStore(selector);

	useSuspenseFetcher({
		enabled: options.fetch !== false && !shouldSkip && Boolean(address),
		fetcher: () => {
			if (!address) {
				throw new Error('Provide an address before fetching account data.');
			}
			return client.actions.fetchAccount(address, options.commitment);
		},
		key: accountKey ?? null,
		ready: account !== undefined,
	});

	useEffect(() => {
		if (!address) {
			return;
		}
		const commitment = options.commitment;
		if (options.fetch !== false && account === undefined) {
			void client.actions.fetchAccount(address, commitment).catch(() => undefined);
		}
		if (options.watch) {
			const subscription = client.watchers.watchAccount({ address, commitment }, () => undefined);
			return () => {
				subscription.abort();
			};
		}
		return undefined;
	}, [account, address, client, options.commitment, options.fetch, options.watch]);

	return account;
}

/**
 * Track lamport balance for an address. Fetches immediately and watches by default.
 *
 * @example
 * ```ts
 * const { lamports, fetching } = useBalance(pubkey);
 * ```
 */
export function useBalance(
	addressLike?: AddressLike,
	options: UseBalanceOptions = {},
): Readonly<{
	account?: AccountCacheEntry;
	error?: unknown;
	fetching: boolean;
	lamports: Lamports | null;
	slot: bigint | null | undefined;
}> {
	const mergedOptions = useMemo(
		() => ({
			commitment: options.commitment,
			fetch: options.fetch ?? true,
			skip: options.skip,
			watch: options.watch ?? true,
		}),
		[options.commitment, options.fetch, options.skip, options.watch],
	);
	const client = useSolanaClient();
	const shouldSkip = mergedOptions.skip ?? !addressLike;
	const address = useMemo(() => {
		if (shouldSkip || !addressLike) {
			return undefined;
		}
		return toAddress(addressLike);
	}, [addressLike, shouldSkip]);
	const accountKey = useMemo(() => address?.toString(), [address]);
	const selector = useMemo(() => createAccountSelector(accountKey), [accountKey]);
	const account = useClientStore(selector);

	useSuspenseFetcher({
		enabled: mergedOptions.fetch !== false && !shouldSkip && Boolean(address),
		fetcher: () => {
			if (!address) {
				throw new Error('Provide an address before fetching balance.');
			}
			return client.actions.fetchBalance(address, mergedOptions.commitment);
		},
		key: accountKey ?? null,
		ready: account !== undefined,
	});

	useEffect(() => {
		if (!address) {
			return;
		}
		const commitment = mergedOptions.commitment;
		if (mergedOptions.fetch !== false && account === undefined) {
			void client.actions.fetchBalance(address, commitment).catch(() => undefined);
		}
		if (mergedOptions.watch) {
			const watcher = client.watchers.watchBalance({ address, commitment }, () => undefined);
			return () => {
				watcher.abort();
			};
		}
		return undefined;
	}, [account, address, client, mergedOptions.commitment, mergedOptions.fetch, mergedOptions.watch]);

	const lamports = account?.lamports ?? null;
	const fetching = account?.fetching ?? false;
	const slot = account?.slot;
	const error = account?.error;

	return useMemo(
		() => ({
			account,
			error,
			fetching,
			lamports,
			slot,
		}),
		[account, error, fetching, lamports, slot],
	);
}

type UseTransactionPoolConfig = Readonly<{
	instructions?: TransactionInstructionList;
	latestBlockhash?: UseLatestBlockhashParameters;
}>;

type UseTransactionPoolPrepareOptions = TransactionPoolPrepareOptions;

type UseTransactionPoolSignOptions = TransactionPoolSignOptions;

type UseTransactionPoolSendOptions = TransactionPoolSendOptions;

type UseTransactionPoolPrepareAndSendOptions = TransactionPoolPrepareAndSendOptions;

type TransactionSignature = Signature;

/**
 * Manage a mutable set of instructions and use the transaction helper to prepare/sign/send.
 *
 * @example
 * ```ts
 * const pool = useTransactionPool();
 * pool.addInstruction(ix);
 * const prepared = await pool.prepare({ feePayer });
 * await pool.send();
 * ```
 */
export function useTransactionPool(config: UseTransactionPoolConfig = {}): Readonly<{
	addInstruction(instruction: TransactionInstructionInput): void;
	addInstructions(instructionSet: TransactionInstructionList): void;
	clearInstructions(): void;
	instructions: TransactionInstructionList;
	isPreparing: boolean;
	isSending: boolean;
	prepared: TransactionPrepared | null;
	prepare(options?: UseTransactionPoolPrepareOptions): Promise<TransactionPrepared>;
	prepareError: unknown;
	prepareStatus: AsyncState<TransactionPrepared>['status'];
	removeInstruction(index: number): void;
	replaceInstructions(instructionSet: TransactionInstructionList): void;
	reset(): void;
	send(options?: UseTransactionPoolSendOptions): Promise<TransactionSignature>;
	sendError: unknown;
	sendSignature: TransactionSignature | null;
	sendStatus: AsyncState<TransactionSignature>['status'];
	prepareAndSend(
		request?: UseTransactionPoolPrepareAndSendOptions,
		sendOptions?: TransactionSendOptions,
	): Promise<TransactionSignature>;
	sign(options?: UseTransactionPoolSignOptions): ReturnType<TransactionHelper['sign']>;
	toWire(options?: UseTransactionPoolSignOptions): ReturnType<TransactionHelper['toWire']>;
	latestBlockhash: UseLatestBlockhashReturnType;
}> {
	const initialInstructions = useMemo<TransactionInstructionList>(
		() => config.instructions ?? [],
		[config.instructions],
	);
	const client = useSolanaClient();
	const helper = client.helpers.transaction;
	const swrRefreshInterval = config.latestBlockhash?.swr?.refreshInterval;
	const blockhashRefreshInterval =
		config.latestBlockhash?.refreshInterval ??
		(typeof swrRefreshInterval === 'number' ? swrRefreshInterval : undefined);
	const blockhashMaxAgeMs = blockhashRefreshInterval ?? 30_000;
	const controller = useMemo<TransactionPoolController>(
		() =>
			createTransactionPoolController({
				blockhashMaxAgeMs,
				helper,
				initialInstructions,
			}),
		[blockhashMaxAgeMs, helper, initialInstructions],
	);
	const latestBlockhash = useLatestBlockhash(config.latestBlockhash);

	useEffect(() => {
		const value = latestBlockhash.data?.value;
		if (!value) {
			controller.setLatestBlockhashCache(undefined);
			return;
		}
		const cache: LatestBlockhashCache = {
			updatedAt: latestBlockhash.dataUpdatedAt ?? Date.now(),
			value,
		};
		controller.setLatestBlockhashCache(cache);
	}, [controller, latestBlockhash.data, latestBlockhash.dataUpdatedAt]);

	const instructions = useSyncExternalStore<TransactionInstructionList>(
		controller.subscribeInstructions,
		controller.getInstructions,
		controller.getInstructions,
	);
	const prepared = useSyncExternalStore<TransactionPrepared | null>(
		controller.subscribePrepared,
		controller.getPrepared,
		controller.getPrepared,
	);
	const prepareState = useSyncExternalStore<AsyncState<TransactionPrepared>>(
		controller.subscribePrepareState,
		controller.getPrepareState,
		controller.getPrepareState,
	);
	const sendState = useSyncExternalStore<AsyncState<TransactionSignature>>(
		controller.subscribeSendState,
		controller.getSendState,
		controller.getSendState,
	);

	return {
		addInstruction: controller.addInstruction,
		addInstructions: controller.addInstructions,
		clearInstructions: controller.clearInstructions,
		instructions,
		isPreparing: prepareState.status === 'loading',
		isSending: sendState.status === 'loading',
		prepared,
		prepare: controller.prepare,
		prepareError: prepareState.error ?? null,
		prepareStatus: prepareState.status,
		removeInstruction: controller.removeInstruction,
		replaceInstructions: controller.replaceInstructions,
		reset: controller.reset,
		send: controller.send,
		sendError: sendState.error ?? null,
		sendSignature: sendState.data ?? null,
		sendStatus: sendState.status,
		prepareAndSend: controller.prepareAndSend,
		sign: controller.sign,
		toWire: controller.toWire,
		latestBlockhash,
	};
}

type SendTransactionSignature = Signature;

type UseSendTransactionResult = Readonly<{
	error: unknown;
	isSending: boolean;
	reset(): void;
	send(
		request: TransactionPrepareAndSendRequest,
		options?: TransactionSendOptions,
	): Promise<SendTransactionSignature>;
	sendPrepared(prepared: TransactionPrepared, options?: TransactionSendOptions): Promise<SendTransactionSignature>;
	signature: SendTransactionSignature | null;
	status: AsyncState<SendTransactionSignature>['status'];
}>;

/**
 * General-purpose helper that prepares and sends arbitrary transactions through {@link TransactionHelper}.
 *
 * @example
 * ```ts
 * const { send, status } = useSendTransaction();
 * await send({ instructions: [ix], feePayer });
 * ```
 */
export function useSendTransaction(): UseSendTransactionResult {
	const client = useSolanaClient();
	const helper = client.transaction;
	const session = useWalletSession();
	const [state, setState] = useState<AsyncState<SendTransactionSignature>>(() =>
		createInitialAsyncState<SendTransactionSignature>(),
	);

	const execute = useCallback(
		async (operation: () => Promise<SendTransactionSignature>): Promise<SendTransactionSignature> => {
			setState(createAsyncState<SendTransactionSignature>('loading'));
			try {
				const signature = await operation();
				setState(createAsyncState<SendTransactionSignature>('success', { data: signature }));
				return signature;
			} catch (error) {
				setState(createAsyncState<SendTransactionSignature>('error', { error }));
				throw error;
			}
		},
		[],
	);

	const ensureAuthority = useCallback(
		(request: TransactionPrepareAndSendRequest): TransactionPrepareAndSendRequest => {
			if (request.authority) {
				return request;
			}
			if (!session) {
				throw new Error('Connect a wallet or supply an `authority` before sending transactions.');
			}
			return { ...request, authority: session };
		},
		[session],
	);

	const send = useCallback(
		async (request: TransactionPrepareAndSendRequest, options?: TransactionSendOptions) => {
			const normalizedRequest = ensureAuthority(request);
			return execute(() => helper.prepareAndSend(normalizedRequest, options));
		},
		[ensureAuthority, execute, helper],
	);

	const sendPrepared = useCallback(
		async (prepared: TransactionPrepared, options?: TransactionSendOptions) =>
			execute(() => helper.send(prepared, options)),
		[execute, helper],
	);

	const reset = useCallback(() => {
		setState(createInitialAsyncState<SendTransactionSignature>());
	}, []);

	return {
		error: state.error ?? null,
		isSending: state.status === 'loading',
		reset,
		send,
		sendPrepared,
		signature: state.data ?? null,
		status: state.status,
	};
}

export type UseSignatureStatusOptions = Readonly<{
	config?: SignatureStatusConfig;
	disabled?: boolean;
	swr?: UseSolanaRpcQueryOptions<SignatureStatusValue | null>['swr'];
}>;

export type UseSignatureStatusParameters = UseSignatureStatusOptions &
	Readonly<{
		signature?: SignatureLike;
	}>;

type SignatureStatusState = SolanaQueryResult<SignatureStatusValue | null> &
	Readonly<{
		confirmationStatus: ConfirmationCommitment | null;
		signatureStatus: SignatureStatusValue | null;
	}>;

/**
 * Fetch the RPC status for a transaction signature.
 *
 * @example
 * ```ts
 * const { signatureStatus, confirmationStatus } = useSignatureStatus(sig);
 * ```
 */
export function useSignatureStatus(
	signatureInput?: SignatureLike,
	options: UseSignatureStatusOptions = {},
): SignatureStatusState {
	const { config, disabled: disabledOption, swr } = options;
	const signature = useMemo(() => normalizeSignature(signatureInput), [signatureInput]);
	const signatureKey = signature?.toString() ?? null;
	const fetcher = useCallback(
		async (client: SolanaClient) => {
			if (!signatureKey) {
				throw new Error('Provide a signature before querying its status.');
			}
			if (!signature) {
				throw new Error('Provide a signature before querying its status.');
			}
			const plan = client.runtime.rpc.getSignatureStatuses([signature], config);
			const response = await plan.send({ abortSignal: AbortSignal.timeout(SIGNATURE_STATUS_TIMEOUT_MS) });
			return response.value[0] ?? null;
		},
		[config, signature, signatureKey],
	);
	const disabled = disabledOption ?? !signatureKey;
	const query = useSolanaRpcQuery<SignatureStatusValue | null>(
		'signatureStatus',
		getSignatureStatusKey({ signature: signatureInput, config }),
		fetcher,
		{
			disabled,
			swr,
		},
	);
	const confirmationStatus = deriveConfirmationStatus(query.data ?? null);
	return {
		...query,
		confirmationStatus,
		signatureStatus: query.data ?? null,
	};
}

export type SignatureWaitStatus = 'error' | 'idle' | 'success' | 'waiting';

export type UseWaitForSignatureOptions = Omit<UseSignatureStatusOptions, 'disabled'> &
	Readonly<{
		commitment?: ConfirmationCommitment;
		disabled?: boolean;
		subscribe?: boolean;
		watchCommitment?: ConfirmationCommitment;
	}>;

type WaitForSignatureState = SignatureStatusState &
	Readonly<{
		isError: boolean;
		isSuccess: boolean;
		isWaiting: boolean;
		waitError: unknown;
		waitStatus: SignatureWaitStatus;
	}>;

/**
 * Poll signature status until the desired commitment (or subscription notification) is reached.
 *
 * @example
 * ```ts
 * const { waitStatus, confirmationStatus } = useWaitForSignature(sig, { commitment: 'finalized' });
 * ```
 */
export function useWaitForSignature(
	signatureInput?: SignatureLike,
	options: UseWaitForSignatureOptions = {},
): WaitForSignatureState {
	const {
		commitment = 'confirmed',
		disabled: disabledOption,
		subscribe = true,
		watchCommitment,
		...signatureStatusOptions
	} = options;
	const { swr, ...restStatusOptions } = signatureStatusOptions;
	const subscribeCommitment = watchCommitment ?? commitment;
	const client = useSolanaClient();
	const normalizedSignature = useMemo(() => normalizeSignature(signatureInput), [signatureInput]);
	const disabled = disabledOption ?? !normalizedSignature;
	const statusQuery = useSignatureStatus(signatureInput, {
		...restStatusOptions,
		swr: {
			refreshInterval: 2_000,
			...swr,
		},
		disabled,
	});
	const [subscriptionSettled, setSubscriptionSettled] = useState(false);

	useEffect(() => {
		if (normalizedSignature === undefined) {
			setSubscriptionSettled(false);
			return;
		}
		setSubscriptionSettled(false);
	}, [normalizedSignature]);

	useEffect(() => {
		if (!normalizedSignature || disabled || !subscribe) {
			return;
		}
		const subscription = client.watchers.watchSignature(
			{
				commitment: subscribeCommitment,
				enableReceivedNotification: true,
				signature: normalizedSignature,
			},
			() => {
				setSubscriptionSettled(true);
			},
		);
		return () => {
			subscription.abort();
		};
	}, [client, disabled, normalizedSignature, subscribe, subscribeCommitment]);

	const hasSignature = Boolean(normalizedSignature) && !disabled;
	const signatureError = statusQuery.signatureStatus?.err ?? null;
	const waitError = statusQuery.error ?? signatureError ?? null;
	const meetsCommitment = confirmationMeetsCommitment(statusQuery.confirmationStatus, commitment);
	const settled = subscriptionSettled || meetsCommitment;

	let waitStatus: SignatureWaitStatus = 'idle';
	if (!hasSignature) {
		waitStatus = 'idle';
	} else if (waitError) {
		waitStatus = 'error';
	} else if (settled) {
		waitStatus = 'success';
	} else {
		waitStatus = 'waiting';
	}

	return {
		...statusQuery,
		isError: waitStatus === 'error',
		isSuccess: waitStatus === 'success',
		isWaiting: waitStatus === 'waiting',
		waitError,
		waitStatus,
	};
}

type UseLookupTableOptions = Readonly<{
	commitment?: Commitment;
	swr?: Omit<SWRConfiguration<AddressLookupTableData, unknown, BareFetcher<AddressLookupTableData>>, 'suspense'>;
}>;

/**
 * Fetch an address lookup table.
 *
 * @example
 * ```ts
 * const { data, isLoading, error } = useLookupTable(lutAddress);
 * ```
 */
export function useLookupTable(
	addressLike?: AddressLike,
	options: UseLookupTableOptions = {},
): SolanaQueryResult<AddressLookupTableData> {
	const addr = useMemo(() => (addressLike ? toAddress(addressLike) : undefined), [addressLike]);
	const key = addr?.toString() ?? null;
	const fetcher = useCallback(
		async (c: SolanaClient) => {
			if (!addr) throw new Error('Address required');
			return c.actions.fetchLookupTable(addr, options.commitment);
		},
		[addr, options.commitment],
	);
	return useSolanaRpcQuery<AddressLookupTableData>('lookupTable', [key, options.commitment], fetcher, {
		disabled: !addr,
		swr: options.swr,
	});
}

type UseNonceAccountOptions = Readonly<{
	commitment?: Commitment;
	swr?: Omit<SWRConfiguration<NonceAccountData, unknown, BareFetcher<NonceAccountData>>, 'suspense'>;
}>;

/**
 * Fetch a nonce account.
 *
 * @example
 * ```ts
 * const { data, isLoading, error } = useNonceAccount(nonceAddress);
 * ```
 */
export function useNonceAccount(
	addressLike?: AddressLike,
	options: UseNonceAccountOptions = {},
): SolanaQueryResult<NonceAccountData> {
	const addr = useMemo(() => (addressLike ? toAddress(addressLike) : undefined), [addressLike]);
	const key = addr?.toString() ?? null;
	const fetcher = useCallback(
		async (c: SolanaClient) => {
			if (!addr) throw new Error('Address required');
			return c.actions.fetchNonceAccount(addr, options.commitment);
		},
		[addr, options.commitment],
	);
	return useSolanaRpcQuery<NonceAccountData>('nonceAccount', [key, options.commitment], fetcher, {
		disabled: !addr,
		swr: options.swr,
	});
}

// Public hook type aliases for consistency
export type UseAccountParameters = Readonly<{ address?: AddressLike; options?: UseAccountOptions }>;
export type UseAccountReturnType = ReturnType<typeof useAccount>;

export type UseBalanceParameters = Readonly<{ address?: AddressLike; options?: UseBalanceOptions }>;
export type UseBalanceReturnType = ReturnType<typeof useBalance>;

export type UseClusterStateParameters = undefined;
export type UseClusterStateReturnType = ReturnType<typeof useClusterState>;

export type UseClusterStatusParameters = undefined;
export type UseClusterStatusReturnType = ReturnType<typeof useClusterStatus>;

export type UseConnectWalletParameters = undefined;
export type UseConnectWalletReturnType = ReturnType<typeof useConnectWallet>;

export type UseDisconnectWalletParameters = undefined;
export type UseDisconnectWalletReturnType = ReturnType<typeof useDisconnectWallet>;

export type UseSendTransactionParameters = undefined;
export type UseSendTransactionReturnType = ReturnType<typeof useSendTransaction>;

export type UseSignatureStatusReturnType = SignatureStatusState;

export type UseWaitForSignatureParameters = Readonly<{
	options?: UseWaitForSignatureOptions;
	signature?: SignatureLike;
}>;

export type UseWaitForSignatureReturnType = WaitForSignatureState;

export type UseSolTransferParameters = undefined;
export type UseSolTransferReturnType = ReturnType<typeof useSolTransfer>;
export type UseSplTokenParameters = Readonly<{ mint: AddressLike; options?: UseSplTokenOptions }>;
export type UseSplTokenReturnType = ReturnType<typeof useSplToken>;

export type UseTransactionPoolParameters = Readonly<{ config?: UseTransactionPoolConfig }>;
export type UseTransactionPoolReturnType = ReturnType<typeof useTransactionPool>;

export type UseWalletParameters = undefined;
export type UseWalletReturnType = ReturnType<typeof useWallet>;

export type UseWalletSessionParameters = undefined;
export type UseWalletSessionReturnType = ReturnType<typeof useWalletSession>;

export type UseWalletActionsParameters = undefined;
export type UseWalletActionsReturnType = ReturnType<typeof useWalletActions>;

export type UseLookupTableParameters = Readonly<{ address?: AddressLike; options?: UseLookupTableOptions }>;
export type UseLookupTableReturnType = ReturnType<typeof useLookupTable>;

export type UseNonceAccountParameters = Readonly<{ address?: AddressLike; options?: UseNonceAccountOptions }>;
export type UseNonceAccountReturnType = ReturnType<typeof useNonceAccount>;
