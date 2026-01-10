import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Provider } from './provider';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Framework Kit - Developer Tools for Solana',
	description:
		'A family of libraries built on Solana Kit. Universal client, React hooks, and migration tools for building production-ready Solana apps.',
	openGraph: {
		title: 'Framework Kit - Developer Tools for Solana',
		description:
			'A family of libraries built on Solana Kit. Universal client, React hooks, and migration tools for building production-ready Solana apps.',
		images: ['/api/og'],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Framework Kit - Developer Tools for Solana',
		description:
			'A family of libraries built on Solana Kit. Universal client, React hooks, and migration tools for building production-ready Solana apps.',
		images: ['/api/og'],
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={jakarta.className}>
				<Provider>{children}</Provider>
				<Analytics />
			</body>
		</html>
	);
}
