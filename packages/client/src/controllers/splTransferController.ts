import type { SolTransferSendOptions } from '../features/sol';
import type { SplTokenHelper, SplTransferPrepareConfig } from '../features/spl';
import { type AsyncState, createAsyncState, createInitialAsyncState } from '../state/asyncState';

type SplTransferSignature = Awaited<ReturnType<SplTokenHelper['sendTransfer']>>;

type Listener = () => void;

export type SplTransferInput = Omit<SplTransferPrepareConfig, 'authority' | 'sourceOwner'> & {
	authority?: SplTransferPrepareConfig['authority'];
	sourceOwner?: SplTransferPrepareConfig['sourceOwner'];
};

export type SplTransferControllerConfig = Readonly<{
	authorityProvider?: () => SplTransferPrepareConfig['authority'] | undefined;
	helper: SplTokenHelper;
	sourceOwnerProvider?: () => SplTransferPrepareConfig['sourceOwner'] | undefined;
}>;

export type SplTransferController = Readonly<{
	getHelper(): SplTokenHelper;
	getState(): AsyncState<SplTransferSignature>;
	reset(): void;
	send(config: SplTransferInput, options?: SolTransferSendOptions): Promise<SplTransferSignature>;
	subscribe(listener: Listener): () => void;
}>;

function ensureTransferConfig(
	input: SplTransferInput,
	resolveAuthority?: () => SplTransferPrepareConfig['authority'] | undefined,
	resolveSourceOwner?: () => SplTransferPrepareConfig['sourceOwner'] | undefined,
): SplTransferPrepareConfig {
	const authority = input.authority ?? resolveAuthority?.();
	if (!authority) {
		throw new Error('Connect a wallet or supply an `authority` before sending SPL tokens.');
	}
	const sourceOwner = input.sourceOwner ?? resolveSourceOwner?.();
	if (!sourceOwner) {
		throw new Error('Unable to resolve a source owner for the SPL token transfer.');
	}
	return {
		...input,
		authority,
		sourceOwner,
	};
}

export function createSplTransferController(config: SplTransferControllerConfig): SplTransferController {
	const helper = config.helper;
	const authorityProvider = config.authorityProvider;
	const sourceOwnerProvider = config.sourceOwnerProvider;
	const listeners = new Set<Listener>();
	let state: AsyncState<SplTransferSignature> = createInitialAsyncState<SplTransferSignature>();

	function notify() {
		for (const listener of listeners) {
			listener();
		}
	}

	function setState(next: AsyncState<SplTransferSignature>) {
		state = next;
		notify();
	}

	async function send(config: SplTransferInput, options?: SolTransferSendOptions): Promise<SplTransferSignature> {
		const resolvedConfig = ensureTransferConfig(
			config,
			config.authority ? undefined : authorityProvider,
			config.sourceOwner ? undefined : sourceOwnerProvider,
		);
		setState(createAsyncState<SplTransferSignature>('loading'));
		try {
			const signature = await helper.sendTransfer(resolvedConfig, options);
			setState(createAsyncState<SplTransferSignature>('success', { data: signature }));
			return signature;
		} catch (error) {
			setState(createAsyncState<SplTransferSignature>('error', { error }));
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
		setState(createInitialAsyncState<SplTransferSignature>());
	}

	return {
		getHelper: () => helper,
		getState: () => state,
		reset,
		send,
		subscribe,
	};
}
