// @ts-nocheck

import { server } from 'fumadocs-mdx/runtime/server';
import * as __fd_glob_0 from '../content/docs/api-reference.mdx?collection=docs';
import * as __fd_glob_1 from '../content/docs/client.mdx?collection=docs';
import * as __fd_glob_2 from '../content/docs/getting-started.mdx?collection=docs';
import * as __fd_glob_3 from '../content/docs/index.mdx?collection=docs';
import { default as __fd_glob_6 } from '../content/docs/meta.json?collection=meta';
import * as __fd_glob_4 from '../content/docs/react-hooks.mdx?collection=docs';
import * as __fd_glob_5 from '../content/docs/web3-compat.mdx?collection=docs';
import type * as Config from '../source.config';

const create = server<
	typeof Config,
	import('fumadocs-mdx/runtime/types').InternalTypeConfig & {
		DocData: Record<string, never>;
	}
>({ doc: { passthroughs: ['extractedReferences'] } });

export const docs = await create.doc('docs', 'content/docs', {
	'api-reference.mdx': __fd_glob_0,
	'client.mdx': __fd_glob_1,
	'getting-started.mdx': __fd_glob_2,
	'index.mdx': __fd_glob_3,
	'react-hooks.mdx': __fd_glob_4,
	'web3-compat.mdx': __fd_glob_5,
});

export const meta = await create.meta('meta', 'content/docs', { 'meta.json': __fd_glob_6 });
