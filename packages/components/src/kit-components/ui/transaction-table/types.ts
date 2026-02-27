import type { Address } from '@solana/kit';
import type React from 'react';
import type { ClassifiedTransaction } from 'tx-indexer';

export type TransactionTableSize = 'sm' | 'md' | 'lg';

export type TransactionTypeFilter = 'all' | 'sent' | 'received';
export type TransactionDateFilter = 'all' | '7d' | '30d' | '90d';

export interface TransactionTableProps {
	/** Classified transactions (typically from useClassifiedTransactions). */
	transactions: ReadonlyArray<ClassifiedTransaction>;
	/** Wallet address used to classify direction (sent vs received). */
	walletAddress?: Address;
	/** Loading state. */
	isLoading?: boolean;
	/** Density/size. */
	size?: TransactionTableSize;
	/** Controlled date filter. */
	dateFilter?: TransactionDateFilter;
	/** Called when date filter changes. */
	onDateFilterChange?: (value: TransactionDateFilter) => void;
	/** Custom date filter options. Defaults to All time / 7d / 30d / 90d. */
	dateFilterOptions?: ReadonlyArray<FilterDropdownOption<TransactionDateFilter>>;
	/** Controlled type filter. */
	typeFilter?: TransactionTypeFilter;
	/** Called when type filter changes. */
	onTypeFilterChange?: (value: TransactionTypeFilter) => void;
	/** Custom type filter options. Defaults to All / Sent / Received. */
	typeFilterOptions?: ReadonlyArray<FilterDropdownOption<TransactionTypeFilter>>;
	/** Message shown when no transactions are available. */
	emptyMessage?: string;
	/** Additional classes for the container. */
	className?: string;
	/** Locale for formatting (default: en-US). */
	locale?: string;
	/** Called when the view icon is clicked on a row. Shows a view icon on each row when provided. */
	onViewTransaction?: (tx: ClassifiedTransaction) => void;
	/** Optional custom row action renderer. Overrides the default view icon when provided. */
	renderRowAction?: (tx: ClassifiedTransaction) => React.ReactNode;
}

export interface TransactionRowProps {
	tx: ClassifiedTransaction;
	walletAddress?: Address;
	size?: TransactionTableSize;
	locale?: string;
	onViewTransaction?: (tx: ClassifiedTransaction) => void;
	renderRowAction?: (tx: ClassifiedTransaction) => React.ReactNode;
	/** Additional CSS classes for the row container. */
	className?: string;
}

export interface TransactionTableSkeletonProps {
	size?: TransactionTableSize;
	rowCount?: number;
	className?: string;
}

export interface FilterDropdownOption<TValue extends string = string> {
	value: TValue;
	label: string;
}

export interface FilterDropdownProps<TValue extends string = string> {
	icon: React.ReactNode;
	value: TValue;
	options: ReadonlyArray<FilterDropdownOption<TValue>>;
	onChange: (value: TValue) => void;
	/** Additional CSS classes for the dropdown root. */
	className?: string;
}
