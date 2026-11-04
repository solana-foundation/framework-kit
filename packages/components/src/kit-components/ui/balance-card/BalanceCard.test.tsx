// @vitest-environment jsdom

import { address, lamports } from '@solana/kit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { BalanceCard } from './BalanceCard';

afterEach(() => {
	cleanup();
});

const testAddress = address('6DMh7fYHrKdCJwCFUQfMfNAdLADi9xqsRKNzmZA31DkK');
const testBalance = lamports(34_810_000_000n); // ~34.81 when formatted

const sampleTokens = [
	{ symbol: 'USDC', balance: 15.5, fiatValue: 15.5 },
	{ symbol: 'USDT', balance: 10.18, fiatValue: 10.18 },
];

describe('BalanceCard', () => {
	describe('rendering', () => {
		it('renders without crashing with required props', () => {
			render(<BalanceCard totalBalance={testBalance} />);
			expect(screen.getByText('Total balance')).toBeInTheDocument();
		});

		it('renders as a section element with aria-label', () => {
			render(<BalanceCard walletAddress={testAddress} totalBalance={testBalance} />);
			expect(screen.getByRole('region')).toHaveAttribute('aria-label', expect.stringContaining('Wallet balance'));
		});

		it('displays wallet address in truncated format', () => {
			render(<BalanceCard walletAddress={testAddress} totalBalance={testBalance} />);
			expect(screen.getByText('6DMh...1DkK')).toBeInTheDocument();
		});

		it('displays total balance label', () => {
			render(<BalanceCard totalBalance={testBalance} />);
			expect(screen.getByText('Total balance')).toBeInTheDocument();
		});
	});

	describe('balance formatting', () => {
		it('shows fiat format with currency symbol when isFiatBalance is true', () => {
			render(<BalanceCard totalBalance={testBalance} isFiatBalance={true} currency="USD" />);
			// Balance should include $ symbol
			expect(screen.getByText(/\$/)).toBeInTheDocument();
		});

		it('shows crypto format without currency symbol when isFiatBalance is false', () => {
			render(<BalanceCard totalBalance={testBalance} isFiatBalance={false} />);
			// Should not have currency symbol
			expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
		});

		it('shows token symbol after balance when tokenSymbol is provided', () => {
			render(<BalanceCard totalBalance={testBalance} tokenSymbol="SOL" />);
			expect(screen.getByText(/SOL/)).toBeInTheDocument();
			expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
		});

		it('does not show token symbol when isFiatBalance is true even if tokenSymbol is set', () => {
			render(<BalanceCard totalBalance={testBalance} isFiatBalance={true} tokenSymbol="SOL" />);
			expect(screen.getByText(/\$/)).toBeInTheDocument();
			expect(screen.queryByText(/SOL/)).not.toBeInTheDocument();
		});
	});

	describe('loading state', () => {
		it('renders skeleton when isLoading is true', () => {
			const { container } = render(<BalanceCard totalBalance={testBalance} isLoading={true} />);
			// Skeleton should be present, not the balance label
			expect(screen.queryByText('Total balance')).not.toBeInTheDocument();
			// Check for skeleton elements (animated divs)
			expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
		});
	});

	describe('error state', () => {
		it('displays error message when error prop is a string', () => {
			render(<BalanceCard totalBalance={testBalance} error="Failed to load balance" />);
			expect(screen.getByText('Failed to load balance')).toBeInTheDocument();
		});

		it('displays error message when error prop is an Error object', () => {
			render(<BalanceCard totalBalance={testBalance} error={new Error('Network error')} />);
			expect(screen.getByText('Network error')).toBeInTheDocument();
		});

		it('calls onRetry when retry button is clicked', () => {
			const onRetry = vi.fn();
			render(<BalanceCard totalBalance={testBalance} error="Error" onRetry={onRetry} />);

			const retryButton = screen.getByRole('button', { name: /try again/i });
			fireEvent.click(retryButton);

			expect(onRetry).toHaveBeenCalledTimes(1);
		});
	});

	describe('token list', () => {
		it('renders token list section', () => {
			render(<BalanceCard totalBalance={testBalance} tokens={sampleTokens} />);
			expect(screen.getByText('View all tokens')).toBeInTheDocument();
		});

		it('token list is collapsed by default', () => {
			render(<BalanceCard totalBalance={testBalance} tokens={sampleTokens} />);
			// Token symbols should not be visible when collapsed
			const button = screen.getByRole('button', { name: /view all tokens/i });
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});

		it('token list is expanded when defaultExpanded is true', () => {
			render(<BalanceCard totalBalance={testBalance} tokens={sampleTokens} defaultExpanded={true} />);
			const button = screen.getByRole('button', { name: /view all tokens/i });
			expect(button).toHaveAttribute('aria-expanded', 'true');
		});

		it('expands token list when toggle is clicked', () => {
			render(<BalanceCard totalBalance={testBalance} tokens={sampleTokens} />);

			const button = screen.getByRole('button', { name: /view all tokens/i });
			expect(button).toHaveAttribute('aria-expanded', 'false');

			fireEvent.click(button);

			expect(button).toHaveAttribute('aria-expanded', 'true');
		});

		it('shows "No tokens yet" when tokens array is empty and expanded', () => {
			render(<BalanceCard totalBalance={testBalance} tokens={[]} defaultExpanded={true} />);
			expect(screen.getByText('No tokens yet')).toBeInTheDocument();
		});

		it('renders all tokens when expanded', () => {
			render(<BalanceCard totalBalance={testBalance} tokens={sampleTokens} defaultExpanded={true} />);
			expect(screen.getByText('USDC')).toBeInTheDocument();
			expect(screen.getByText('USDT')).toBeInTheDocument();
		});

		it('calls onExpandedChange when token list is toggled', () => {
			const onExpandedChange = vi.fn();
			render(
				<BalanceCard totalBalance={testBalance} tokens={sampleTokens} onExpandedChange={onExpandedChange} />,
			);

			const button = screen.getByRole('button', { name: /view all tokens/i });
			fireEvent.click(button);

			expect(onExpandedChange).toHaveBeenCalledWith(true);
		});
	});

	describe('semantic tokens', () => {
		it('uses semantic background token', () => {
			const { container } = render(<BalanceCard totalBalance={testBalance} />);
			expect(container.firstChild).toHaveClass('bg-card');
		});

		it('uses semantic foreground token', () => {
			const { container } = render(<BalanceCard totalBalance={testBalance} />);
			expect(container.firstChild).toHaveClass('text-card-foreground');
		});

		it('uses semantic border token', () => {
			const { container } = render(<BalanceCard totalBalance={testBalance} />);
			expect(container.firstChild).toHaveClass('border-border');
		});
	});

	describe('size variants', () => {
		it('applies small padding for sm size', () => {
			const { container } = render(<BalanceCard totalBalance={testBalance} size="sm" />);
			expect(container.firstChild).toHaveClass('p-3');
		});

		it('applies medium padding for md size (default)', () => {
			const { container } = render(<BalanceCard totalBalance={testBalance} size="md" />);
			expect(container.firstChild).toHaveClass('p-4');
		});

		it('applies large padding for lg size', () => {
			const { container } = render(<BalanceCard totalBalance={testBalance} size="lg" />);
			expect(container.firstChild).toHaveClass('p-6');
		});
	});

	describe('custom className', () => {
		it('applies additional className', () => {
			const { container } = render(<BalanceCard totalBalance={testBalance} className="custom-class" />);
			expect(container.firstChild).toHaveClass('custom-class');
		});
	});

	describe('wallet address interactions', () => {
		it('calls onCopyAddress when copy button is clicked', async () => {
			// Mock clipboard API
			const mockWriteText = vi.fn().mockResolvedValue(undefined);
			vi.stubGlobal('navigator', {
				...navigator,
				clipboard: { writeText: mockWriteText },
			});

			const onCopyAddress = vi.fn();
			render(
				<BalanceCard walletAddress={testAddress} totalBalance={testBalance} onCopyAddress={onCopyAddress} />,
			);

			const copyButton = screen.getByRole('button', { name: /copy/i });
			fireEvent.click(copyButton);

			// Wait for async clipboard operation
			await vi.waitFor(() => {
				expect(onCopyAddress).toHaveBeenCalledWith(testAddress);
			});
		});
	});

	describe('controlled expansion', () => {
		it('respects controlled isExpanded prop', () => {
			render(<BalanceCard totalBalance={testBalance} tokens={sampleTokens} isExpanded={true} />);
			const button = screen.getByRole('button', { name: /view all tokens/i });
			expect(button).toHaveAttribute('aria-expanded', 'true');
		});

		it('does not change expansion when controlled', () => {
			const onExpandedChange = vi.fn();
			render(
				<BalanceCard
					totalBalance={testBalance}
					tokens={sampleTokens}
					isExpanded={false}
					onExpandedChange={onExpandedChange}
				/>,
			);

			const button = screen.getByRole('button', { name: /view all tokens/i });
			fireEvent.click(button);

			// Callback should be called, but controlled prop should still control the state
			expect(onExpandedChange).toHaveBeenCalledWith(true);
		});
	});

	describe('edge cases', () => {
		it('handles zero balance correctly', () => {
			render(<BalanceCard totalBalance={lamports(0n)} isFiatBalance={true} />);
			expect(screen.getByText('$0.00')).toBeInTheDocument();
		});

		it('renders without walletAddress prop', () => {
			render(<BalanceCard totalBalance={testBalance} />);
			// Should render without crashing, no address section
			expect(screen.getByText('Total balance')).toBeInTheDocument();
		});

		it('handles missing onRetry gracefully in error state', () => {
			render(<BalanceCard totalBalance={testBalance} error="Error occurred" />);
			// Should render error but retry button may or may not be present
			expect(screen.getByText('Error occurred')).toBeInTheDocument();
		});

		it('handles missing onExpandedChange gracefully', () => {
			render(<BalanceCard totalBalance={testBalance} tokens={sampleTokens} />);
			const button = screen.getByRole('button', { name: /view all tokens/i });
			// Should not crash when clicking without handler
			expect(() => fireEvent.click(button)).not.toThrow();
		});
	});

	describe('accessibility', () => {
		it('has accessible section with aria-label including wallet address', () => {
			render(<BalanceCard walletAddress={testAddress} totalBalance={testBalance} />);
			const section = screen.getByRole('region');
			expect(section).toHaveAttribute('aria-label', expect.stringContaining(testAddress));
		});

		it('has accessible section without wallet address', () => {
			render(<BalanceCard totalBalance={testBalance} />);
			const section = screen.getByRole('region');
			expect(section).toHaveAttribute('aria-label', 'Wallet balance');
		});

		it('error state has alert role for screen readers', () => {
			render(<BalanceCard totalBalance={testBalance} error="Error message" />);
			expect(screen.getByRole('alert')).toBeInTheDocument();
		});

		it('token list toggle has aria-expanded and aria-controls', () => {
			render(<BalanceCard totalBalance={testBalance} tokens={sampleTokens} />);
			const button = screen.getByRole('button', { name: /view all tokens/i });
			expect(button).toHaveAttribute('aria-expanded');
			expect(button).toHaveAttribute('aria-controls');
		});
	});
});
