// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { DashboardShell } from './DashboardShell';

afterEach(() => {
	cleanup();
});
describe('DashboardShell', () => {
	//basic rendering test
	it('renders without crashing', () => {
		render(
			<DashboardShell data-testid="shell">
				<p>Content</p>
			</DashboardShell>,
		);
		expect(screen.getByTestId('shell')).toBeInTheDocument();
	});
	//test to see that children are rendered
	it('renders children content', () => {
		render(
			<DashboardShell>
				<p data-testid="child">Hello World</p>
			</DashboardShell>,
		);
		expect(screen.getByTestId('child')).toBeInTheDocument();
		expect(screen.getByText('Hello World')).toBeInTheDocument();
	});
	// test to see that header slot works
	it('renders header when provided', () => {
		render(
			<DashboardShell header={<nav data-testid="header">Navigation</nav>}>
				<p>Content</p>
			</DashboardShell>,
		);
		expect(screen.getByTestId('header')).toBeInTheDocument();
		expect(screen.getByText('Navigation')).toBeInTheDocument();
	});
	// test that header is optional
	it('does not render header element when not provided', () => {
		render(
			<DashboardShell data-testid="shell">
				<p>Content</p>
			</DashboardShell>,
		);
		expect(screen.queryByRole('banner')).not.toBeInTheDocument();
	});
	// test that semantic bg-background token is applied
	it('applies bg-background semantic token', () => {
		render(
			<DashboardShell data-testid="shell">
				<p>Content</p>
			</DashboardShell>,
		);
		expect(screen.getByTestId('shell')).toHaveClass('bg-background');
	});
	// test that custom classes are applied
	it('applies custom className', () => {
		render(
			<DashboardShell data-testid="shell" className="custom-class">
				<p>Content</p>
			</DashboardShell>,
		);
		expect(screen.getByTestId('shell')).toHaveClass('custom-class');
	});
	//test that props are passed through
	it('passes through additional props', () => {
		render(
			<DashboardShell data-testid="shell" id="my-shell" aria-label="Dashboard">
				<p>Content</p>
			</DashboardShell>,
		);
		const shell = screen.getByTestId('shell');
		expect(shell).toHaveAttribute('id', 'my-shell');
		expect(shell).toHaveAttribute('aria-label', 'Dashboard');
	});
	// test that dot grid shows by default
	it('renders dot grid background pattern by default', () => {
		render(
			<DashboardShell data-testid="shell">
				<p>Content</p>
			</DashboardShell>,
		);
		const shell = screen.getByTestId('shell');
		const dotGrid = shell.querySelector('[aria-hidden="true"]');
		expect(dotGrid).toBeInTheDocument();
	});
	// test that dot grid can be hidden
	it('hides dot grid when showDotGrid is false', () => {
		render(
			<DashboardShell data-testid="shell" showDotGrid={false}>
				<p>Content</p>
			</DashboardShell>,
		);
		const shell = screen.getByTestId('shell');
		const dotGrid = shell.querySelector('[aria-hidden="true"]');
		expect(dotGrid).not.toBeInTheDocument();
	});
	//test for semantic HTML structure
	it('uses semantic HTML elements', () => {
		render(
			<DashboardShell header={<span>Nav</span>}>
				<p>Content</p>
			</DashboardShell>,
		);
		// header slot renders inside <header> element
		expect(screen.getByRole('banner')).toBeInTheDocument();
		// children render inside <main> element
		expect(screen.getByRole('main')).toBeInTheDocument();
	});
	// test that rounded corners are applied by default
	it('applies rounded-3xl by default', () => {
		render(
			<DashboardShell data-testid="shell">
				<p>Content</p>
			</DashboardShell>,
		);
		expect(screen.getByTestId('shell')).toHaveClass('rounded-3xl');
	});
	// test that rounded corners can be disabled
	it('does not apply rounded-3xl when rounded is false', () => {
		render(
			<DashboardShell data-testid="shell" rounded={false}>
				<p>Content</p>
			</DashboardShell>,
		);
		expect(screen.getByTestId('shell')).not.toHaveClass('rounded-3xl');
	});
	// test that headerClassName is applied
	it('applies headerClassName to the header element', () => {
		render(
			<DashboardShell header={<span>Nav</span>} headerClassName="custom-header">
				<p>Content</p>
			</DashboardShell>,
		);
		expect(screen.getByRole('banner')).toHaveClass('custom-header');
	});
	// test that contentClassName is applied
	it('applies contentClassName to the main element', () => {
		render(
			<DashboardShell contentClassName="custom-content">
				<p>Content</p>
			</DashboardShell>,
		);
		expect(screen.getByRole('main')).toHaveClass('custom-content');
	});
	// test responsive padding on header
	it('applies responsive padding to header', () => {
		render(
			<DashboardShell header={<span>Nav</span>}>
				<p>Content</p>
			</DashboardShell>,
		);
		const header = screen.getByRole('banner');
		expect(header).toHaveClass('p-4');
		expect(header).toHaveClass('md:p-6');
		expect(header).toHaveClass('lg:p-8');
	});
	// test responsive padding on main
	it('applies responsive padding to main', () => {
		render(
			<DashboardShell>
				<p>Content</p>
			</DashboardShell>,
		);
		const main = screen.getByRole('main');
		expect(main).toHaveClass('p-4');
		expect(main).toHaveClass('md:p-6');
		expect(main).toHaveClass('lg:p-8');
	});
	// header and main use relative positioning without z-index so dropdowns can escape
	it('does not trap dropdowns with z-index on header or main', () => {
		render(
			<DashboardShell header={<span>Nav</span>}>
				<p>Content</p>
			</DashboardShell>,
		);
		const header = screen.getByRole('banner');
		const main = screen.getByRole('main');
		expect(header).toHaveClass('relative');
		expect(main).toHaveClass('relative');
		expect(header).not.toHaveClass('z-10');
		expect(main).not.toHaveClass('z-10');
	});
});
