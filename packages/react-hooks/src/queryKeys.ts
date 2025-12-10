import { stableStringify, toAddress, toAddressString } from '@solana/client';
import { getBase64EncodedWireTransaction, type SendableTransaction, type Transaction } from '@solana/kit';

import type { UseSignatureStatusOptions, UseSignatureStatusParameters } from './hooks';
import type {
	UseLatestBlockhashParameters,
	UseProgramAccountsParameters,
	UseSimulateTransactionParameters,
} from './queryHooks';

export type QueryKey = readonly unknown[];

export function getLatestBlockhashKey(params: UseLatestBlockhashParameters = {}): QueryKey {
	const { commitment = null, minContextSlot = null } = params;
	return ['latestBlockhash', commitment, normalizeBigint(minContextSlot)];
}

export function getProgramAccountsKey(params: UseProgramAccountsParameters = {}): QueryKey {
	const { programAddress, config } = params;
	const address = programAddress ? toAddress(programAddress) : undefined;
	const addressKey = address ? toAddressString(address) : null;
	const configKey = stableStringify(config ?? null);
	return ['programAccounts', addressKey, configKey];
}

export function getSimulateTransactionKey(params: UseSimulateTransactionParameters = {}): QueryKey {
	const { transaction, config } = params;
	const wire = transaction ? normalizeWire(transaction) : null;
	const configKey = stableStringify(config ?? null);
	return ['simulateTransaction', wire, configKey];
}

export function getSignatureStatusKey(params: UseSignatureStatusParameters | UseSignatureStatusOptions = {}): QueryKey {
	const { config, signature } = params as UseSignatureStatusParameters;
	const signatureKey = signature?.toString() ?? null;
	const configKey = JSON.stringify(config ?? null);
	return ['signatureStatus', signatureKey, configKey];
}

function normalizeBigint(value: bigint | number | null | undefined): bigint | null {
	if (value === undefined || value === null) return null;
	return typeof value === 'bigint' ? value : BigInt(Math.floor(value));
}

function normalizeWire(input: UseSimulateTransactionParameters['transaction']): string | null {
	if (!input) return null;
	if (typeof input === 'string') {
		return input;
	}
	return getBase64EncodedWireTransaction(input as SendableTransaction & Transaction);
}
