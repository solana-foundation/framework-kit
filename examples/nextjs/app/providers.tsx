'use client';

import type { SolanaClientConfig } from '@solana/client';
import { SolanaProvider } from '@solana/react-hooks';
import type { PropsWithChildren } from 'react';

const defaultConfig: SolanaClientConfig = {
	cluster: 'devnet',
};

function Providers({ children }: PropsWithChildren) {
	return <SolanaProvider config={defaultConfig}>{children}</SolanaProvider>;
}

export default Providers;
