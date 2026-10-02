// @vitest-environment jsdom
import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { TransactionToast } from './TransactionToast';
import { TransactionToastProvider } from './TransactionToastProvider';
import { useTransactionToast } from './useTransactionToast';

const mockSignature = '5UfDuX7hXrVoNMYhFpFdYxGE8mLqZnzCYQEHZ8Bj9K8xN2FvYYv5VT7qYRqXLwGKSk3nYhZx';

afterEach(() => {
	cleanup();
});

describe('TransactionToast', () => {
	// for basic rendering
	it('renders without crashing', () => {
		render(<TransactionToast signature={mockSignature} status="success" />);
		expect(screen.getByText('Transaction sent successfully')).toBeInTheDocument();
	});

	// for status icons
	describe('status icons', () => {
		it('renders spinning loader for pending status', () => {
			const { container } = render(<TransactionToast signature={mockSignature} status="pending" />);
			const loader = container.querySelector('.animate-spin');
			expect(loader).toBeInTheDocument();
		});

		it('renders check icon for success status', () => {
			const { container } = render(<TransactionToast signature={mockSignature} status="success" />);
			const successIcon = container.querySelector('.bg-success\\/20');
			expect(successIcon).toBeInTheDocument();
		});

		it('renders X icon for error status', () => {
			const { container } = render(<TransactionToast signature={mockSignature} status="error" />);
			const errorIcon = container.querySelector('.bg-destructive\\/20');
			expect(errorIcon).toBeInTheDocument();
		});
	});

	// for message combinations (3 statuses × 3 types = 9)
	describe('message combinations', () => {
		// sent type
		it('shows correct message for sent + pending', () => {
			render(<TransactionToast signature={mockSignature} status="pending" type="sent" />);
			expect(screen.getByText('Transaction pending...')).toBeInTheDocument();
		});

		it('shows correct message for sent + success', () => {
			render(<TransactionToast signature={mockSignature} status="success" type="sent" />);
			expect(screen.getByText('Transaction sent successfully')).toBeInTheDocument();
		});

		it('shows correct message for sent + error', () => {
			render(<TransactionToast signature={mockSignature} status="error" type="sent" />);
			expect(screen.getByText('Transaction failed')).toBeInTheDocument();
		});

		// received type
		it('shows correct message for received + pending', () => {
			render(<TransactionToast signature={mockSignature} status="pending" type="received" />);
			expect(screen.getByText('Transaction pending...')).toBeInTheDocument();
		});

		it('shows correct message for received + success', () => {
			render(<TransactionToast signature={mockSignature} status="success" type="received" />);
			expect(screen.getByText('Transaction received successfully')).toBeInTheDocument();
		});

		it('shows correct message for received + error', () => {
			render(<TransactionToast signature={mockSignature} status="error" type="received" />);
			expect(screen.getByText('Transaction failed')).toBeInTheDocument();
		});

		// swapped type
		it('shows correct message for swapped + pending', () => {
			render(<TransactionToast signature={mockSignature} status="pending" type="swapped" />);
			expect(screen.getByText('Swap pending...')).toBeInTheDocument();
		});

		it('shows correct message for swapped + success', () => {
			render(<TransactionToast signature={mockSignature} status="success" type="swapped" />);
			expect(screen.getByText('Swap completed successfully')).toBeInTheDocument();
		});

		it('shows correct message for swapped + error', () => {
			render(<TransactionToast signature={mockSignature} status="error" type="swapped" />);
			expect(screen.getByText('Swap failed')).toBeInTheDocument();
		});
	});

	// for semantic token styles
	describe('semantic token styles', () => {
		it('applies bg-card and text-card-foreground tokens', () => {
			render(<TransactionToast signature={mockSignature} status="success" />);
			const element = screen.getByText('Transaction sent successfully').parentElement;
			expect(element).toHaveClass('bg-card');
			expect(element).toHaveClass('text-card-foreground');
		});
	});

	// for explorer URL generation
	describe('explorer URL generation', () => {
		it('generates correct URL for mainnet-beta (no cluster param)', () => {
			render(<TransactionToast signature={mockSignature} status="success" network="mainnet-beta" />);
			const link = screen.getByRole('link', { name: /view/i });
			expect(link).toHaveAttribute('href', `https://explorer.solana.com/tx/${mockSignature}`);
		});

		it('generates correct URL for devnet', () => {
			render(<TransactionToast signature={mockSignature} status="success" network="devnet" />);
			const link = screen.getByRole('link', { name: /view/i });
			expect(link).toHaveAttribute('href', `https://explorer.solana.com/tx/${mockSignature}?cluster=devnet`);
		});

		it('generates correct URL for testnet', () => {
			render(<TransactionToast signature={mockSignature} status="success" network="testnet" />);
			const link = screen.getByRole('link', { name: /view/i });
			expect(link).toHaveAttribute('href', `https://explorer.solana.com/tx/${mockSignature}?cluster=testnet`);
		});
	});

	// for link security
	describe('link security', () => {
		it('opens explorer link in new tab', () => {
			render(<TransactionToast signature={mockSignature} status="success" />);
			const link = screen.getByRole('link', { name: /view/i });
			expect(link).toHaveAttribute('target', '_blank');
		});

		it('has noopener noreferrer for security', () => {
			render(<TransactionToast signature={mockSignature} status="success" />);
			const link = screen.getByRole('link', { name: /view/i });
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		});
	});

	// for accessibility
	describe('accessibility', () => {
		it('has status role for pending transactions', () => {
			render(<TransactionToast signature={mockSignature} status="pending" />);
			const toast = screen.getByRole('status');
			expect(toast).toBeInTheDocument();
		});

		it('has status role for successful transactions', () => {
			render(<TransactionToast signature={mockSignature} status="success" />);
			const toast = screen.getByRole('status');
			expect(toast).toBeInTheDocument();
		});

		it('has alert role for failed transactions', () => {
			render(<TransactionToast signature={mockSignature} status="error" />);
			const toast = screen.getByRole('alert');
			expect(toast).toBeInTheDocument();
		});

		it('has aria-live polite for non-error states', () => {
			render(<TransactionToast signature={mockSignature} status="success" />);
			const toast = screen.getByRole('status');
			expect(toast).toHaveAttribute('aria-live', 'polite');
		});

		it('has aria-live assertive for error state', () => {
			render(<TransactionToast signature={mockSignature} status="error" />);
			const toast = screen.getByRole('alert');
			expect(toast).toHaveAttribute('aria-live', 'assertive');
		});

		it('explorer link has descriptive accessible name', () => {
			render(<TransactionToast signature={mockSignature} status="success" />);
			const link = screen.getByRole('link');
			expect(link).toHaveAccessibleName(/view transaction/i);
		});
	});
});

// Helper wrapper for hook tests
const wrapper = ({ children }: { children: ReactNode }) => (
	<TransactionToastProvider>{children}</TransactionToastProvider>
);

describe('useTransactionToast hook integration', () => {
	// Test: hook returns the expected API
	it('returns toast, dismiss, and update functions', () => {
		const { result } = renderHook(() => useTransactionToast(), { wrapper });

		expect(typeof result.current.toast).toBe('function');
		expect(typeof result.current.dismiss).toBe('function');
		expect(typeof result.current.update).toBe('function');
	});

	// Test: toast() returns a string ID
	it('toast() returns a string ID', () => {
		const { result } = renderHook(() => useTransactionToast(), { wrapper });

		let toastId = '';
		act(() => {
			toastId = result.current.toast({
				signature: mockSignature,
				status: 'pending',
			});
		});

		expect(typeof toastId).toBe('string');
		expect(toastId.length).toBeGreaterThan(0);
	});

	// Test: toast() causes toast to render
	it('toast() causes toast to render', () => {
		const TestComponent = () => {
			const { toast } = useTransactionToast();
			return (
				<button type="button" onClick={() => toast({ signature: mockSignature, status: 'success' })}>
					Trigger Toast
				</button>
			);
		};

		render(
			<TransactionToastProvider>
				<TestComponent />
			</TransactionToastProvider>,
		);

		// Toast should not exist initially
		expect(screen.queryByText('Transaction sent successfully')).not.toBeInTheDocument();

		// Click to trigger toast
		act(() => {
			screen.getByText('Trigger Toast').click();
		});

		// Toast should now be visible
		expect(screen.getByText('Transaction sent successfully')).toBeInTheDocument();
	});

	// Test: dismiss() removes the toast
	it('dismiss() removes the toast', () => {
		const TestComponent = () => {
			const { toast, dismiss } = useTransactionToast();
			return (
				<>
					<button
						type="button"
						onClick={() => {
							const id = toast({ signature: mockSignature, status: 'success' });
							// Store ID for dismiss button
							(window as unknown as { toastId: string }).toastId = id;
						}}
					>
						Trigger Toast
					</button>
					<button type="button" onClick={() => dismiss((window as unknown as { toastId: string }).toastId)}>
						Dismiss Toast
					</button>
				</>
			);
		};

		render(
			<TransactionToastProvider>
				<TestComponent />
			</TransactionToastProvider>,
		);

		// Trigger toast
		act(() => {
			screen.getByText('Trigger Toast').click();
		});
		expect(screen.getByText('Transaction sent successfully')).toBeInTheDocument();

		// Dismiss toast
		act(() => {
			screen.getByText('Dismiss Toast').click();
		});
		expect(screen.queryByText('Transaction sent successfully')).not.toBeInTheDocument();
	});

	// Test: update() changes the toast status
	it('update() changes toast from pending to success', () => {
		const TestComponent = () => {
			const { toast, update } = useTransactionToast();
			return (
				<>
					<button
						type="button"
						onClick={() => {
							const id = toast({ signature: mockSignature, status: 'pending' });
							(window as unknown as { toastId: string }).toastId = id;
						}}
					>
						Trigger Toast
					</button>
					<button
						type="button"
						onClick={() =>
							update((window as unknown as { toastId: string }).toastId, { status: 'success' })
						}
					>
						Update Toast
					</button>
				</>
			);
		};

		render(
			<TransactionToastProvider>
				<TestComponent />
			</TransactionToastProvider>,
		);

		// Trigger pending toast
		act(() => {
			screen.getByText('Trigger Toast').click();
		});
		expect(screen.getByText('Transaction pending...')).toBeInTheDocument();

		// Update to success
		act(() => {
			screen.getByText('Update Toast').click();
		});
		expect(screen.queryByText('Transaction pending...')).not.toBeInTheDocument();
		expect(screen.getByText('Transaction sent successfully')).toBeInTheDocument();
	});

	// Test: hook throws when used outside provider
	it('throws error when used outside provider', () => {
		// Suppress console.error for this test since we expect an error
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		expect(() => {
			renderHook(() => useTransactionToast());
		}).toThrow('useTransactionToast must be used within a TransactionToastProvider');

		consoleSpy.mockRestore();
	});
});
