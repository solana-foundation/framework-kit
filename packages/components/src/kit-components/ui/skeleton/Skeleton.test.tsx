// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { Skeleton } from './Skeleton';

afterEach(() => {
	cleanup();
});

// test for basic rendering
describe('Skeleton', () => {
	it('renders without crashing', () => {
		render(<Skeleton data-testid="skeleton" />);
		expect(screen.getByTestId('skeleton')).toBeInTheDocument();
	});

	// test for className merging
	it('applies custom className', () => {
		render(<Skeleton data-testid="skeleton" className="h-4 w-32" />);
		const element = screen.getByTestId('skeleton');
		expect(element).toHaveClass('h-4');
		expect(element).toHaveClass('w-32');
	});

	//test for props passing through
	it('passes through additional props', () => {
		render(<Skeleton data-testid="skeleton" id="my-skeleton" aria-label="Loading content" />);
		const element = screen.getByTestId('skeleton');
		expect(element).toHaveAttribute('id', 'my-skeleton');
		expect(element).toHaveAttribute('aria-label', 'Loading content');
	});

	//test for semantic token styles
	it('applies bg-muted semantic token', () => {
		render(<Skeleton data-testid="skeleton" />);
		const element = screen.getByTestId('skeleton');
		expect(element).toHaveClass('bg-muted');
	});
});
