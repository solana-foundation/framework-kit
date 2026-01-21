import type { Address, TransactionMessage } from '@solana/kit';
import { isSolanaError, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM } from '@solana/kit';

import { toAddressString } from '../utils/addressLike';
import { BUILTIN_PROGRAM_ERRORS } from './builtinErrors';

/**
 * Maps numeric error codes to human-readable error messages.
 * Error codes are typically u32 values from the on-chain program.
 */
export type ProgramErrorMapping = Record<number, string>;

/**
 * Decoded information about a program error.
 */
export type DecodedProgramError = Readonly<{
	/** The program address that emitted the error */
	programAddress: string;
	/** The numeric error code */
	code: number;
	/** Human-readable error message, or undefined if not found in registry */
	message: string | undefined;
	/** Index of the instruction that failed within the transaction */
	instructionIndex: number;
}>;

/**
 * Configuration options for creating a program error registry.
 */
export type ProgramErrorRegistryConfig = Readonly<{
	/** Whether to include built-in Solana program errors (default: true) */
	includeBuiltins?: boolean;
}>;

/**
 * Registry for program error mappings with decode and lookup utilities.
 */
export interface ProgramErrorRegistry {
	/**
	 * Register error mappings for a program.
	 * If the program already has registered errors, the new mappings are merged
	 * with existing ones (new values override existing ones for the same code).
	 *
	 * @param programAddress - The program's address (string or Address type)
	 * @param errors - Mapping of error codes to messages
	 */
	register(programAddress: Address | string, errors: ProgramErrorMapping): void;

	/**
	 * Get the error message for a specific program and error code.
	 *
	 * @param programAddress - The program's address
	 * @param code - The error code
	 * @returns The error message, or undefined if not found
	 */
	getMessage(programAddress: Address | string, code: number): string | undefined;

	/**
	 * Decode an error from a failed transaction.
	 * Extracts the program address, error code, and message from a SolanaError.
	 *
	 * @param error - The error to decode (typically from sendTransaction)
	 * @param transactionMessage - The transaction message that failed
	 * @returns Decoded error information, or undefined if not a custom program error
	 */
	decode(error: unknown, transactionMessage: TransactionMessage): DecodedProgramError | undefined;

	/**
	 * Check if an error is a specific program error.
	 *
	 * @param error - The error to check
	 * @param programAddress - The expected program address
	 * @param transactionMessage - The transaction message that failed
	 * @param code - Optional specific error code to match
	 * @returns True if the error matches the criteria
	 */
	isProgramError(
		error: unknown,
		programAddress: Address | string,
		transactionMessage: TransactionMessage,
		code?: number,
	): boolean;
}

/**
 * Creates a new program error registry.
 *
 * @param config - Optional configuration
 * @returns A new ProgramErrorRegistry instance
 *
 * @example
 * ```ts
 * const registry = createProgramErrorRegistry();
 *
 * // Register custom program errors
 * registry.register('MyProgram1111111111111111111111111111111', {
 *   0: 'Invalid input',
 *   1: 'Unauthorized',
 *   6000: 'Factory paused', // Anchor errors start at 6000
 * });
 *
 * // Decode an error
 * try {
 *   await sendTransaction(tx);
 * } catch (error) {
 *   const decoded = registry.decode(error, transactionMessage);
 *   if (decoded) {
 *     console.error(`Error ${decoded.code}: ${decoded.message}`);
 *   }
 * }
 * ```
 */
export function createProgramErrorRegistry(config?: ProgramErrorRegistryConfig): ProgramErrorRegistry {
	const includeBuiltins = config?.includeBuiltins !== false;
	const registry = new Map<string, ProgramErrorMapping>();

	// Initialize with built-in errors if enabled
	if (includeBuiltins) {
		for (const [address, errors] of Object.entries(BUILTIN_PROGRAM_ERRORS)) {
			registry.set(address, { ...errors });
		}
	}

	function register(programAddress: Address | string, errors: ProgramErrorMapping): void {
		const address = toAddressString(programAddress);
		const existing = registry.get(address);
		if (existing) {
			// Merge with existing, new values override
			registry.set(address, { ...existing, ...errors });
		} else {
			registry.set(address, { ...errors });
		}
	}

	function getMessage(programAddress: Address | string, code: number): string | undefined {
		const address = toAddressString(programAddress);
		return registry.get(address)?.[code];
	}

	function extractCustomError(error: unknown): { index: number; code: number } | undefined {
		// Walk the error chain to find the custom instruction error
		let current: unknown = error;
		while (current !== null && current !== undefined) {
			if (isSolanaError(current, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {
				// The error context contains the instruction index and error code
				const context = (current as { context?: { index?: number; code?: number } }).context;
				if (context && typeof context.index === 'number' && typeof context.code === 'number') {
					return { index: context.index, code: context.code };
				}
			}
			// Move to the cause if present
			current = (current as { cause?: unknown }).cause;
		}
		return undefined;
	}

	function decode(error: unknown, transactionMessage: TransactionMessage): DecodedProgramError | undefined {
		const extracted = extractCustomError(error);
		if (!extracted) {
			return undefined;
		}

		const { index, code } = extracted;
		const instruction = transactionMessage.instructions[index];
		if (!instruction) {
			return undefined;
		}

		const programAddress = toAddressString(instruction.programAddress);
		const message = getMessage(programAddress, code);

		return {
			programAddress,
			code,
			message,
			instructionIndex: index,
		};
	}

	function isProgramError(
		error: unknown,
		programAddress: Address | string,
		transactionMessage: TransactionMessage,
		code?: number,
	): boolean {
		const decoded = decode(error, transactionMessage);
		if (!decoded) {
			return false;
		}

		const expectedAddress = toAddressString(programAddress);
		if (decoded.programAddress !== expectedAddress) {
			return false;
		}

		if (code !== undefined && decoded.code !== code) {
			return false;
		}

		return true;
	}

	return {
		register,
		getMessage,
		decode,
		isProgramError,
	};
}

/**
 * Default program error registry with built-in Solana program errors.
 *
 * @example
 * ```ts
 * import { programErrors } from '@solana/client';
 *
 * // Register custom errors
 * programErrors.register('MyProgram111...', {
 *   0: 'Invalid input',
 *   6000: 'Anchor error',
 * });
 *
 * // Use in error handling
 * try {
 *   await sendTransaction(tx);
 * } catch (error) {
 *   const decoded = programErrors.decode(error, transactionMessage);
 *   if (decoded) {
 *     console.error(`${decoded.programAddress}: ${decoded.message ?? `Error ${decoded.code}`}`);
 *   }
 * }
 * ```
 */
export const programErrors: ProgramErrorRegistry = createProgramErrorRegistry();
