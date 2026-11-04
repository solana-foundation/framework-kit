import type React from 'react';
import { cn } from '@/lib/utils';

export interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {
	// slot for optional header content like nav, wallet buttons, etc
	header?: React.ReactNode;
	// main content slot
	children?: React.ReactNode;
	// slot for showing the dot grid background pattern
	showDotGrid?: boolean;
	// additional class name for the header element
	headerClassName?: string;
	// additional class name for the main content element
	contentClassName?: string;
	// whether to apply rounded corners (default true)
	rounded?: boolean;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
	header,
	children,
	showDotGrid = true,
	headerClassName,
	contentClassName,
	rounded = true,
	className,
	...props
}) => {
	return (
		<div
			className={cn(
				'relative min-h-screen w-full flex flex-col',
				'bg-background',
				rounded && 'rounded-3xl',
				className,
			)}
			{...props}
		>
			{/* dot grid background pattern if enabled */}
			{showDotGrid && (
				<div
					className={cn(
						'absolute inset-0 pointer-events-none',
						'[background-image:radial-gradient(circle,_rgb(113_113_122_/_0.12)_1px,_transparent_1px)]',
						'[background-size:16px_16px]',
						rounded && 'rounded-3xl',
					)}
					aria-hidden="true"
				/>
			)}
			{/* header slot */}
			{header && (
				<header className={cn('relative flex items-center justify-between p-4 md:p-6 lg:p-8', headerClassName)}>
					{header}
				</header>
			)}
			{/* main content slot */}
			<main className={cn('relative flex-1 p-4 md:p-6 lg:p-8', contentClassName)}>{children}</main>
		</div>
	);
};
