import type {
	StakeHelper,
	StakePrepareConfig,
	StakeSendOptions,
	UnstakePrepareConfig,
	UnstakeSendOptions,
} from '../features/stake';
import { type AsyncState, createAsyncState, createInitialAsyncState } from '../state/asyncState';

type StakeSignature = Awaited<ReturnType<StakeHelper['sendStake']>>;
type UnstakeSignature = Awaited<ReturnType<StakeHelper['sendUnstake']>>;

type Listener = () => void;

export type StakeControllerConfig = Readonly<{
	authorityProvider?: () => StakePrepareConfig['authority'] | undefined;
	helper: StakeHelper;
}>;

export type StakeInput = Omit<StakePrepareConfig, 'authority'> & {
	authority?: StakePrepareConfig['authority'];
};

export type UnstakeInput = Omit<UnstakePrepareConfig, 'authority'> & {
	authority?: UnstakePrepareConfig['authority'];
};

export type StakeController = Readonly<{
	getHelper(): StakeHelper;
	getState(): AsyncState<StakeSignature>;
	getUnstakeState(): AsyncState<UnstakeSignature>;
	reset(): void;
	resetUnstake(): void;
	stake(config: StakeInput, options?: StakeSendOptions): Promise<StakeSignature>;
	unstake(config: UnstakeInput, options?: UnstakeSendOptions): Promise<UnstakeSignature>;
	subscribe(listener: Listener): () => void;
	subscribeUnstake(listener: Listener): () => void;
}>;

function ensureAuthority(
	input: StakeInput,
	resolveDefault?: () => StakePrepareConfig['authority'] | undefined,
): StakePrepareConfig {
	const authority = input.authority ?? resolveDefault?.();
	if (!authority) {
		throw new Error('Connect a wallet or supply an `authority` before staking SOL.');
	}
	return {
		...input,
		authority,
	};
}

function ensureUnstakeAuthority(
	input: UnstakeInput,
	resolveDefault?: () => UnstakePrepareConfig['authority'] | undefined,
): UnstakePrepareConfig {
	const authority = input.authority ?? resolveDefault?.();
	if (!authority) {
		throw new Error('Connect a wallet or supply an `authority` before unstaking SOL.');
	}
	return {
		...input,
		authority,
	};
}

export function createStakeController(config: StakeControllerConfig): StakeController {
	const listeners = new Set<Listener>();
	const unstakeListeners = new Set<Listener>();
	const helper = config.helper;
	const authorityProvider = config.authorityProvider;
	let state: AsyncState<StakeSignature> = createInitialAsyncState<StakeSignature>();
	let unstakeState: AsyncState<UnstakeSignature> = createInitialAsyncState<UnstakeSignature>();

	function notify() {
		for (const listener of listeners) {
			listener();
		}
	}

	function notifyUnstake() {
		for (const listener of unstakeListeners) {
			listener();
		}
	}

	function setState(next: AsyncState<StakeSignature>) {
		state = next;
		notify();
	}

	function setUnstakeState(next: AsyncState<UnstakeSignature>) {
		unstakeState = next;
		notifyUnstake();
	}

	async function stake(config: StakeInput, options?: StakeSendOptions): Promise<StakeSignature> {
		const request = ensureAuthority(config, authorityProvider);
		setState(createAsyncState<StakeSignature>('loading'));
		try {
			const signature = await helper.sendStake(request, options);
			setState(createAsyncState<StakeSignature>('success', { data: signature }));
			return signature;
		} catch (error) {
			setState(createAsyncState<StakeSignature>('error', { error }));
			throw error;
		}
	}

	async function unstake(config: UnstakeInput, options?: UnstakeSendOptions): Promise<UnstakeSignature> {
		const request = ensureUnstakeAuthority(config, authorityProvider);
		setUnstakeState(createAsyncState<UnstakeSignature>('loading'));
		try {
			const signature = await helper.sendUnstake(request, options);
			setUnstakeState(createAsyncState<UnstakeSignature>('success', { data: signature }));
			return signature;
		} catch (error) {
			setUnstakeState(createAsyncState<UnstakeSignature>('error', { error }));
			throw error;
		}
	}

	function subscribe(listener: Listener): () => void {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}

	function subscribeUnstake(listener: Listener): () => void {
		unstakeListeners.add(listener);
		return () => {
			unstakeListeners.delete(listener);
		};
	}

	function reset() {
		setState(createInitialAsyncState<StakeSignature>());
	}

	function resetUnstake() {
		setUnstakeState(createInitialAsyncState<UnstakeSignature>());
	}

	return {
		getHelper: () => helper,
		getState: () => state,
		getUnstakeState: () => unstakeState,
		reset,
		resetUnstake,
		stake,
		unstake,
		subscribe,
		subscribeUnstake,
	};
}
