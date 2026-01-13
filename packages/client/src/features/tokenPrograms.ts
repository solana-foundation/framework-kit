import { type Address, address, type Commitment } from '@solana/kit';
import { TOKEN_PROGRAM_ADDRESS } from '@solana-program/token';
import { TOKEN_2022_PROGRAM_ADDRESS } from '@solana-program/token-2022';

import type { SolanaClientRuntime } from '../rpc/types';

/**
 * Identifier for supported token programs.
 */
export type TokenProgramId = 'token' | 'token-2022';

/**
 * Result of detecting which token program owns a mint.
 */
export type TokenProgramDetectionResult = Readonly<{
	/** The program identifier ('token' or 'token-2022'). */
	programId: TokenProgramId;
	/** The program address. */
	programAddress: Address;
}>;

/**
 * Map of token program IDs to their addresses.
 */
export const TOKEN_PROGRAMS = {
	token: TOKEN_PROGRAM_ADDRESS,
	'token-2022': TOKEN_2022_PROGRAM_ADDRESS,
} as const;

// Re-export program addresses for convenience
export { TOKEN_PROGRAM_ADDRESS, TOKEN_2022_PROGRAM_ADDRESS };

/**
 * Detects which token program owns a mint account by examining its owner.
 *
 * @param runtime - The Solana client runtime with RPC connection.
 * @param mint - The mint account address to check.
 * @param commitment - Optional commitment level for the RPC call.
 * @returns The detected token program information.
 * @throws If the mint account doesn't exist or is owned by an unknown program.
 *
 * @example
 * ```ts
 * import { detectTokenProgram } from '@solana/client';
 *
 * const result = await detectTokenProgram(runtime, mintAddress);
 * if (result.programId === 'token-2022') {
 *   console.log('This is a Token 2022 mint');
 * }
 * ```
 */
export async function detectTokenProgram(
	runtime: SolanaClientRuntime,
	mint: Address,
	commitment?: Commitment,
): Promise<TokenProgramDetectionResult> {
	const { value: accountInfo } = await runtime.rpc
		.getAccountInfo(mint, {
			commitment,
			encoding: 'base64',
		})
		.send();

	if (!accountInfo) {
		throw new Error(
			`Mint account ${mint} does not exist. ` +
				`Provide an explicit tokenProgram when working with non-existent mints.`,
		);
	}

	const owner = accountInfo.owner;

	if (owner === TOKEN_PROGRAM_ADDRESS) {
		return { programId: 'token', programAddress: address(TOKEN_PROGRAM_ADDRESS) };
	}

	if (owner === TOKEN_2022_PROGRAM_ADDRESS) {
		return { programId: 'token-2022', programAddress: address(TOKEN_2022_PROGRAM_ADDRESS) };
	}

	throw new Error(`Mint ${mint} is owned by unknown program ${owner}. Expected Token Program or Token 2022 Program.`);
}

/**
 * Checks if an address is a known token program (Token or Token 2022).
 *
 * @param programAddress - The program address to check.
 * @returns True if the address is a known token program.
 */
export function isKnownTokenProgram(programAddress: Address | string): boolean {
	const addrStr = typeof programAddress === 'string' ? programAddress : programAddress;
	return addrStr === TOKEN_PROGRAM_ADDRESS || addrStr === TOKEN_2022_PROGRAM_ADDRESS;
}
