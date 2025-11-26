import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{
				find: '@solana/client-poc',
				replacement: '@solana/client',
			},
			{
				find: '@solana/client',
				replacement: path.resolve(__dirname, '../../packages/client/src'),
			},
			{
				find: '@solana/client/',
				replacement: `${path.resolve(__dirname, '../../packages/client/src')}/`,
			},
			{
				find: '@solana/react-hooks',
				replacement: path.resolve(__dirname, '../../packages/react-hooks/src'),
			},
		],
	},
	optimizeDeps: {
		include: ['@solana/client', '@solana/react-hooks'],
	},
	server: {
		host: '0.0.0.0',
		port: 5174,
	},
});
