/**
 * Adapter functions for converting between @solana/web3.js and @solana/kit types.
 */

import type { Address } from '@solana/addresses';
import type { Base64EncodedWireTransaction } from '@solana/transactions';
import {
	type AccountInfo,
	type DataSlice,
	type Commitment as LegacyCommitment,
	type ParsedAccountData,
	PublicKey,
	Transaction,
	VersionedTransaction,
} from '@solana/web3.js';

import { toAddress as toKitAddress } from '../bridges';
import type { KitParsedAccountData, NormalizedCommitment, RawTransactionInput, RpcAccount } from '../types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Default commitment level when none specified.
 */
export const DEFAULT_COMMITMENT: NormalizedCommitment = 'confirmed';

/**
 * Default configuration for transaction simulation.
 */
export const DEFAULT_SIMULATION_CONFIG = Object.freeze({
	encoding: 'base64' as const,
	replaceRecentBlockhash: true as const,
	sigVerify: false as const,
});

// ============================================================================
// Commitment Conversion
// ============================================================================

/**
 * Normalizes legacy commitment levels to modern equivalents.
 *
 * Maps deprecated commitment aliases:
 * - 'recent' → 'processed'
 * - 'singleGossip' → 'processed'
 * - 'single' → 'confirmed'
 * - 'max' → 'finalized'
 */
export function normalizeCommitment(commitment?: LegacyCommitment | null): NormalizedCommitment | undefined {
	if (commitment === undefined || commitment === null) {
		return undefined;
	}
	if (commitment === 'recent') {
		return 'processed';
	}
	if (commitment === 'singleGossip') {
		return 'processed';
	}
	if (commitment === 'single') {
		return 'confirmed';
	}
	if (commitment === 'max') {
		return 'finalized';
	}
	return commitment as NormalizedCommitment;
}

// ============================================================================
// Number/BigInt Conversion
// ============================================================================

/**
 * Converts number or bigint to bigint, handling undefined.
 */
export function toBigInt(value: number | bigint | undefined): bigint | undefined {
	if (value === undefined) return undefined;
	return typeof value === 'bigint' ? value : BigInt(Math.trunc(value));
}

/**
 * Converts bigint to number safely.
 */
export function toNumber(value: number | bigint): number {
	return typeof value === 'number' ? value : Number(value);
}

// ============================================================================
// Address Conversion
// ============================================================================

/**
 * Converts PublicKey or string to @solana/kit Address.
 */
export function toKitAddressFromInput(input: PublicKey | string): Address<string> {
	return toKitAddress(input instanceof PublicKey ? input : input);
}

// ============================================================================
// Account Conversion
// ============================================================================

/**
 * Converts RPC account data to web3.js AccountInfo format.
 */
export function toAccountInfo(info: RpcAccount, dataSlice?: DataSlice): AccountInfo<Buffer> {
	const { data, executable, lamports, owner, rentEpoch } = info;
	const [content, encoding] = Array.isArray(data) ? data : [data, 'base64'];
	let buffer = encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content);
	if (dataSlice) {
		const start = dataSlice.offset ?? 0;
		const end = start + (dataSlice.length ?? buffer.length);
		buffer = buffer.subarray(start, end);
	}
	return {
		data: buffer,
		executable,
		lamports: typeof lamports === 'number' ? lamports : Number(lamports),
		owner: new PublicKey(owner),
		rentEpoch: typeof rentEpoch === 'number' ? rentEpoch : Number(rentEpoch),
	};
}

/**
 * Converts @solana/kit account response to RpcAccount format.
 */
export function fromKitAccount(value: unknown): RpcAccount {
	const account = (value ?? {}) as Record<string, unknown>;
	const data = account.data as string | readonly [string, string] | undefined;
	const lamports = account.lamports as number | bigint | undefined;
	const ownerValue = account.owner as unknown;
	const rentEpoch = account.rentEpoch as number | bigint | undefined;
	const owner =
		typeof ownerValue === 'string'
			? ownerValue
			: ownerValue instanceof PublicKey
				? ownerValue.toBase58()
				: typeof ownerValue === 'object' && ownerValue !== null && 'toString' in ownerValue
					? String(ownerValue)
					: '11111111111111111111111111111111';
	return {
		data: data ?? ['', 'base64'],
		executable: Boolean(account.executable),
		lamports: lamports ?? 0,
		owner,
		rentEpoch: rentEpoch ?? 0,
	};
}

/**
 * Converts kit parsed account data to web3.js ParsedAccountData.
 */
export function toParsedAccountData(kitParsed: KitParsedAccountData): ParsedAccountData {
	return {
		parsed: kitParsed.data.parsed,
		program: kitParsed.data.program,
		space: kitParsed.data.space,
	};
}

/**
 * Converts kit account to web3.js AccountInfo with parsed or buffer data.
 */
export function toParsedAccountInfo(kitAccount: unknown): AccountInfo<Buffer | ParsedAccountData> {
	const account = (kitAccount ?? {}) as Record<string, unknown>;
	const executable = Boolean(account.executable);
	const lamports = account.lamports as number | bigint;
	const ownerValue = account.owner as unknown;
	const rentEpoch = account.rentEpoch as number | bigint | undefined;

	const owner =
		typeof ownerValue === 'string'
			? new PublicKey(ownerValue)
			: ownerValue instanceof PublicKey
				? ownerValue
				: typeof ownerValue === 'object' && ownerValue !== null && 'toString' in ownerValue
					? new PublicKey(String(ownerValue))
					: new PublicKey('11111111111111111111111111111111');

	const data = account.data as unknown;

	// Check if it's parsed data (object with parsed, program, space)
	if (typeof data === 'object' && data !== null && 'parsed' in data && 'program' in data) {
		return {
			data: toParsedAccountData({
				data: data as KitParsedAccountData['data'],
				executable,
				lamports,
				owner: owner.toBase58(),
				rentEpoch: rentEpoch ?? 0,
			}),
			executable,
			lamports: typeof lamports === 'number' ? lamports : Number(lamports),
			owner,
			rentEpoch:
				rentEpoch !== undefined ? (typeof rentEpoch === 'number' ? rentEpoch : Number(rentEpoch)) : undefined,
		};
	}

	// Otherwise treat as raw buffer
	const rawData = data as string | readonly [string, string] | undefined;
	const [content, encoding] = Array.isArray(rawData) ? rawData : [rawData ?? '', 'base64'];
	const buffer = encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content);

	return {
		data: buffer,
		executable,
		lamports: typeof lamports === 'number' ? lamports : Number(lamports),
		owner,
		rentEpoch:
			rentEpoch !== undefined ? (typeof rentEpoch === 'number' ? rentEpoch : Number(rentEpoch)) : undefined,
	};
}

// ============================================================================
// Transaction Conversion
// ============================================================================

/**
 * Converts raw transaction input to base64-encoded wire format.
 */
export function toBase64WireTransaction(
	raw: RawTransactionInput | Transaction | VersionedTransaction,
): Base64EncodedWireTransaction {
	if (raw instanceof Transaction || raw instanceof VersionedTransaction) {
		const bytes = raw.serialize({
			requireAllSignatures: false,
			verifySignatures: false,
		});
		return Buffer.from(bytes).toString('base64') as Base64EncodedWireTransaction;
	}
	if (raw instanceof Uint8Array) {
		return Buffer.from(raw).toString('base64') as Base64EncodedWireTransaction;
	}
	if (raw instanceof Buffer) {
		return raw.toString('base64') as Base64EncodedWireTransaction;
	}
	const uint8 = Uint8Array.from(raw as number[]);
	return Buffer.from(uint8).toString('base64') as Base64EncodedWireTransaction;
}
