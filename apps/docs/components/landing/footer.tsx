'use client';

import { motion } from 'framer-motion';
import { Github, Twitter } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export function Footer({ className }: { className?: string }) {
	return (
		<motion.footer
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			viewport={{ once: true }}
			className={cn(
				'border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-sm mt-auto',
				className,
			)}
		>
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
					<div className="col-span-2">
						<h3 className="font-bold text-xl mb-4">Framework Kit</h3>
						<p className="text-muted-foreground max-w-xs">
							The ultimate foundation for building Solana applications. Open source and community driven.
						</p>
					</div>

					<div>
						<h4 className="font-semibold mb-4 text-sm">Resources</h4>
						<ul className="space-y-3 text-sm text-muted-foreground">
							<li>
								<Link href="/docs" className="hover:text-primary transition-colors">
									Documentation
								</Link>
							</li>
							<li>
								<Link
									href="https://solana.com/developers/guides"
									className="hover:text-primary transition-colors"
								>
									Guides
								</Link>
							</li>
							<li>
								<Link
									href="https://solana.com/developers/templates"
									className="hover:text-primary transition-colors"
								>
									Templates
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-4 text-sm">Community</h4>
						<ul className="space-y-3 text-sm text-muted-foreground">
							<li>
								<Link
									href="https://github.com/solana-foundation/framework-kit"
									className="hover:text-primary transition-colors"
								>
									GitHub
								</Link>
							</li>
							<li>
								<Link href="https://discord.gg/solana" className="hover:text-primary transition-colors">
									Discord
								</Link>
							</li>
							<li>
								<Link
									href="https://twitter.com/solana"
									className="hover:text-primary transition-colors"
								>
									Twitter
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-black/5 dark:border-white/5">
					<p className="text-sm text-muted-foreground">
						© {new Date().getFullYear()} Solana Foundation. All rights reserved.
					</p>

					<div className="flex items-center gap-4 mt-4 md:mt-0">
						<Link
							href="https://github.com/solana-foundation/framework-kit"
							className="text-muted-foreground hover:text-foreground transition-colors p-2"
						>
							<Github className="w-5 h-5" />
						</Link>
						<Link
							href="https://twitter.com/solana"
							className="text-muted-foreground hover:text-foreground transition-colors p-2"
						>
							<Twitter className="w-5 h-5" />
						</Link>
					</div>
				</div>
			</div>
		</motion.footer>
	);
}
