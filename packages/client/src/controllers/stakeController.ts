import type { StakeHelper, StakePrepareConfig, StakeSendOptions } from '../features/stake';
import { type AsyncState, createAsyncState, createInitialAsyncState } from '../state/asyncState';

type StakeSignature = Awaited<ReturnType<StakeHelper['sendStake']>>;

type Listener = () => void;

export type StakeControllerConfig = Readonly<{
	authorityProvider?: () => StakePrepareConfig['authority'] | undefined;
	helper: StakeHelper;
}>;

export type StakeInput = Omit<StakePrepareConfig, 'authority'> & {
	authority?: StakePrepareConfig['authority'];
};

export type StakeController = Readonly<{
	getHelper(): StakeHelper;
	getState(): AsyncState<StakeSignature>;
	reset(): void;
	stake(config: StakeInput, options?: StakeSendOptions): Promise<StakeSignature>;
	subscribe(listener: Listener): () => void;
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

export function createStakeController(config: StakeControllerConfig): StakeController {
	const listeners = new Set<Listener>();
	const helper = config.helper;
	const authorityProvider = config.authorityProvider;
	let state: AsyncState<StakeSignature> = createInitialAsyncState<StakeSignature>();

	function notify() {
		for (const listener of listeners) {
			listener();
		}
	}

	function setState(next: AsyncState<StakeSignature>) {
		state = next;
		notify();
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

	function subscribe(listener: Listener): () => void {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}

	function reset() {
		setState(createInitialAsyncState<StakeSignature>());
	}

	return {
		getHelper: () => helper,
		getState: () => state,
		reset,
		stake,
		subscribe,
	};
}
