import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { source } from '@/lib/source';

export const dynamic = 'force-static';

export async function GET() {
	const pages = source.getPages();

	// Build the llms-full.txt content with complete documentation
	const sections: string[] = [];

	// Add header
	sections.push('# Framework Kit - Complete Documentation');
	sections.push('');
	sections.push('> Developer tools for Solana built on Solana Kit');
	sections.push('');
	sections.push('---');
	sections.push('');

	// Sort pages by URL for consistent ordering
	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	for (const page of sortedPages) {
		const title = page.data.title || 'Untitled';
		const url = page.url;

		// Add section header
		sections.push(`# ${title}`);
		sections.push('');
		sections.push(`URL: https://framework-kit.dev${url}`);
		sections.push('');

		// Add description if available
		if (page.data.description) {
			sections.push(`> ${page.data.description}`);
			sections.push('');
		}

		// Read the raw MDX file content
		try {
			// Construct file path from URL
			// URL format: /docs/client -> client.mdx, /docs -> index.mdx
			const slug = url.replace(/^\/docs\/?/, '');
			const fileName = slug === '' ? 'index.mdx' : `${slug}.mdx`;
			const fullPath = join(process.cwd(), 'content', 'docs', fileName);
			const rawContent = await readFile(fullPath, 'utf-8');

			// Remove frontmatter (content between --- markers)
			const contentWithoutFrontmatter = rawContent.replace(/^---[\s\S]*?---\n/, '');
			sections.push(contentWithoutFrontmatter.trim());
		} catch (error) {
			// If we can't read the file, just skip the content
			console.error(`Error reading file for ${url}:`, error);
		}

		sections.push('');
		sections.push('---');
		sections.push('');
	}

	const fullContent = sections.join('\n');

	return new Response(fullContent, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600',
		},
	});
}
