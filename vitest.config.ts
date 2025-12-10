import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const workspaceRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	root: workspaceRoot,
	test: {
		globals: true,
		environment: 'node',
		environmentMatchGlobs: [
			['packages/react-hooks/**', 'jsdom'],
			['examples/**', 'jsdom'],
		],
		include: ['{packages,examples,tests}/**/*.{test,spec}.{ts,tsx}'],
		setupFiles: './vitest.setup.ts',
		passWithNoTests: true,
		coverage: {
			reporter: ['text', 'lcov'],
			reportsDirectory: './coverage',
			include: ['packages/**/*.{ts,tsx}', 'examples/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
		},
	},
	resolve: {
		alias: {
			'@solana/client': resolve(workspaceRoot, 'packages/client/src/index.ts'),
			'@solana/web3-compat': resolve(workspaceRoot, 'packages/web3-compat/src/index.ts'),
		},
	},
});
