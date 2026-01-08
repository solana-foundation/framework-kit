import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import { source } from '@/lib/source';

type PageData = {
	title: string;
	description?: string;
	toc?: unknown;
	full?: unknown;
	body?: ComponentType<{ components?: Record<string, unknown> }>;
	default?: ComponentType<{ components?: Record<string, unknown> }>;
};

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const pageData = page.data as PageData;
	const MDX = pageData.body ?? pageData.default;
	if (!MDX) notFound();

	return (
		<DocsPage toc={pageData.toc} full={pageData.full}>
			<DocsTitle>{pageData.title}</DocsTitle>
			<DocsDescription>{pageData.description}</DocsDescription>
			<DocsBody>
				<MDX components={{ ...defaultMdxComponents, Tab, Tabs }} />
			</DocsBody>
		</DocsPage>
	);
}

export async function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const searchParams = new URLSearchParams();
	searchParams.set('title', page.data.title);
	if (page.data.description) {
		searchParams.set('description', page.data.description);
	}

	const ogImage = `/api/og?${searchParams.toString()}`;

	return {
		title: page.data.title,
		description: page.data.description,
		openGraph: {
			title: page.data.title,
			description: page.data.description,
			images: [ogImage],
		},
		twitter: {
			card: 'summary_large_image',
			title: page.data.title,
			description: page.data.description,
			images: [ogImage],
		},
	};
}
