// @vitest-environment jsdom

import { address } from '@solana/kit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

import { AddressDisplay, getExplorerUrl, truncateAddress } from './AddressDisplay';

/**
 * Tests for truncateAddress utility function
 */
describe('truncateAddress', () => {
	it('truncates a normal Solana address', () => {
		const address = 'Hb6dzd4pYxmFYKkJDWuhzBEUkkaE93sFcvXYtriTkmw9';
		expect(truncateAddress(address)).toBe('Hb6d...kmw9');
	});

	it('returns original string if 8 characters or less', () => {
		expect(truncateAddress('12345678')).toBe('12345678');
		expect(truncateAddress('abc')).toBe('abc');
	});

	it('handles empty string', () => {
		expect(truncateAddress('')).toBe('');
	});

	it('truncates string with exactly 9 characters', () => {
		expect(truncateAddress('123456789')).toBe('1234...6789');
	});
});

/**
 * Tests for getExplorerUrl utility function
 */
describe('getExplorerUrl', () => {
	const testAddress = 'Hb6dzd4pYxmFYKkJDWuhzBEUkkaE93sFcvXYtriTkmw9';

	it('builds mainnet URL without cluster param', () => {
		const url = getExplorerUrl(testAddress, 'mainnet-beta');
		expect(url).toBe(`https://explorer.solana.com/address/${testAddress}`);
		expect(url).not.toContain('cluster');
	});

	it('builds devnet URL with cluster param', () => {
		const url = getExplorerUrl(testAddress, 'devnet');
		expect(url).toBe(`https://explorer.solana.com/address/${testAddress}?cluster=devnet`);
	});

	it('builds testnet URL with cluster param', () => {
		const url = getExplorerUrl(testAddress, 'testnet');
		expect(url).toBe(`https://explorer.solana.com/address/${testAddress}?cluster=testnet`);
	});
});

/**
 * Tests for AddressDisplay component
 */
describe('AddressDisplay', () => {
	const testAddressString = 'Hb6dzd4pYxmFYKkJDWuhzBEUkkaE93sFcvXYtriTkmw9';
	const testAddress = address(testAddressString);

	it('renders truncated address', () => {
		render(<AddressDisplay address={testAddress} />);
		expect(screen.getByText('Hb6d...kmw9')).toBeInTheDocument();
	});

	it('renders full address in tooltip by default', () => {
		render(<AddressDisplay address={testAddress} />);
		expect(screen.getByText(testAddressString)).toBeInTheDocument();
	});

	it('hides tooltip when showTooltip is false', () => {
		render(<AddressDisplay address={testAddress} showTooltip={false} />);
		// The full address tooltip text should not be in the DOM
		expect(screen.queryByText(testAddressString)).not.toBeInTheDocument();
	});

	it('renders copy button with accessible label', () => {
		render(<AddressDisplay address={testAddress} />);
		expect(screen.getByRole('button', { name: /copy address/i })).toBeInTheDocument();
	});

	it('renders explorer link when showExplorerLink is true (default)', () => {
		render(<AddressDisplay address={testAddress} />);
		const link = screen.getByRole('link', { name: /view on solana explorer/i });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', `https://explorer.solana.com/address/${testAddressString}`);
	});

	it('hides explorer link when showExplorerLink is false', () => {
		render(<AddressDisplay address={testAddress} showExplorerLink={false} />);
		expect(screen.queryByRole('link', { name: /view on solana explorer/i })).not.toBeInTheDocument();
	});

	it('uses correct explorer URL for devnet', () => {
		render(<AddressDisplay address={testAddress} network="devnet" />);
		const link = screen.getByRole('link', { name: /view on solana explorer/i });
		expect(link).toHaveAttribute('href', `https://explorer.solana.com/address/${testAddressString}?cluster=devnet`);
	});

	it('applies custom className', () => {
		const { container } = render(<AddressDisplay address={testAddress} className="custom-class" />);
		expect(container.firstChild).toHaveClass('custom-class');
	});

	describe('semantic token styles', () => {
		it('applies bg-card semantic token on the chip', () => {
			const { container } = render(<AddressDisplay address={testAddress} />);
			const chip = container.querySelector('span > span');
			expect(chip).toHaveClass('bg-card');
		});
	});

	describe('copy functionality', () => {
		it('calls onCopy callback when copy button is clicked', async () => {
			// Mock clipboard API
			const mockWriteText = vi.fn().mockResolvedValue(undefined);
			vi.stubGlobal('navigator', {
				...navigator,
				clipboard: { writeText: mockWriteText },
			});

			const onCopy = vi.fn();
			render(<AddressDisplay address={testAddress} onCopy={onCopy} />);

			const copyButton = screen.getByRole('button', { name: /copy address/i });
			fireEvent.click(copyButton);

			await vi.waitFor(() => {
				expect(onCopy).toHaveBeenCalledTimes(1);
			});
		});

		it('copies address to clipboard when copy button is clicked', async () => {
			const mockWriteText = vi.fn().mockResolvedValue(undefined);
			vi.stubGlobal('navigator', {
				...navigator,
				clipboard: { writeText: mockWriteText },
			});

			render(<AddressDisplay address={testAddress} />);

			const copyButton = screen.getByRole('button', { name: /copy address/i });
			fireEvent.click(copyButton);

			await vi.waitFor(() => {
				expect(mockWriteText).toHaveBeenCalledWith(testAddressString);
			});
		});
	});
});
