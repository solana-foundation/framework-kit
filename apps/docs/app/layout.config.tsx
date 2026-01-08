import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can configure layouts here
 *
 * @see https://fumadocs.typescriptfyi.com/docs/ui/layout-shared
 */
export const baseOptions: BaseLayoutProps = {
	nav: {
		title: 'Framework Kit',
	},
	links: [
		{
			text: 'Documentation',
			url: '/docs',
			active: 'nested-url',
		},
	],
};
