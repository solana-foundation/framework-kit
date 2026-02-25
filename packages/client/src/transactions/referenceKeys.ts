import type { Address, TransactionMessage } from '@solana/kit';
import { AccountRole, SOLANA_ERROR__INSTRUCTION_ERROR__GENERIC_ERROR, SolanaError } from '@solana/kit';

const MEMO_PROGRAM_ADDRESS = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

function ensureNonMemoInstructionIndex(instructions: TransactionMessage['instructions']): number {
	const index = instructions.findIndex((instruction) => instruction.programAddress !== MEMO_PROGRAM_ADDRESS);
	if (instructions.length === 0 || index === -1) {
		throw new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__GENERIC_ERROR, {
			cause: 'At least one non-memo instruction is required.',
			index: instructions.length || index,
		});
	}
	return index;
}

/**
 * Appends reference address metadata to the first non-memo instruction in a transaction.
 */
export function insertReferenceKey<T extends TransactionMessage>(reference: Address, transaction: T): T {
	return insertReferenceKeys([reference], transaction);
}

/**
 * Appends multiple reference addresses to the first non-memo instruction in a transaction.
 */
export function insertReferenceKeys<T extends TransactionMessage>(references: Address[], transaction: T): T {
	const index = ensureNonMemoInstructionIndex(transaction.instructions);
	const targetInstruction = transaction.instructions[index];
	const accounts = [
		...(targetInstruction.accounts ?? []),
		...references.map((address) => ({ address, role: AccountRole.READONLY })),
	];
	const updatedInstructions = [...transaction.instructions];
	updatedInstructions.splice(index, 1, { ...targetInstruction, accounts });
	return Object.freeze({
		...transaction,
		instructions: Object.freeze(updatedInstructions),
	}) as T;
}
