// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { WalletModal } from './WalletModal';

afterEach(() => {
	cleanup();
});

// Mock wallet data
const mockWallets = [
	{
		id: 'phantom',
		name: 'Phantom',
		icon: 'https://phantom.app/icon.png',
	},
	{
		id: 'solflare',
		name: 'Solflare',
		icon: 'https://solflare.com/icon.png',
	},
	{
		id: 'backpack',
		name: 'Backpack',
		icon: 'https://backpack.app/icon.png',
	},
];

const mockConnectingWallet = mockWallets[0];

describe('WalletModal', () => {
	describe('list view (default)', () => {
		it('renders modal with dialog role', () => {
			render(<WalletModal wallets={mockWallets} />);
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('displays modal title', () => {
			render(<WalletModal wallets={mockWallets} />);
			expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
		});

		it('renders list of wallet options', () => {
			render(<WalletModal wallets={mockWallets} />);

			expect(screen.getByText('Phantom')).toBeInTheDocument();
			expect(screen.getByText('Solflare')).toBeInTheDocument();
			expect(screen.getByText('Backpack')).toBeInTheDocument();
		});

		it('calls onSelectWallet when wallet is clicked', () => {
			const onSelectWallet = vi.fn();
			render(<WalletModal wallets={mockWallets} onSelectWallet={onSelectWallet} />);

			fireEvent.click(screen.getByText('Phantom'));

			expect(onSelectWallet).toHaveBeenCalledWith(mockWallets[0]);
		});

		it('calls onClose when close button is clicked', () => {
			const onClose = vi.fn();
			render(<WalletModal wallets={mockWallets} onClose={onClose} />);

			const closeButton = screen.getByRole('button', { name: /close/i });
			fireEvent.click(closeButton);

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('shows "no wallet" link by default', () => {
			render(<WalletModal wallets={mockWallets} />);
			expect(screen.getByText(/don't have a wallet/i)).toBeInTheDocument();
		});

		it('hides "no wallet" link when showNoWalletLink is false', () => {
			render(<WalletModal wallets={mockWallets} showNoWalletLink={false} />);
			expect(screen.queryByText(/don't have a wallet/i)).not.toBeInTheDocument();
		});

		it('renders no wallet link when showNoWalletLink is true', () => {
			render(<WalletModal wallets={mockWallets} />);
			const link = screen.getByRole('link', { name: /don't have a wallet/i });
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute('target', '_blank');
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		});
	});

	describe('connecting view', () => {
		it('shows connecting view when view is "connecting"', () => {
			render(<WalletModal wallets={mockWallets} view="connecting" connectingWallet={mockConnectingWallet} />);

			// Should not show the wallet list title
			expect(screen.queryByText('Connect Wallet')).not.toBeInTheDocument();
			// Should show connecting message with wallet name
			expect(screen.getByText(/Connecting to.*Phantom/i)).toBeInTheDocument();
		});

		it('shows loading indicator in connecting view', () => {
			render(<WalletModal wallets={mockWallets} view="connecting" connectingWallet={mockConnectingWallet} />);

			// Should show some loading/connecting text
			expect(screen.getByText(/connecting|opening/i)).toBeInTheDocument();
		});

		it('calls onBack when back button is clicked in connecting view', () => {
			const onBack = vi.fn();
			render(
				<WalletModal
					wallets={mockWallets}
					view="connecting"
					connectingWallet={mockConnectingWallet}
					onBack={onBack}
				/>,
			);

			const backButton = screen.getByRole('button', { name: /back/i });
			fireEvent.click(backButton);

			expect(onBack).toHaveBeenCalledTimes(1);
		});

		it('calls onClose when close button is clicked in connecting view', () => {
			const onClose = vi.fn();
			render(
				<WalletModal
					wallets={mockWallets}
					view="connecting"
					connectingWallet={mockConnectingWallet}
					onClose={onClose}
				/>,
			);

			const closeButton = screen.getByRole('button', { name: /close/i });
			fireEvent.click(closeButton);

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('error view', () => {
		it('shows error view when view is "error"', () => {
			render(
				<WalletModal
					wallets={mockWallets}
					view="error"
					error={{ title: 'Connection Failed', message: 'Please try again' }}
				/>,
			);

			expect(screen.getByText('Connection Failed')).toBeInTheDocument();
			expect(screen.getByText('Please try again')).toBeInTheDocument();
		});

		it('displays default error title when not provided', () => {
			render(<WalletModal wallets={mockWallets} view="error" error={{ message: 'Something went wrong' }} />);

			// Should show some default error indication
			expect(screen.getByText('Something went wrong')).toBeInTheDocument();
		});

		it('calls onRetry when retry button is clicked', () => {
			const onRetry = vi.fn();
			render(<WalletModal wallets={mockWallets} view="error" error={{ message: 'Error' }} onRetry={onRetry} />);

			const retryButton = screen.getByRole('button', { name: /retry|try again/i });
			fireEvent.click(retryButton);

			expect(onRetry).toHaveBeenCalledTimes(1);
		});

		it('calls onClose when close button is clicked in error view', () => {
			const onClose = vi.fn();
			render(<WalletModal wallets={mockWallets} view="error" error={{ message: 'Error' }} onClose={onClose} />);

			const closeButton = screen.getByRole('button', { name: /close/i });
			fireEvent.click(closeButton);

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('semantic token classes', () => {
		it('uses bg-card semantic token on the modal container', () => {
			const { container } = render(<WalletModal wallets={mockWallets} />);
			expect(container.querySelector('.bg-card')).toBeInTheDocument();
		});
	});

	describe('accessibility', () => {
		it('has dialog role', () => {
			render(<WalletModal wallets={mockWallets} />);
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('has aria-modal attribute', () => {
			render(<WalletModal wallets={mockWallets} />);
			expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
		});

		it('has aria-labelledby pointing to title in list view', () => {
			render(<WalletModal wallets={mockWallets} />);
			const dialog = screen.getByRole('dialog');
			expect(dialog).toHaveAttribute('aria-labelledby', 'wallet-modal-title');
			expect(document.getElementById('wallet-modal-title')).toBeInTheDocument();
		});

		it('uses aria-label fallback in non-list views', () => {
			render(<WalletModal wallets={mockWallets} view="connecting" connectingWallet={mockConnectingWallet} />);
			const dialog = screen.getByRole('dialog');
			expect(dialog).not.toHaveAttribute('aria-labelledby');
			expect(dialog).toHaveAttribute('aria-label');
		});
	});

	describe('custom className', () => {
		it('applies additional className', () => {
			const { container } = render(<WalletModal wallets={mockWallets} className="custom-class" />);
			expect(container.firstChild).toHaveClass('custom-class');
		});
	});

	describe('edge cases', () => {
		it('handles empty wallets array', () => {
			render(<WalletModal wallets={[]} />);
			// Should render without crashing
			expect(screen.getByRole('dialog')).toBeInTheDocument();
			expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
		});

		it('handles missing connectingWallet in connecting view gracefully', () => {
			render(<WalletModal wallets={mockWallets} view="connecting" connectingWallet={undefined} />);
			// Should not crash, but also won't show connecting view content
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('handles missing error in error view gracefully', () => {
			render(<WalletModal wallets={mockWallets} view="error" error={undefined} />);
			// Should render error view without crashing
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('handles wallet selection without onSelectWallet handler', () => {
			render(<WalletModal wallets={mockWallets} />);
			// Should not crash when clicking wallet without handler
			expect(() => fireEvent.click(screen.getByText('Phantom'))).not.toThrow();
		});
	});
});
