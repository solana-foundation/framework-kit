import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const title = searchParams.get('title') ?? 'Framework Kit';
	const description = searchParams.get('description') ?? 'The Ultimate Foundation for Solana Development';

	// Fetch the background image
	const backgroundImageUrl = new URL('/og-background.png', request.url);
	const backgroundImageData = await fetch(backgroundImageUrl).then((res) => res.arrayBuffer());
	const backgroundImageBase64 = `data:image/png;base64,${Buffer.from(backgroundImageData).toString('base64')}`;

	// Fetch the construction site image
	const constructionImageUrl = new URL('/construction-site.png', request.url);
	const constructionImageData = await fetch(constructionImageUrl).then((res) => res.arrayBuffer());
	const constructionImageBase64 = `data:image/png;base64,${Buffer.from(constructionImageData).toString('base64')}`;

	return new ImageResponse(
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				width: '100%',
				height: '100%',
				position: 'relative',
			}}
		>
			{/* Background Image */}
			{/* biome-ignore lint/performance/noImgElement: @vercel/og requires img for ImageResponse */}
			<img
				src={backgroundImageBase64}
				alt=""
				aria-hidden="true"
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
				}}
			/>

			{/* Framework Kit Badge - Top Left */}
			<div
				style={{
					position: 'absolute',
					top: 48,
					left: 60,
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					padding: '12px 24px',
					borderRadius: 9999,
					backgroundColor: 'rgba(255, 107, 53, 0.25)',
					border: '2px solid rgba(255, 107, 53, 0.5)',
					zIndex: 20,
				}}
			>
				<div
					style={{
						color: '#FF6B35',
						fontSize: 24,
						fontWeight: 700,
					}}
				>
					Framework Kit
				</div>
			</div>

			{/* Left Side - Text Content */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					width: '50%',
					height: '100%',
					padding: '60px',
					zIndex: 10,
				}}
			>
				{/* Title */}
				<div
					style={{
						fontSize: 72,
						fontWeight: 800,
						color: '#171717',
						lineHeight: 1.1,
						marginBottom: 24,
						letterSpacing: '-0.03em',
					}}
				>
					{title}
				</div>

				{/* Description */}
				<div
					style={{
						fontSize: 28,
						color: '#6b7280',
						lineHeight: 1.5,
					}}
				>
					{description}
				</div>
			</div>

			{/* Right Side - Construction Site Image */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: '50%',
					height: '100%',
					zIndex: 10,
				}}
			>
				{/* biome-ignore lint/performance/noImgElement: @vercel/og requires img for ImageResponse */}
				<img
					src={constructionImageBase64}
					alt=""
					aria-hidden="true"
					style={{
						width: '150%',
						height: '150%',
						objectFit: 'contain',
						marginLeft: '-80px',
					}}
				/>
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
