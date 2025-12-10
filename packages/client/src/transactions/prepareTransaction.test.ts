import type { GetLatestBlockhashApi, Rpc, SimulateTransactionApi } from '@solana/kit';
import {
	address,
	appendTransactionMessageInstruction,
	createTransactionMessage,
	pipe,
	SOLANA_ERROR__INSTRUCTION_ERROR__COMPUTATIONAL_BUDGET_EXCEEDED,
	SolanaError,
	setTransactionMessageFeePayer,
} from '@solana/kit';
import { COMPUTE_BUDGET_PROGRAM_ADDRESS, getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type PrepareTransactionMessage, prepareTransaction } from './prepareTransaction';

type MockRpcConfig = Readonly<{
	simulateError?: unknown;
	unitsConsumed?: number;
}>;

function createMockRpc(config: MockRpcConfig = {}) {
	const simulateSend = config.simulateError
		? vi.fn().mockRejectedValue(config.simulateError)
		: vi.fn().mockResolvedValue({ value: { unitsConsumed: config.unitsConsumed ?? 500_000 } });
	const simulateTransaction = vi.fn(() => ({ send: simulateSend }));
	const blockhashSend = vi.fn().mockResolvedValue({ value: { blockhash: 'abc', lastValidBlockHeight: 123n } });
	const getLatestBlockhash = vi.fn(() => ({ send: blockhashSend }));
	return {
		simulateTransaction,
		getLatestBlockhash,
	} as unknown as Rpc<GetLatestBlockhashApi & SimulateTransactionApi>;
}

const FEE_PAYER = address('11111111111111111111111111111111');
const PROGRAM_ADDRESS = address('So11111111111111111111111111111111111111112');

function createMessage(withInstruction = true): PrepareTransactionMessage {
	const baseInstruction = {
		programAddress: PROGRAM_ADDRESS,
		accounts: [],
		data: new Uint8Array([1]),
	};
	return pipe(
		createTransactionMessage({ version: 0 }),
		(message) => setTransactionMessageFeePayer(FEE_PAYER, message),
		(message) => (withInstruction ? appendTransactionMessageInstruction(baseInstruction, message) : message),
	) as PrepareTransactionMessage;
}

describe('prepareTransaction', () => {
	let rpc: Rpc<GetLatestBlockhashApi & SimulateTransactionApi>;

	beforeEach(() => {
		rpc = createMockRpc();
	});

	it('adds a compute unit instruction when missing', async () => {
		const transaction = createMessage();
		const prepared = await prepareTransaction({ rpc, transaction });
		const computeInstruction = prepared.instructions.find(
			(instruction) => instruction.programAddress === COMPUTE_BUDGET_PROGRAM_ADDRESS,
		);
		expect(computeInstruction).toBeTruthy();
		expect(rpc.simulateTransaction).toHaveBeenCalled();
	});

	it('bumps compute unit limit to the default floor when simulation estimates less', async () => {
		const transaction = createMessage();
		rpc = createMockRpc({ unitsConsumed: 10_000 });
		const prepared = await prepareTransaction({ rpc, transaction });
		const computeInstruction = prepared.instructions.find(
			(instruction) => instruction.programAddress === COMPUTE_BUDGET_PROGRAM_ADDRESS,
		);
		expect(computeInstruction).toEqual(getSetComputeUnitLimitInstruction({ units: 200_000 }));
	});

	it('caps the compute unit limit at the network maximum when simulation estimates higher usage', async () => {
		const transaction = createMessage();
		rpc = createMockRpc({ unitsConsumed: 2_000_000 });
		const prepared = await prepareTransaction({ rpc, transaction });
		const computeInstruction = prepared.instructions.find(
			(instruction) => instruction.programAddress === COMPUTE_BUDGET_PROGRAM_ADDRESS,
		);
		expect(computeInstruction).toEqual(getSetComputeUnitLimitInstruction({ units: 1_400_000 }));
	});

	it('falls back to the maximum compute limit when simulation runs out of budget', async () => {
		const transaction = createMessage();
		const error = new SolanaError(SOLANA_ERROR__INSTRUCTION_ERROR__COMPUTATIONAL_BUDGET_EXCEEDED);
		rpc = createMockRpc({ simulateError: error });
		const prepared = await prepareTransaction({ rpc, transaction });
		const computeInstruction = prepared.instructions.find(
			(instruction) => instruction.programAddress === COMPUTE_BUDGET_PROGRAM_ADDRESS,
		);
		expect(computeInstruction).toEqual(getSetComputeUnitLimitInstruction({ units: 1_400_000 }));
		expect(rpc.simulateTransaction).toHaveBeenCalled();
	});

	it('does not reset compute instruction unless requested', async () => {
		const base = createMessage(false);
		const computeInstruction = getSetComputeUnitLimitInstruction({ units: 100_000 });
		const transaction = appendTransactionMessageInstruction(computeInstruction, base) as PrepareTransactionMessage;
		await prepareTransaction({ rpc, transaction });
		expect(rpc.simulateTransaction).not.toHaveBeenCalled();
	});

	it('replaces compute instruction when reset is enabled', async () => {
		const base = createMessage(false);
		const computeInstruction = getSetComputeUnitLimitInstruction({ units: 100_000 });
		const transaction = appendTransactionMessageInstruction(computeInstruction, base) as PrepareTransactionMessage;
		const prepared = await prepareTransaction({ rpc, transaction, computeUnitLimitReset: true });
		expect(rpc.simulateTransaction).toHaveBeenCalled();
		const updatedInstruction = prepared.instructions.find(
			(instruction) => instruction.programAddress === computeInstruction.programAddress,
		);
		expect(updatedInstruction).toBeTruthy();
	});

	it('refreshes the latest blockhash when requested', async () => {
		const transaction = createMessage();
		const prepared = await prepareTransaction({ rpc, transaction });
		expect(prepared.lifetimeConstraint).toEqual({ blockhash: 'abc', lastValidBlockHeight: 123n });
	});

	it('invokes the optional log hook with a base64 wire transaction', async () => {
		const transaction = createMessage();
		const logRequest = vi.fn();
		await prepareTransaction({ rpc, transaction, logRequest });
		expect(logRequest).toHaveBeenCalledWith(expect.objectContaining({ base64WireTransaction: expect.any(String) }));
	});
});
