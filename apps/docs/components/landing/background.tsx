'use client';

import { motion } from 'framer-motion';

export function Background() {
	return (
		<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
			{/* Global background color */}
			<div className="absolute inset-0 bg-background transition-colors duration-300" />

			{/* Animated Grid */}
			<div className="absolute inset-0 bg-grid-dark opacity-[0.03] dark:opacity-[0.05]" />

			{/* Top Glow "Spotlight" - Fills the empty top space */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-normal pointer-events-none" />

			{/* Animated Gradient Blobs */}
			<div className="absolute top-0 left-0 w-full h-full opacity-60 dark:opacity-40">
				<motion.div
					animate={{
						y: [0, -40, 0],
						x: [0, 20, 0],
						opacity: [0.3, 0.5, 0.3],
						scale: [1, 1.1, 1],
					}}
					transition={{
						duration: 15,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
					className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-purple/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"
				/>

				<motion.div
					animate={{
						y: [0, 50, 0],
						x: [0, -30, 0],
						opacity: [0.3, 0.5, 0.3],
						scale: [1, 1.2, 1],
					}}
					transition={{
						duration: 18,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 2,
					}}
					className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-accent-blue/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
				/>

				<motion.div
					animate={{
						y: [0, -60, 0],
						x: [0, 40, 0],
						opacity: [0.2, 0.4, 0.2],
						scale: [1, 1.3, 1],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 5,
					}}
					className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-accent-gold/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen"
				/>
			</div>

			{/* Gradient Overlay for bottom fade */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
		</div>
	);
}
