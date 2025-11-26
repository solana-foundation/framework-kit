import type { ComponentProps } from 'react';

import { cn } from '../../lib/utils';

function Card({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot="card"
			className={cn(
				'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				'grid auto-rows-min items-start gap-1.5 px-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-3',
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: ComponentProps<'div'>) {
	return <div data-slot="card-title" className={cn('text-lg font-semibold leading-none', className)} {...props} />;
}

function CardDescription({ className, ...props }: ComponentProps<'div'>) {
	return <div data-slot="card-description" className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function CardAction({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-action"
			className={cn('col-span-full justify-self-start sm:col-auto sm:row-span-2 sm:justify-self-end', className)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
	return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-footer"
			className={cn('flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between', className)}
			{...props}
		/>
	);
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
