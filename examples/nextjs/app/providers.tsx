'use client';

import type { SolanaClientConfig } from '@solana/client';
import { SolanaProvider } from '@solana/react-hooks';
import type { PropsWithChildren } from 'react';

const defaultConfig: SolanaClientConfig = {
	cluster: 'devnet',
	rpc: 'https://api.devnet.solana.com',
	websocket: 'wss://api.devnet.solana.com',
};

function Providers({ children }: PropsWithChildren) {
	return <SolanaProvider config={defaultConfig}>{children}</SolanaProvider>;
}

export default Providers;
