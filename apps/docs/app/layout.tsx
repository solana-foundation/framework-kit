import { Analytics } from '@vercel/analytics/next';
import { Banner } from 'fumadocs-ui/components/banner';
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
				<Banner>
					<span>
						Framework Kit is no longer maintained. Use{' '}
						<a className="underline" href="https://www.solanakit.com">
							Solana Kit
						</a>{' '}
						and{' '}
						<a className="underline" href="https://github.com/anza-xyz/kit-plugins">
							Kit plugins
						</a>{' '}
						instead.
					</span>
				</Banner>
				<Provider>{children}</Provider>
				<Analytics />
			</body>
		</html>
	);
}
