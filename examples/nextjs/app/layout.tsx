import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
	title: 'Solana React Hooks • Next.js example',
	description: 'Minimal Next.js app using @solana/react-hooks and @solana/client.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
