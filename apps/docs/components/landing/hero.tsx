'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Copy } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function Hero() {
	const [copied, setCopied] = useState(false);

	const onCopy = () => {
		navigator.clipboard.writeText('npm install @solana/client');
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
			<div className="container relative z-10 mx-auto px-4 text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Link
						href="/docs/getting-started"
						className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20 hover:bg-primary/20 transition-colors"
					>
						<span>V1 is now available</span>
						<ArrowRight className="w-4 h-4" />
					</Link>
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="text-5xl lg:text-7xl font-bold tracking-tight mb-6"
				>
					The Ultimate Foundation for <span className="text-gradient">Solana Development</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
				>
					A comprehensive framework built on top of @solana/kit. Everything you need to build production-ready
					dApps with speed and confidence.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="flex flex-col sm:flex-row items-center justify-center gap-4"
				>
					<Link
						href="/docs"
						className="group relative px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 text-lg flex items-center gap-2 overflow-hidden"
					>
						<span className="relative z-10 flex items-center gap-2">
							Get Started
							<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
						</span>
						<div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
					</Link>
					<Link
						href="https://github.com/solana-foundation/framework-kit"
						target="_blank"
						className="px-8 py-4 rounded-full glass hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 font-semibold transition-all text-lg"
					>
						View on GitHub
					</Link>
				</motion.div>

				{/* Code Preview */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.4, type: 'spring' }}
					className="mt-20 relative mx-auto max-w-4xl"
				>
					<div className="relative rounded-xl bg-[#1e1e1e]/90 backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden text-left font-mono text-sm leading-relaxed sm:text-base">
						{/* Editor Header */}
						<div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
								<div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
								<div className="w-3 h-3 rounded-full bg-[#27c93f]" />
							</div>
							<div className="text-xs text-white/40 font-sans select-none">examples/starter.ts</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={onCopy}
									className="text-white/40 hover:text-white transition-colors"
								>
									{copied ? (
										<Check className="w-4 h-4 text-green-400" />
									) : (
										<Copy className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>

						{/* Code Content */}
						<div className="p-6 md:p-8 overflow-x-auto">
							<pre className="text-[#e0e0e0]">
								<code>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">1</span>
										<span className="table-cell">
											<span className="text-[#c792ea]">import</span>{' '}
											<span className="text-[#ffd700]">{`{`}</span>{' '}
											<span className="text-[#82aaff]">createClient</span>
											<span className="text-[#89ddff]">,</span>{' '}
											<span className="text-[#82aaff]">autoDiscover</span>{' '}
											<span className="text-[#ffd700]">{`}`}</span>{' '}
											<span className="text-[#c792ea]">from</span>{' '}
											<span className="text-[#c3e88d]">&quot;@solana/client&quot;</span>
											<span className="text-[#89ddff]">:</span>
										</span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">2</span>
										<span className="table-cell"></span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">3</span>
										<span className="table-cell">
											<span className="text-[#546e7a] italic">
												{'// Initialize with zero config'}
											</span>
										</span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">4</span>
										<span className="table-cell">
											<span className="text-[#c792ea]">const</span>{' '}
											<span className="text-[#ffcb6b]">client</span>{' '}
											<span className="text-[#89ddff]">=</span>{' '}
											<span className="text-[#82aaff]">createClient</span>
											<span className="text-[#ffd700]">(</span>
											<span className="text-[#ffd700]">{`{`}</span>
										</span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">5</span>
										<span className="table-cell">
											{' '}
											<span className="text-[#f07178]">cluster</span>
											<span className="text-[#89ddff]">:</span>{' '}
											<span className="text-[#c3e88d]">&quot;devnet&quot;</span>
											<span className="text-[#89ddff]">,</span>
										</span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">6</span>
										<span className="table-cell">
											{' '}
											<span className="text-[#f07178]">walletConnectors</span>
											<span className="text-[#89ddff]">:</span>{' '}
											<span className="text-[#82aaff]">autoDiscover</span>
											<span className="text-[#ffd700]">()</span>
											<span className="text-[#89ddff]">,</span>
										</span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">7</span>
										<span className="table-cell">
											<span className="text-[#ffd700]">{`}`}</span>
											<span className="text-[#ffd700]">)</span>
											<span className="text-[#89ddff]">:</span>
										</span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">8</span>
										<span className="table-cell"></span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">9</span>
										<span className="table-cell">
											<span className="text-[#546e7a] italic">{'// Connect and interact'}</span>
										</span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">10</span>
										<span className="table-cell">
											<span className="text-[#c792ea]">await</span>{' '}
											<span className="text-[#ffcb6b]">client</span>
											<span className="text-[#89ddff]">.</span>
											<span className="text-[#f07178]">actions</span>
											<span className="text-[#89ddff]">.</span>
											<span className="text-[#82aaff]">connectWallet</span>
											<span className="text-[#ffd700]">()</span>
											<span className="text-[#89ddff]">:</span>
										</span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">11</span>
										<span className="table-cell">
											<span className="text-[#c792ea]">const</span>{' '}
											<span className="text-[#ffcb6b]">balance</span>{' '}
											<span className="text-[#89ddff]">=</span>{' '}
											<span className="text-[#c792ea]">await</span>{' '}
											<span className="text-[#ffcb6b]">client</span>
											<span className="text-[#89ddff]">.</span>
											<span className="text-[#f07178]">actions</span>
											<span className="text-[#89ddff]">.</span>
											<span className="text-[#82aaff]">fetchBalance</span>
											<span className="text-[#ffd700]">()</span>
											<span className="text-[#89ddff]">:</span>
										</span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">12</span>
										<span className="table-cell"></span>
									</div>
									<div className="table-row">
										<span className="table-cell select-none text-white/20 text-right pr-6">13</span>
										<span className="table-cell">
											<span className="text-[#82aaff]">console</span>
											<span className="text-[#89ddff]">.</span>
											<span className="text-[#82aaff]">log</span>
											<span className="text-[#ffd700]">(</span>
											<span className="text-[#89ddff]">\`</span>
											<span className="text-[#c3e88d]">Ready to build!</span>
											<span className="text-[#89ddff]">\`</span>
											<span className="text-[#ffd700]">)</span>
											<span className="text-[#89ddff]">:</span>
										</span>
									</div>
								</code>
							</pre>
						</div>

						{/* Glow effect */}
						<div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-purple/20 rounded-full blur-[80px] pointer-events-none" />
						<div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-blue/10 rounded-full blur-[80px] pointer-events-none" />
					</div>
				</motion.div>
			</div>
		</section>
	);
}
