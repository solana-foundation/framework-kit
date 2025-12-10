import type {
	GetLatestBlockhashApi,
	Rpc,
	SimulateTransactionApi,
	TransactionMessage,
	TransactionMessageWithBlockhashLifetime,
	TransactionMessageWithFeePayer,
} from '@solana/kit';
import {
	appendTransactionMessageInstruction,
	isSolanaError,
	SOLANA_ERROR__INSTRUCTION_ERROR__COMPUTATIONAL_BUDGET_EXCEEDED,
	setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit';
import { COMPUTE_BUDGET_PROGRAM_ADDRESS, getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';

import { transactionToBase64 } from './base64';

export type PrepareTransactionMessage = TransactionMessage & TransactionMessageWithFeePayer;

export type PrepareTransactionOptions<TMessage extends PrepareTransactionMessage> = Readonly<{
	transaction: TMessage;
	computeUnitLimitMultiplier?: number;
	computeUnitLimitReset?: boolean;
	blockhashReset?: boolean;
	logRequest?: (payload: { base64WireTransaction: string }) => void;
}>;

export type PrepareTransactionConfig<TMessage extends PrepareTransactionMessage> = PrepareTransactionOptions<TMessage> &
	Readonly<{
		rpc: Rpc<GetLatestBlockhashApi & SimulateTransactionApi>;
	}>;

const DEFAULT_COMPUTE_UNIT_LIMIT_MULTIPLIER = 1.1;
const DEFAULT_COMPUTE_UNIT_LIMIT = 200_000;
const MAX_COMPUTE_UNIT_LIMIT = 1_400_000;

function isComputeUnitLimitInstruction(
	instruction: Parameters<typeof appendTransactionMessageInstruction>[0],
): boolean {
	return (
		instruction.programAddress === COMPUTE_BUDGET_PROGRAM_ADDRESS && instruction.data?.[0] === 2 // ComputeBudgetInstruction.SetComputeUnitLimit
	);
}

function didExceedComputeBudget(error: unknown): boolean {
	let current: unknown = error;
	while (isSolanaError(current)) {
		if (isSolanaError(current, SOLANA_ERROR__INSTRUCTION_ERROR__COMPUTATIONAL_BUDGET_EXCEEDED)) {
			return true;
		}
		current = (current as { cause?: unknown }).cause;
	}
	return false;
}

async function estimateComputeUnits(
	rpc: Rpc<GetLatestBlockhashApi & SimulateTransactionApi>,
	transaction: PrepareTransactionMessage,
): Promise<number> {
	let target = transaction;
	const hasLifetime =
		(transaction as Partial<TransactionMessageWithBlockhashLifetime>).lifetimeConstraint !== undefined;
	if (!hasLifetime) {
		const latest = await rpc.getLatestBlockhash().send();
		target = setTransactionMessageLifetimeUsingBlockhash(
			latest.value,
			transaction,
		) as unknown as PrepareTransactionMessage & TransactionMessageWithBlockhashLifetime;
	}
	const base64Transaction = transactionToBase64(target);
	try {
		const { value } = await rpc
			.simulateTransaction(base64Transaction, {
				encoding: 'base64',
				replaceRecentBlockhash: false,
				sigVerify: false,
			})
			.send();
		return Number(value.unitsConsumed ?? 0) || 0;
	} catch (error) {
		if (didExceedComputeBudget(error)) {
			return MAX_COMPUTE_UNIT_LIMIT;
		}
		throw error;
	}
}

export async function prepareTransaction<TMessage extends PrepareTransactionMessage>(
	config: PrepareTransactionConfig<TMessage>,
): Promise<TMessage & TransactionMessageWithBlockhashLifetime> {
	const multiplier = config.computeUnitLimitMultiplier ?? DEFAULT_COMPUTE_UNIT_LIMIT_MULTIPLIER;
	const shouldResetBlockhash = config.blockhashReset !== false;
	const shouldResetComputeUnits = config.computeUnitLimitReset ?? false;

	let transaction = config.transaction;

	const computeLimitIndex = transaction.instructions.findIndex(isComputeUnitLimitInstruction);
	if (computeLimitIndex === -1 || shouldResetComputeUnits) {
		const unitsFromSimulation = await estimateComputeUnits(config.rpc, transaction);
		const estimatedUnits = unitsFromSimulation
			? Math.ceil(unitsFromSimulation * multiplier)
			: DEFAULT_COMPUTE_UNIT_LIMIT;
		const units = Math.min(
			MAX_COMPUTE_UNIT_LIMIT,
			Math.max(DEFAULT_COMPUTE_UNIT_LIMIT, Math.max(1, estimatedUnits)),
		);
		const instruction = getSetComputeUnitLimitInstruction({ units });
		if (computeLimitIndex === -1) {
			transaction = appendTransactionMessageInstruction(instruction, transaction) as unknown as TMessage;
		} else {
			const nextInstructions = [...transaction.instructions];
			nextInstructions.splice(computeLimitIndex, 1, instruction);
			transaction = Object.freeze({
				...transaction,
				instructions: Object.freeze(nextInstructions),
			}) as unknown as TMessage;
		}
	}

	let transactionHasLifetime =
		(transaction as Partial<TransactionMessageWithBlockhashLifetime>).lifetimeConstraint !== undefined;
	if (shouldResetBlockhash || !transactionHasLifetime) {
		const latest = await config.rpc.getLatestBlockhash().send();
		if (!transactionHasLifetime) {
			transaction = setTransactionMessageLifetimeUsingBlockhash(latest.value, transaction) as unknown as TMessage;
		} else if (shouldResetBlockhash) {
			transaction = Object.freeze({
				...transaction,
				lifetimeConstraint: latest.value,
			}) as unknown as TMessage & TransactionMessageWithBlockhashLifetime;
		}
		transactionHasLifetime = true;
	}

	if (config.logRequest) {
		config.logRequest({ base64WireTransaction: transactionToBase64(transaction) });
	}

	return transaction as TMessage & TransactionMessageWithBlockhashLifetime;
}
