import { basename } from 'node:path';
import { defineConfig } from 'tsup';

const packageDirName = basename(process.cwd());
const external: string[] = [];
const tsconfigPath = packageDirName === 'react-hooks' ? 'tsconfig.bundle.json' : 'tsconfig.json';

if (packageDirName === 'react-hooks') {
	external.push('@solana/client');
}

const baseEntry = ['src/index.ts'];
const nodeEntry = packageDirName === 'client' ? [...baseEntry, 'src/server/index.ts'] : baseEntry;

// Base config
const common = {
	clean: true,
	dts: false,
	keepNames: true,
	shims: false,
	skipNodeModulesBundle: true,
	target: 'es2022',
	treeshake: true,
	tsconfig: tsconfigPath,
	external,
};

// Node config - NO minification for debugging
const nodeConfig = {
	...common,
	minify: false,
	sourcemap: true,
	splitting: false,
};

// Browser/Native config - WITH minification
const productionConfig = {
	...common,
	minify: true,
	sourcemap: 'external',
	splitting: false,
};

export default defineConfig([
	// Node.js - ESM ONLY, unminified
	{
		...nodeConfig,
		entry: nodeEntry,
		format: ['esm'],
		outDir: 'dist',
		outExtension() {
			return { js: '.node.mjs' };
		},
		platform: 'node',
	},
	// Browser - ESM ONLY, minified
	{
		...productionConfig,
		entry: baseEntry,
		format: ['esm'],
		outDir: 'dist',
		outExtension() {
			return { js: '.browser.mjs' };
		},
		platform: 'browser',
	},
	// React Native - ESM ONLY, minified
	{
		...productionConfig,
		entry: baseEntry,
		format: ['esm'],
		outDir: 'dist',
		outExtension() {
			return { js: '.native.mjs' };
		},
		platform: 'neutral',
	},
]);
