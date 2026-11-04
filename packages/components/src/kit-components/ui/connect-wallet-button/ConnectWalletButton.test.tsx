// @vitest-environment jsdom

import { lamports } from '@solana/client';
import { address } from '@solana/kit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ConnectWalletButton } from './ConnectWalletButton';

afterEach(() => {
	cleanup();
});

const mockAddress = address('6DMh7gJwvuTq3Bpf8rPVGPjzqnz1DkK3H1mVh9kP1DkK');
const mockBalance = lamports(1120000000n); // 1.12 SOL

const mockWallet = {
	address: mockAddress,
};

const mockConnector = {
	id: 'phantom',
	name: 'Phantom',
	icon: 'data:image/svg+xml,<svg></svg>',
};

describe('ConnectWalletButton', () => {
	describe('disconnected state', () => {
		it('renders "Connect Wallet" text when disconnected', () => {
			render(<ConnectWalletButton status="disconnected" onConnect={() => {}} onDisconnect={() => {}} />);
			expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
		});

		it('renders custom connect label when provided', () => {
			render(
				<ConnectWalletButton
					status="disconnected"
					labels={{ connect: 'Link Wallet' }}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);
			expect(screen.getByText('Link Wallet')).toBeInTheDocument();
		});

		it('calls onConnect when button is clicked', () => {
			const onConnect = vi.fn();
			render(<ConnectWalletButton status="disconnected" onConnect={onConnect} onDisconnect={() => {}} />);

			fireEvent.click(screen.getByRole('button'));

			expect(onConnect).toHaveBeenCalledTimes(1);
		});

		it('does not show dropdown menu when disconnected', () => {
			render(<ConnectWalletButton status="disconnected" onConnect={() => {}} onDisconnect={() => {}} />);

			fireEvent.click(screen.getByRole('button'));

			expect(screen.queryByText('Disconnect')).not.toBeInTheDocument();
		});
	});

	describe('connecting state', () => {
		it('renders spinner when connecting', () => {
			const { container } = render(
				<ConnectWalletButton status="connecting" onConnect={() => {}} onDisconnect={() => {}} />,
			);
			const spinner = container.querySelector('.animate-spin');
			expect(spinner).toBeInTheDocument();
		});

		it('does not call onConnect when clicked while connecting', () => {
			const onConnect = vi.fn();
			render(<ConnectWalletButton status="connecting" onConnect={onConnect} onDisconnect={() => {}} />);

			fireEvent.click(screen.getByRole('button'));

			expect(onConnect).not.toHaveBeenCalled();
		});
	});

	describe('connected state', () => {
		it('shows wallet icon when connected', () => {
			const { container } = render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					balance={mockBalance}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);
			const img = container.querySelector('img');
			expect(img).toBeInTheDocument();
		});

		it('opens dropdown when connected button is clicked', async () => {
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					balance={mockBalance}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);

			fireEvent.click(screen.getByRole('button'));

			await waitFor(() => {
				expect(screen.getByText('Disconnect')).toBeInTheDocument();
			});
		});

		it('displays wallet address in dropdown', async () => {
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);

			fireEvent.click(screen.getByRole('button'));

			await waitFor(() => {
				expect(screen.getByText(/6DMh.*DkK/)).toBeInTheDocument();
			});
		});

		it('calls onDisconnect when disconnect is clicked', async () => {
			const onDisconnect = vi.fn();
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					balance={mockBalance}
					onConnect={() => {}}
					onDisconnect={onDisconnect}
				/>,
			);

			fireEvent.click(screen.getByRole('button'));

			await waitFor(() => {
				expect(screen.getByText('Disconnect')).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText('Disconnect'));
			expect(onDisconnect).toHaveBeenCalledTimes(1);
		});

		it('has aria-haspopup when connected', () => {
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);

			expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'menu');
		});

		it('has aria-expanded that reflects dropdown state', async () => {
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-expanded', 'false');

			fireEvent.click(button);

			await waitFor(() => {
				expect(button).toHaveAttribute('aria-expanded', 'true');
			});
		});
	});

	describe('keyboard interactions', () => {
		it('closes dropdown on Escape key', async () => {
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					balance={mockBalance}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);

			fireEvent.click(screen.getByRole('button'));

			await waitFor(() => {
				expect(screen.getByText('Disconnect')).toBeInTheDocument();
			});

			fireEvent.keyDown(document, { key: 'Escape' });

			await waitFor(() => {
				expect(screen.queryByText('Disconnect')).not.toBeInTheDocument();
			});
		});
	});

	describe('click outside', () => {
		it('closes dropdown when clicking outside', async () => {
			render(
				<div>
					<div data-testid="outside">Outside</div>
					<ConnectWalletButton
						status="connected"
						wallet={mockWallet}
						currentConnector={mockConnector}
						onConnect={() => {}}
						onDisconnect={() => {}}
					/>
				</div>,
			);

			fireEvent.click(screen.getByRole('button'));

			await waitFor(() => {
				expect(screen.getByText('Disconnect')).toBeInTheDocument();
			});

			fireEvent.mouseDown(screen.getByTestId('outside'));

			await waitFor(() => {
				expect(screen.queryByText('Disconnect')).not.toBeInTheDocument();
			});
		});
	});

	describe('network switcher integration', () => {
		it('passes network props to dropdown', async () => {
			const onNetworkChange = vi.fn();

			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					balance={mockBalance}
					onConnect={() => {}}
					onDisconnect={() => {}}
					selectedNetwork="devnet"
					networkStatus="connected"
					onNetworkChange={onNetworkChange}
				/>,
			);

			fireEvent.click(screen.getByRole('button'));

			await waitFor(() => {
				expect(screen.getByText('Disconnect')).toBeInTheDocument();
			});

			expect(screen.getByText('Network')).toBeInTheDocument();
		});

		it('renders without network props (optional)', async () => {
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					balance={mockBalance}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);

			fireEvent.click(screen.getByRole('button'));

			await waitFor(() => {
				expect(screen.getByText('Disconnect')).toBeInTheDocument();
			});

			expect(screen.getByText('Network')).toBeInTheDocument();
		});
	});

	describe('balance display', () => {
		it('shows loading state when balanceLoading is true', async () => {
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					balanceLoading={true}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);

			fireEvent.click(screen.getByRole('button'));

			await waitFor(() => {
				expect(screen.getByText('Disconnect')).toBeInTheDocument();
			});

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('handles undefined balance gracefully', async () => {
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					balance={undefined}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);

			fireEvent.click(screen.getByRole('button'));

			await waitFor(() => {
				expect(screen.getByText('Disconnect')).toBeInTheDocument();
			});
		});
	});

	describe('SSR / hydration', () => {
		it('shows disconnected state when isReady is false', () => {
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					isReady={false}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);

			expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
		});

		it('disables button when isReady is false', () => {
			render(
				<ConnectWalletButton
					status="disconnected"
					isReady={false}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);
			expect(screen.getByRole('button')).toBeDisabled();
		});
	});

	describe('custom className', () => {
		it('applies additional className to container', () => {
			const { container } = render(
				<ConnectWalletButton
					status="disconnected"
					className="custom-class"
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);
			expect(container.firstChild).toHaveClass('custom-class');
		});
	});

	describe('error status', () => {
		it('shows disconnected state when status is error', () => {
			render(<ConnectWalletButton status="error" onConnect={() => {}} onDisconnect={() => {}} />);
			expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
		});

		it('allows reconnection when in error state', () => {
			const onConnect = vi.fn();
			render(<ConnectWalletButton status="error" onConnect={onConnect} onDisconnect={() => {}} />);

			fireEvent.click(screen.getByRole('button'));

			expect(onConnect).toHaveBeenCalledTimes(1);
		});
	});

	describe('custom labels', () => {
		it('renders custom disconnect label', async () => {
			render(
				<ConnectWalletButton
					status="connected"
					wallet={mockWallet}
					currentConnector={mockConnector}
					labels={{ disconnect: 'Log Out' }}
					onConnect={() => {}}
					onDisconnect={() => {}}
				/>,
			);

			fireEvent.click(screen.getByRole('button'));

			await waitFor(() => {
				expect(screen.getByText('Log Out')).toBeInTheDocument();
			});
		});
	});
});
