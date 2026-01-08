import { source } from '@/lib/source';

export const dynamic = 'force-static';

export async function GET() {
	const pages = source.getPages();

	// Build the llms.txt content
	const lines: string[] = [];

	// H1 Header - Project name
	lines.push('# Framework Kit');
	lines.push('');

	// Blockquote - Brief summary
	lines.push(
		'> Developer tools for Solana built on Solana Kit. A family of libraries for building production-ready Solana apps with universal client support, React hooks, and web3.js compatibility.',
	);
	lines.push('');

	// Documentation section
	lines.push('## Documentation');
	lines.push('');

	// Sort pages by URL to ensure consistent ordering
	const sortedPages = [...pages].sort((a, b) => a.url.localeCompare(b.url));

	for (const page of sortedPages) {
		const url = `https://framework-kit.dev${page.url}`;
		const title = page.data.title || 'Untitled';
		const description = page.data.description || '';

		lines.push(`- [${title}](${url}): ${description}`);
	}

	lines.push('');

	// Optional section for additional resources
	lines.push('## Optional');
	lines.push('');
	lines.push(
		'- [GitHub Repository](https://github.com/solana-foundation/framework-kit): Source code, issues, and contributions',
	);
	lines.push(
		'- [Full Documentation](https://framework-kit.dev/llms-full.txt): Complete documentation content in Markdown format',
	);
	lines.push('');

	const content = lines.join('\n');

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600',
		},
	});
}
