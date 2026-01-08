import { Background } from '@/components/landing/background';
import { Features } from '@/components/landing/features';
import { Footer } from '@/components/landing/footer';
import { Hero } from '@/components/landing/hero';

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen relative">
			<Background />
			<main className="flex-1 relative z-10 w-full">
				<Hero />
				<Features />
			</main>
			<Footer className="relative z-10" />
		</div>
	);
}
