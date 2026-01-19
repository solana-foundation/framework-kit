import type { ApplyPlugins, Plugin, SolanaClient } from '../types';

/**
 * Applies a chain of plugins to a client, returning a new extended client.
 * Each plugin receives the current accumulated client and returns an extended version.
 * Plugins can be sync or async; all are awaited in sequence.
 *
 * @param client - The base client to extend
 * @param plugins - Array of plugin functions to apply in order
 * @returns A new frozen client with all plugin extensions applied
 *
 * @example
 * ```ts
 * const extended = await applyPlugins(baseClient, [
 *   payer(signer),
 *   airdrop(),
 * ]);
 * ```
 */
export async function applyPlugins<
	TClient extends SolanaClient,
	const TPlugins extends readonly Plugin<TClient, object | Promise<object>>[],
>(client: TClient, plugins: TPlugins): Promise<ApplyPlugins<TClient, TPlugins>> {
	let current: unknown = client;

	for (const plugin of plugins) {
		const result = (plugin as Plugin<object, object | Promise<object>>)(current as object);
		current = result instanceof Promise ? await result : result;
	}

	// Add registerPlugins to the result so it can be chained
	const extended = {
		...(current as object),
		registerPlugins: <const TNextPlugins extends readonly Plugin<SolanaClient, object | Promise<object>>[]>(
			morePlugins: TNextPlugins,
		) => applyPlugins(current as SolanaClient, morePlugins),
	};

	return Object.freeze(extended) as ApplyPlugins<TClient, TPlugins>;
}
