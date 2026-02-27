import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../kit-components/ui/skeleton';

const meta: Meta<typeof Skeleton> = {
	title: 'Kit Components/Feedback/Skeleton',
	component: Skeleton,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A loading placeholder that mimics the shape of content while data is being fetched. Use className to define dimensions and shape.',
			},
		},
	},
	argTypes: {
		className: {
			description: 'CSS classes to define size and shape (e.g., "h-4 w-32 rounded-full")',
			table: {
				type: { summary: 'string' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// default

export const Default: Story = {
	args: {
		className: 'h-4 w-32',
	},
};

// common use cases

export const TextLine: Story = {
	name: 'Use Case: Text Line',
	args: {
		className: 'h-4 w-48',
	},
	parameters: {
		docs: {
			description: {
				story: 'Placeholder for a single line of text.',
			},
		},
	},
};

export const TextParagraph: Story = {
	name: 'Use Case: Paragraph',
	render: (args) => (
		<div className="space-y-2">
			<Skeleton {...args} className="h-4 w-full" />
			<Skeleton {...args} className="h-4 w-full" />
			<Skeleton {...args} className="h-4 w-3/4" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Multiple skeletons to represent a paragraph of text.',
			},
		},
	},
};

export const Avatar: Story = {
	name: 'Use Case: Avatar',
	args: {
		className: 'h-12 w-12 rounded-full',
	},
	parameters: {
		docs: {
			description: {
				story: 'Circular skeleton for user avatars or profile images.',
			},
		},
	},
};

export const Button: Story = {
	name: 'Use Case: Button',
	args: {
		className: 'h-10 w-24 rounded-md',
	},
	parameters: {
		docs: {
			description: {
				story: 'Placeholder for a button element.',
			},
		},
	},
};

export const Card: Story = {
	name: 'Use Case: Card',
	args: {
		className: 'h-32 w-full rounded-lg',
	},
	parameters: {
		docs: {
			description: {
				story: 'Large skeleton for card or image placeholders.',
			},
		},
	},
};

// for composition examples

export const ProfileCard: Story = {
	name: 'Composition: Profile Card',
	render: (args) => (
		<div className="flex items-center gap-4 p-4 border rounded-lg w-64">
			<Skeleton {...args} className="h-12 w-12 rounded-full" />
			<div className="space-y-2 flex-1">
				<Skeleton {...args} className="h-4 w-24" />
				<Skeleton {...args} className="h-3 w-32" />
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Multiple skeletons composed to represent a loading profile card.',
			},
		},
	},
};

export const TransactionList: Story = {
	name: 'Composition: Transaction List',
	render: (args) => (
		<div className="space-y-3 w-72">
			{[1, 2, 3].map((i) => (
				<div key={i} className="flex items-center justify-between p-3 border rounded-md">
					<div className="flex items-center gap-3">
						<Skeleton {...args} className="h-8 w-8 rounded-full" />
						<div className="space-y-1">
							<Skeleton {...args} className="h-3 w-20" />
							<Skeleton {...args} className="h-2 w-16" />
						</div>
					</div>
					<Skeleton {...args} className="h-4 w-16" />
				</div>
			))}
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Skeleton layout for a list of transactions - common in Solana dApps.',
			},
		},
	},
};

// for playground

export const Playground: Story = {
	name: 'Playground',
	args: {
		className: 'h-8 w-48',
	},
	parameters: {
		docs: {
			description: {
				story: 'Use the controls panel to experiment with different sizes. Try classes like "h-12 w-12 rounded-full" for an avatar.',
			},
		},
	},
};
