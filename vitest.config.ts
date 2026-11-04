import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
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
		projects: [
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(dirname, '.storybook'),
					}),
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: 'chromium',
							},
						],
					},
					setupFiles: ['packages/components/.storybook/vitest.setup.ts'],
				},
			},
		],
	},
	resolve: {
		alias: {
			'@solana/client': resolve(workspaceRoot, 'packages/client/src/index.ts'),
			'@solana/web3-compat': resolve(workspaceRoot, 'packages/web3-compat/src/index.ts'),
		},
	},
});
