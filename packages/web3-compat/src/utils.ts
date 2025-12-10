import type {
	Commitment,
	Transaction as LegacyTransaction,
	VersionedTransaction as LegacyVersionedTransaction,
	SendOptions,
	Signer,
} from '@solana/web3.js';
import {
	VersionedTransaction as VersionedTransactionClass,
	LAMPORTS_PER_SOL as WEB3_LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import type { Connection } from './connection';

export const LAMPORTS_PER_SOL = WEB3_LAMPORTS_PER_SOL;

type SendAndConfirmOptions = SendOptions & {
	commitment?: Commitment;
};

function serializeTransactionBytes(input: LegacyTransaction | LegacyVersionedTransaction): Uint8Array {
	if (input instanceof VersionedTransactionClass) {
		return input.serialize();
	}
	return (input as LegacyTransaction).serialize({ requireAllSignatures: false });
}

export function compileFromCompat(transaction: LegacyTransaction | LegacyVersionedTransaction): string {
	const bytes = serializeTransactionBytes(transaction);
	return Buffer.from(bytes).toString('base64');
}

function applySigners(
	transaction: LegacyTransaction | LegacyVersionedTransaction,
	signers: readonly Signer[] = [],
): void {
	if (!signers.length) {
		return;
	}
	if (transaction instanceof VersionedTransactionClass) {
		transaction.sign([...signers]);
	} else {
		(transaction as LegacyTransaction).partialSign(...signers);
	}
}

export async function sendAndConfirmTransaction(
	connection: Connection,
	transaction: LegacyTransaction | LegacyVersionedTransaction,
	signers: readonly Signer[] = [],
	options: SendAndConfirmOptions = {},
): Promise<string> {
	applySigners(transaction, signers);
	const serialized = compileFromCompat(transaction);
	const raw = Buffer.from(serialized, 'base64');
	const signature = await connection.sendRawTransaction(raw, options);
	const commitment = options.commitment ?? connection.commitment ?? 'confirmed';
	const confirmation = await connection.confirmTransaction(signature, commitment);
	if (confirmation.value?.err) {
		throw new Error('Transaction failed');
	}
	return signature;
}
