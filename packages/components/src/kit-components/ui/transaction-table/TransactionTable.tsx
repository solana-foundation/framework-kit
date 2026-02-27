import { Calendar, ListFilter } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { FilterDropdown } from './FilterDropdown';
import { TransactionRow } from './TransactionRow';
import { TransactionTableSkeleton } from './TransactionTableSkeleton';
import type {
	FilterDropdownOption,
	TransactionDateFilter,
	TransactionTableProps,
	TransactionTypeFilter,
} from './types';
import { getBlockTimeSeconds, getTransactionDirection } from './utils';

const DATE_OPTIONS: ReadonlyArray<FilterDropdownOption<TransactionDateFilter>> = [
	{ value: 'all', label: 'All time' },
	{ value: '7d', label: 'Last 7 days' },
	{ value: '30d', label: 'Last 30 days' },
	{ value: '90d', label: 'Last 90 days' },
];

const TYPE_OPTIONS: ReadonlyArray<FilterDropdownOption<TransactionTypeFilter>> = [
	{ value: 'all', label: 'All' },
	{ value: 'sent', label: 'Sent' },
	{ value: 'received', label: 'Received' },
];

function daysToSeconds(days: number): number {
	return days * 24 * 60 * 60;
}

function dateFilterToRangeSeconds(filter: TransactionDateFilter): number | null {
	switch (filter) {
		case '7d':
			return daysToSeconds(7);
		case '30d':
			return daysToSeconds(30);
		case '90d':
			return daysToSeconds(90);
		default:
			return null;
	}
}

/**
 * A transaction table component for displaying classified Solana transactions
 * with built-in date and type filtering, loading states, and theme support.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TransactionTable
 *   transactions={classifiedTransactions}
 *   walletAddress="6DMh...1DkK"
 * />
 *
 * // With controlled filters and view callback
 * <TransactionTable
 *   transactions={classifiedTransactions}
 *   walletAddress="6DMh...1DkK"
 *   dateFilter={dateFilter}
 *   onDateFilterChange={setDateFilter}
 *   typeFilter={typeFilter}
 *   onTypeFilterChange={setTypeFilter}
 *   onViewTransaction={(tx) => openExplorer(tx.tx.signature)}
 * />
 * ```
 */
export const TransactionTable: React.FC<TransactionTableProps> = ({
	transactions,
	walletAddress,
	isLoading = false,
	size = 'md',
	dateFilter: dateFilterProp,
	onDateFilterChange,
	dateFilterOptions = DATE_OPTIONS,
	typeFilter: typeFilterProp,
	onTypeFilterChange,
	typeFilterOptions = TYPE_OPTIONS,
	emptyMessage = 'No transactions yet',
	className,
	locale = 'en-US',
	onViewTransaction,
	renderRowAction,
}) => {
	const [internalDate, setInternalDate] = useState<TransactionDateFilter>('all');
	const [internalType, setInternalType] = useState<TransactionTypeFilter>('all');

	const dateFilter = dateFilterProp ?? internalDate;
	const typeFilter = typeFilterProp ?? internalType;

	const handleDateChange = (value: TransactionDateFilter) => {
		if (dateFilterProp === undefined) setInternalDate(value);
		onDateFilterChange?.(value);
	};

	const handleTypeChange = (value: TransactionTypeFilter) => {
		if (typeFilterProp === undefined) setInternalType(value);
		onTypeFilterChange?.(value);
	};

	const filteredTransactions = useMemo(() => {
		let txs = [...transactions];

		if (typeFilter !== 'all') {
			txs = txs.filter((tx) => getTransactionDirection(tx, walletAddress) === typeFilter);
		}

		const rangeSeconds = dateFilterToRangeSeconds(dateFilter);
		if (rangeSeconds !== null) {
			const nowSeconds = Math.floor(Date.now() / 1000);
			const minSeconds = nowSeconds - rangeSeconds;
			txs = txs.filter((tx) => {
				const blockTime = getBlockTimeSeconds(tx);
				return blockTime ? blockTime >= minSeconds : false;
			});
		}

		return txs;
	}, [transactions, typeFilter, walletAddress, dateFilter]);

	const containerStyles = cn('rounded-2xl border border-border bg-card', className);

	const headerRowStyles = cn(
		'grid grid-cols-4 items-center gap-6 border-b border-border px-4 py-2 text-xs font-normal text-muted-foreground',
	);

	return (
		<section className={containerStyles} aria-label="Transaction table">
			<div className={cn('flex items-center justify-end gap-2 px-4 py-2 text-foreground')}>
				<FilterDropdown
					icon={<Calendar className="size-3.5" aria-hidden="true" />}
					value={dateFilter}
					options={dateFilterOptions}
					onChange={handleDateChange}
				/>
				<FilterDropdown
					icon={<ListFilter className="size-3.5" aria-hidden="true" />}
					value={typeFilter}
					options={typeFilterOptions}
					onChange={handleTypeChange}
				/>
			</div>

			<div className={headerRowStyles}>
				<div>Type</div>
				<div>Time</div>
				<div>Address</div>
				<div>Amount</div>
			</div>

			{isLoading ? (
				<TransactionTableSkeleton size={size} />
			) : filteredTransactions.length === 0 ? (
				<div className={cn('px-4 py-10 text-center text-sm text-muted-foreground')}>{emptyMessage}</div>
			) : (
				<div className="overflow-hidden rounded-b-2xl">
					{filteredTransactions.map((tx) => (
						<TransactionRow
							key={String(tx.tx.signature)}
							tx={tx}
							walletAddress={walletAddress}
							size={size}
							locale={locale}
							onViewTransaction={onViewTransaction}
							renderRowAction={renderRowAction}
						/>
					))}
				</div>
			)}
		</section>
	);
};
