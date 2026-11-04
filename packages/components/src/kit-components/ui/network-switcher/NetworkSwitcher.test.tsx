// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { NetworkSwitcher } from './NetworkSwitcher';
import { DEFAULT_NETWORKS } from './types';

afterEach(() => {
	cleanup();
});

describe('NetworkSwitcher', () => {
	describe('rendering', () => {
		it('renders without crashing', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);
			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('renders trigger button', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);
			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('dropdown is closed by default', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);
			// Network options should not be visible when dropdown is closed
			expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
		});

		it('shows selected network label in trigger', () => {
			render(<NetworkSwitcher selectedNetwork="devnet" />);
			expect(screen.getByRole('button')).toHaveTextContent('Devnet');
		});

		it('shows status indicator in trigger when connected', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" status="connected" />);
			expect(screen.getByLabelText('Connected')).toBeInTheDocument();
		});

		it('updates trigger label when selectedNetwork changes', () => {
			const { rerender } = render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);
			expect(screen.getByRole('button')).toHaveTextContent('Mainnet');

			rerender(<NetworkSwitcher selectedNetwork="devnet" />);
			expect(screen.getByRole('button')).toHaveTextContent('Devnet');
		});
	});

	describe('dropdown behavior', () => {
		it('opens dropdown when trigger is clicked', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);

			fireEvent.click(screen.getByRole('button'));

			// Network options should now be visible
			expect(screen.getByText('Devnet')).toBeInTheDocument();
			expect(screen.getByText('Testnet')).toBeInTheDocument();
		});

		it('displays all default network options', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);

			fireEvent.click(screen.getByRole('button'));

			const listbox = screen.getByRole('listbox');
			for (const network of DEFAULT_NETWORKS) {
				expect(within(listbox).getByText(network.label)).toBeInTheDocument();
			}
		});

		it('closes dropdown after network selection', () => {
			const onNetworkChange = vi.fn();
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" onNetworkChange={onNetworkChange} />);

			// Open dropdown
			fireEvent.click(screen.getByRole('button'));
			expect(screen.getByText('Devnet')).toBeInTheDocument();

			// Select a network
			fireEvent.click(screen.getByText('Devnet'));

			// Dropdown should close
			expect(screen.queryByText('Testnet')).not.toBeInTheDocument();
		});

		it('toggles dropdown open and closed', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);

			const trigger = screen.getByRole('button');

			// Open
			fireEvent.click(trigger);
			expect(screen.getByText('Devnet')).toBeInTheDocument();

			// Close
			fireEvent.click(trigger);
			expect(screen.queryByText('Devnet')).not.toBeInTheDocument();
		});
	});

	describe('network selection', () => {
		it('calls onNetworkChange when network is selected', () => {
			const onNetworkChange = vi.fn();
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" onNetworkChange={onNetworkChange} />);

			fireEvent.click(screen.getByRole('button'));
			fireEvent.click(screen.getByText('Devnet'));

			expect(onNetworkChange).toHaveBeenCalledWith('devnet');
		});

		it('calls onNetworkChange with correct network id', () => {
			const onNetworkChange = vi.fn();
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" onNetworkChange={onNetworkChange} />);

			fireEvent.click(screen.getByRole('button'));
			fireEvent.click(screen.getByText('Testnet'));

			expect(onNetworkChange).toHaveBeenCalledWith('testnet');
		});
	});

	describe('keyboard interactions', () => {
		it('closes dropdown on Escape key', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);

			// Open dropdown
			fireEvent.click(screen.getByRole('button'));
			expect(screen.getByText('Devnet')).toBeInTheDocument();

			// Press Escape
			fireEvent.keyDown(document, { key: 'Escape' });

			expect(screen.queryByText('Devnet')).not.toBeInTheDocument();
		});
	});

	describe('click outside', () => {
		it('closes dropdown when clicking outside', () => {
			render(
				<div>
					<div data-testid="outside">Outside</div>
					<NetworkSwitcher selectedNetwork="mainnet-beta" />
				</div>,
			);

			// Open dropdown
			fireEvent.click(screen.getByRole('button'));
			expect(screen.getByText('Devnet')).toBeInTheDocument();

			// Click outside
			fireEvent.mouseDown(screen.getByTestId('outside'));

			expect(screen.queryByText('Devnet')).not.toBeInTheDocument();
		});
	});

	describe('controlled mode', () => {
		it('respects controlled open prop', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" open={true} />);

			// Dropdown should be open without clicking
			expect(screen.getByText('Devnet')).toBeInTheDocument();
		});

		it('calls onOpenChange when toggle is clicked', () => {
			const onOpenChange = vi.fn();
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" open={false} onOpenChange={onOpenChange} />);

			fireEvent.click(screen.getByRole('button'));

			expect(onOpenChange).toHaveBeenCalledWith(true);
		});

		it('calls onOpenChange with false when closing', () => {
			const onOpenChange = vi.fn();
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" open={true} onOpenChange={onOpenChange} />);

			fireEvent.keyDown(document, { key: 'Escape' });

			expect(onOpenChange).toHaveBeenCalledWith(false);
		});
	});

	describe('disabled state', () => {
		it('does not open dropdown when disabled', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" disabled={true} />);

			fireEvent.click(screen.getByRole('button'));

			// Dropdown should not open
			expect(screen.queryByText('Devnet')).not.toBeInTheDocument();
		});

		it('trigger button is disabled', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" disabled={true} />);
			expect(screen.getByRole('button')).toBeDisabled();
		});
	});

	describe('custom networks', () => {
		it('displays custom networks when provided', () => {
			const customNetworks = [
				{ id: 'mainnet-beta' as const, label: 'Main Network' },
				{ id: 'devnet' as const, label: 'Development' },
			];

			render(<NetworkSwitcher selectedNetwork="mainnet-beta" networks={customNetworks} />);

			fireEvent.click(screen.getByRole('button'));

			const listbox = screen.getByRole('listbox');
			expect(within(listbox).getByText('Main Network')).toBeInTheDocument();
			expect(within(listbox).getByText('Development')).toBeInTheDocument();
			// Default labels should not be present in dropdown
			expect(within(listbox).queryByText('Mainnet')).not.toBeInTheDocument();
		});
	});

	describe('semantic token styles', () => {
		it('applies semantic token classes to trigger', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-secondary');
			expect(button).toHaveClass('text-card-foreground');
			expect(button).toHaveClass('border-border');
		});

		it('applies semantic token classes to dropdown', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);

			fireEvent.click(screen.getByRole('button'));

			const listbox = screen.getByRole('listbox');
			expect(listbox).toHaveClass('bg-secondary');
		});
	});

	describe('status indicator', () => {
		it('passes status to dropdown', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" status="connected" />);

			fireEvent.click(screen.getByRole('button'));

			// Dropdown should be visible - status is used for styling
			const listbox = screen.getByRole('listbox');
			expect(within(listbox).getByText('Mainnet')).toBeInTheDocument();
		});
	});

	describe('custom className', () => {
		it('applies additional className to container', () => {
			const { container } = render(<NetworkSwitcher selectedNetwork="mainnet-beta" className="custom-class" />);
			expect(container.firstChild).toHaveClass('custom-class');
		});
	});

	describe('accessibility', () => {
		it('trigger has button role', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);
			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('trigger has aria-haspopup attribute', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);
			expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup');
		});

		it('trigger has aria-expanded that reflects dropdown state', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);

			const trigger = screen.getByRole('button');

			expect(trigger).toHaveAttribute('aria-expanded', 'false');

			fireEvent.click(trigger);

			expect(trigger).toHaveAttribute('aria-expanded', 'true');
		});
	});

	describe('edge cases', () => {
		it('handles empty networks array gracefully', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" networks={[]} />);

			fireEvent.click(screen.getByRole('button'));

			// Should open without crashing, even with no options
			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('handles network selection when onNetworkChange is not provided', () => {
			render(<NetworkSwitcher selectedNetwork="mainnet-beta" />);

			fireEvent.click(screen.getByRole('button'));

			// Should not crash when clicking without handler
			expect(() => fireEvent.click(screen.getByText('Devnet'))).not.toThrow();
		});
	});
});
