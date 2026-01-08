// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<
	typeof Config,
	import('fumadocs-mdx/runtime/types').InternalTypeConfig & {
		DocData: Record<string, never>;
	}
>();
const browserCollections = {
	docs: create.doc('docs', {
		'api-reference.mdx': () => import('../content/docs/api-reference.mdx?collection=docs'),
		'client.mdx': () => import('../content/docs/client.mdx?collection=docs'),
		'getting-started.mdx': () => import('../content/docs/getting-started.mdx?collection=docs'),
		'index.mdx': () => import('../content/docs/index.mdx?collection=docs'),
		'react-hooks.mdx': () => import('../content/docs/react-hooks.mdx?collection=docs'),
		'web3-compat.mdx': () => import('../content/docs/web3-compat.mdx?collection=docs'),
	}),
};
export default browserCollections;
