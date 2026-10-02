import type { Address } from '@solana/kit';
import type { ClassifiedTransaction } from 'tx-indexer';

export type DerivedDirection = 'sent' | 'received' | 'other';

function asNumber(value: number | bigint | null | undefined): number | null {
	if (value === null || value === undefined) return null;
	return typeof value === 'bigint' ? Number(value) : value;
}

export function getTransactionDirection(tx: ClassifiedTransaction, walletAddress?: Address): DerivedDirection {
	if (!walletAddress) return 'other';

	// Prefer legs if present because it captures more cases (swaps, protocol interactions, etc.)
	const legs = tx.legs;
	if (Array.isArray(legs)) {
		const walletLeg = legs.find((leg) => leg.accountId === walletAddress && leg.role !== 'fee');
		if (walletLeg) {
			return walletLeg.side === 'debit' ? 'sent' : 'received';
		}
	}

	const sender = tx.classification.sender;
	const receiver = tx.classification.receiver;

	if (sender && sender === walletAddress) return 'sent';
	if (receiver && receiver === walletAddress) return 'received';
	return 'other';
}

export function getCounterpartyAddress(tx: ClassifiedTransaction, walletAddress?: Address): string | null {
	if (tx.classification.counterparty?.address) return tx.classification.counterparty.address;

	const direction = getTransactionDirection(tx, walletAddress);
	const sender = tx.classification.sender;
	const receiver = tx.classification.receiver;

	if (direction === 'sent') return receiver ?? null;
	if (direction === 'received') return sender ?? null;
	return receiver ?? sender ?? null;
}

export type PrimaryAmount = NonNullable<ClassifiedTransaction['classification']['primaryAmount']>;

export function getPrimaryAmount(tx: ClassifiedTransaction): PrimaryAmount | null {
	return tx.classification.primaryAmount ?? null;
}

export function getBlockTimeSeconds(tx: ClassifiedTransaction): number | null {
	const blockTime = tx.tx.blockTime;
	return asNumber(blockTime);
}

export function formatTxDate(blockTimeSeconds: number | null, locale: string): string {
	if (!blockTimeSeconds) return '—';
	const date = new Date(blockTimeSeconds * 1000);
	return new Intl.DateTimeFormat(locale, {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
	}).format(date);
}

export function formatTokenAmount(amountUi: number, locale: string): string {
	return new Intl.NumberFormat(locale, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amountUi);
}

export function formatFiatAmount(amount: number, currency: string, locale: string): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}
