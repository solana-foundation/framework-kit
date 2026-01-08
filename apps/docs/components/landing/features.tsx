import { Box, Code2, Shield, Terminal, Wallet, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
	{
		title: 'Wallet Management',
		description:
			'Unified wallet state management with auto-discovery for Wallet Standard. Build custom connection UIs with ease.',
		icon: Wallet,
		className: 'lg:col-span-2',
	},
	{
		title: 'Reactive Hooks',
		description:
			'Powerful React hooks for every Solana need. From balance watching to transaction simulation, keep your UI in sync effortlessly.',
		icon: Box,
	},
	{
		title: 'Program Interaction',
		description:
			'Type-safe helpers for common Token and System program operations. Interacting with on-chain programs has never been simpler.',
		icon: Code2,
	},
	{
		title: 'Universal Client',
		description:
			'Framework-agnostic core client that works in any runtime—Next.js, Vite, generic workers, or Node.js.',
		icon: Terminal,
		className: 'lg:col-span-2',
	},
	{
		title: 'Performance',
		description:
			'Optimized for speed with zero-runtime overhead where possible. Efficient state management via Zustand.',
		icon: Zap,
	},
	{
		title: 'Security',
		description:
			'Built with security best practices, utilizing modern standards like the Wallet Standard protocol.',
		icon: Shield,
	},
];

function FeatureCard({ feature }: { feature: (typeof features)[0] }) {
	return (
		<div
			className={cn(
				'group relative p-8 rounded-3xl bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/5 hover:shadow-lg transition-shadow duration-300',
				feature.className,
			)}
		>
			<div className="relative z-10">
				<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
					<feature.icon className="w-6 h-6" />
				</div>

				<h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
				<p className="text-muted-foreground leading-relaxed">{feature.description}</p>
			</div>
		</div>
	);
}

export function Features() {
	return (
		<section className="py-24 relative overflow-hidden">
			<div className="container mx-auto px-4">
				<div className="text-center max-w-2xl mx-auto mb-16">
					<h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to build</h2>
					<p className="text-muted-foreground text-lg">
						A complete toolkit for Solana developers. Stop reinventing the wheel and start shipping.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature) => (
						<FeatureCard key={feature.title} feature={feature} />
					))}
				</div>
			</div>
		</section>
	);
}
