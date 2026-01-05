import type { SolTransferSendOptions } from '../features/sol';
import type { WsolHelper, WsolUnwrapPrepareConfig, WsolWrapPrepareConfig } from '../features/wsol';
import { type AsyncState, createAsyncState, createInitialAsyncState } from '../state/asyncState';

type WsolWrapSignature = Awaited<ReturnType<WsolHelper['sendWrap']>>;
type WsolUnwrapSignature = Awaited<ReturnType<WsolHelper['sendUnwrap']>>;

type Listener = () => void;

export type WsolControllerConfig = Readonly<{
	authorityProvider?: () => WsolWrapPrepareConfig['authority'] | undefined;
	helper: WsolHelper;
}>;

export type WsolWrapInput = Omit<WsolWrapPrepareConfig, 'authority'> & {
	authority?: WsolWrapPrepareConfig['authority'];
};

export type WsolUnwrapInput = Omit<WsolUnwrapPrepareConfig, 'authority'> & {
	authority?: WsolUnwrapPrepareConfig['authority'];
};

export type WsolController = Readonly<{
	getHelper(): WsolHelper;
	getWrapState(): AsyncState<WsolWrapSignature>;
	getUnwrapState(): AsyncState<WsolUnwrapSignature>;
	resetWrap(): void;
	resetUnwrap(): void;
	wrap(config: WsolWrapInput, options?: SolTransferSendOptions): Promise<WsolWrapSignature>;
	unwrap(config: WsolUnwrapInput, options?: SolTransferSendOptions): Promise<WsolUnwrapSignature>;
	subscribeWrap(listener: Listener): () => void;
	subscribeUnwrap(listener: Listener): () => void;
}>;

function ensureAuthority<T extends WsolWrapInput | WsolUnwrapInput>(
	input: T,
	resolveDefault?: () => WsolWrapPrepareConfig['authority'] | undefined,
): T & { authority: WsolWrapPrepareConfig['authority'] } {
	const authority = input.authority ?? resolveDefault?.();
	if (!authority) {
		throw new Error('Connect a wallet or supply an `authority` before wrapping/unwrapping SOL.');
	}
	return {
		...input,
		authority,
	};
}

export function createWsolController(config: WsolControllerConfig): WsolController {
	const wrapListeners = new Set<Listener>();
	const unwrapListeners = new Set<Listener>();
	const helper = config.helper;
	const authorityProvider = config.authorityProvider;
	let wrapState: AsyncState<WsolWrapSignature> = createInitialAsyncState<WsolWrapSignature>();
	let unwrapState: AsyncState<WsolUnwrapSignature> = createInitialAsyncState<WsolUnwrapSignature>();

	function notifyWrap() {
		for (const listener of wrapListeners) {
			listener();
		}
	}

	function notifyUnwrap() {
		for (const listener of unwrapListeners) {
			listener();
		}
	}

	function setWrapState(next: AsyncState<WsolWrapSignature>) {
		wrapState = next;
		notifyWrap();
	}

	function setUnwrapState(next: AsyncState<WsolUnwrapSignature>) {
		unwrapState = next;
		notifyUnwrap();
	}

	async function wrap(input: WsolWrapInput, options?: SolTransferSendOptions): Promise<WsolWrapSignature> {
		const request = ensureAuthority(input, authorityProvider);
		setWrapState(createAsyncState<WsolWrapSignature>('loading'));
		try {
			const signature = await helper.sendWrap(request, options);
			setWrapState(createAsyncState<WsolWrapSignature>('success', { data: signature }));
			return signature;
		} catch (error) {
			setWrapState(createAsyncState<WsolWrapSignature>('error', { error }));
			throw error;
		}
	}

	async function unwrap(input: WsolUnwrapInput, options?: SolTransferSendOptions): Promise<WsolUnwrapSignature> {
		const request = ensureAuthority(input, authorityProvider);
		setUnwrapState(createAsyncState<WsolUnwrapSignature>('loading'));
		try {
			const signature = await helper.sendUnwrap(request, options);
			setUnwrapState(createAsyncState<WsolUnwrapSignature>('success', { data: signature }));
			return signature;
		} catch (error) {
			setUnwrapState(createAsyncState<WsolUnwrapSignature>('error', { error }));
			throw error;
		}
	}

	function subscribeWrap(listener: Listener): () => void {
		wrapListeners.add(listener);
		return () => {
			wrapListeners.delete(listener);
		};
	}

	function subscribeUnwrap(listener: Listener): () => void {
		unwrapListeners.add(listener);
		return () => {
			unwrapListeners.delete(listener);
		};
	}

	function resetWrap() {
		setWrapState(createInitialAsyncState<WsolWrapSignature>());
	}

	function resetUnwrap() {
		setUnwrapState(createInitialAsyncState<WsolUnwrapSignature>());
	}

	return {
		getHelper: () => helper,
		getWrapState: () => wrapState,
		getUnwrapState: () => unwrapState,
		resetWrap,
		resetUnwrap,
		wrap,
		unwrap,
		subscribeWrap,
		subscribeUnwrap,
	};
}
