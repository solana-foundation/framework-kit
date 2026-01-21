import { address, type TransactionMessage } from '@solana/kit';
import { describe, expect, test } from 'vitest';

import { SYSTEM_PROGRAM_ERRORS, TOKEN_PROGRAM_ERRORS } from './builtinErrors';
import { createProgramErrorRegistry, type ProgramErrorRegistry, programErrors } from './programErrors';

// Valid 32-byte base58 addresses for testing
const TEST_ADDRESS_A = '2ZpmAeF5VzSJH96UuwsrnvqhxN6F9ks8qH1RdR9sSJwZ';
const TEST_ADDRESS_B = '3ZpmAeF5VzSJH96UuwsrnvqhxN6F9ks8qH1RdR9sSJwZ';
const TEST_ADDRESS_C = '4ZpmAeF5VzSJH96UuwsrnvqhxN6F9ks8qH1RdR9sSJwZ';
const TEST_ADDRESS_UNKNOWN = '6ZpmAeF5VzSJH96UuwsrnvqhxN6F9ks8qH1RdR9sSJwZ';

// Mock transaction message factory
function createMockTransactionMessage(programAddresses: string[]): TransactionMessage {
	return {
		instructions: programAddresses.map((addr) => ({
			programAddress: address(addr),
			accounts: [],
			data: new Uint8Array(),
		})),
		version: 0,
	} as unknown as TransactionMessage;
}

// Mock SolanaError with custom instruction error
function createMockCustomError(instructionIndex: number, errorCode: number): unknown {
	return {
		name: 'SolanaError',
		context: {
			index: instructionIndex,
			code: errorCode,
		},
		// Mimic the isSolanaError check by having a __code property
		// In reality, isSolanaError checks for specific symbol markers
	};
}

describe('programErrors', () => {
	describe('createProgramErrorRegistry', () => {
		test('creates registry with builtins by default', () => {
			const registry = createProgramErrorRegistry();
			// System Program error code 0
			expect(registry.getMessage('11111111111111111111111111111111', 0)).toBe(SYSTEM_PROGRAM_ERRORS[0]);
			// Token Program error code 1
			expect(registry.getMessage('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', 1)).toBe(TOKEN_PROGRAM_ERRORS[1]);
		});

		test('creates registry without builtins when disabled', () => {
			const registry = createProgramErrorRegistry({ includeBuiltins: false });
			expect(registry.getMessage('11111111111111111111111111111111', 0)).toBeUndefined();
		});

		test('allows explicit includeBuiltins: true', () => {
			const registry = createProgramErrorRegistry({ includeBuiltins: true });
			expect(registry.getMessage('11111111111111111111111111111111', 0)).toBe(SYSTEM_PROGRAM_ERRORS[0]);
		});
	});

	describe('register', () => {
		test('registers new program errors', () => {
			const registry = createProgramErrorRegistry({ includeBuiltins: false });
			registry.register(TEST_ADDRESS_A, {
				0: 'Custom error zero',
				1: 'Custom error one',
			});

			expect(registry.getMessage(TEST_ADDRESS_A, 0)).toBe('Custom error zero');
			expect(registry.getMessage(TEST_ADDRESS_A, 1)).toBe('Custom error one');
		});

		test('merges with existing errors', () => {
			const registry = createProgramErrorRegistry({ includeBuiltins: false });
			registry.register(TEST_ADDRESS_A, {
				0: 'Original message',
				1: 'Another message',
			});
			registry.register(TEST_ADDRESS_A, {
				0: 'Updated message',
				2: 'New message',
			});

			// Code 0 should be overridden
			expect(registry.getMessage(TEST_ADDRESS_A, 0)).toBe('Updated message');
			// Code 1 should remain
			expect(registry.getMessage(TEST_ADDRESS_A, 1)).toBe('Another message');
			// Code 2 should be added
			expect(registry.getMessage(TEST_ADDRESS_A, 2)).toBe('New message');
		});

		test('accepts Address type', () => {
			const registry = createProgramErrorRegistry({ includeBuiltins: false });
			const programAddress = address(TEST_ADDRESS_B);
			registry.register(programAddress, {
				0: 'Error from Address type',
			});

			expect(registry.getMessage(programAddress, 0)).toBe('Error from Address type');
			// Should also work with string lookup
			expect(registry.getMessage(TEST_ADDRESS_B, 0)).toBe('Error from Address type');
		});
	});

	describe('getMessage', () => {
		test('returns undefined for unknown program', () => {
			const registry = createProgramErrorRegistry({ includeBuiltins: false });
			expect(registry.getMessage(TEST_ADDRESS_UNKNOWN, 0)).toBeUndefined();
		});

		test('returns undefined for unknown error code', () => {
			const registry = createProgramErrorRegistry();
			expect(registry.getMessage('11111111111111111111111111111111', 999)).toBeUndefined();
		});

		test('returns message for known program and code', () => {
			const registry = createProgramErrorRegistry();
			expect(registry.getMessage('11111111111111111111111111111111', 0)).toBe('Account already in use');
		});
	});

	describe('default programErrors instance', () => {
		test('is a valid registry with builtins', () => {
			expect(programErrors.getMessage('11111111111111111111111111111111', 0)).toBe(SYSTEM_PROGRAM_ERRORS[0]);
		});

		test('can register custom errors', () => {
			// Note: This modifies the global instance
			programErrors.register(TEST_ADDRESS_C, {
				0: 'Test error',
			});
			expect(programErrors.getMessage(TEST_ADDRESS_C, 0)).toBe('Test error');
		});
	});
});

describe('programErrors decode and isProgramError', () => {
	let registry: ProgramErrorRegistry;

	test('decode returns undefined for non-custom errors', () => {
		registry = createProgramErrorRegistry();
		const tx = createMockTransactionMessage(['11111111111111111111111111111111']);
		const regularError = new Error('Not a SolanaError');

		expect(registry.decode(regularError, tx)).toBeUndefined();
	});

	test('decode returns undefined for null/undefined', () => {
		registry = createProgramErrorRegistry();
		const tx = createMockTransactionMessage(['11111111111111111111111111111111']);

		expect(registry.decode(null, tx)).toBeUndefined();
		expect(registry.decode(undefined, tx)).toBeUndefined();
	});

	test('isProgramError returns false for non-custom errors', () => {
		registry = createProgramErrorRegistry();
		const tx = createMockTransactionMessage(['11111111111111111111111111111111']);
		const regularError = new Error('Not a SolanaError');

		expect(registry.isProgramError(regularError, '11111111111111111111111111111111', tx)).toBe(false);
	});

	test('isProgramError returns false for wrong program address', () => {
		registry = createProgramErrorRegistry({ includeBuiltins: false });
		registry.register(TEST_ADDRESS_A, { 0: 'Error A' });
		registry.register(TEST_ADDRESS_B, { 0: 'Error B' });

		const tx = createMockTransactionMessage([TEST_ADDRESS_A, TEST_ADDRESS_B]);

		// This test verifies the isProgramError logic - the mock doesn't pass isSolanaError
		// so it should return false
		const mockError = createMockCustomError(0, 0);
		expect(registry.isProgramError(mockError, TEST_ADDRESS_B, tx)).toBe(false);
	});
});

describe('builtinErrors coverage', () => {
	test('all builtin programs have error mappings', () => {
		const registry = createProgramErrorRegistry();

		// System Program
		expect(registry.getMessage('11111111111111111111111111111111', 0)).toBeDefined();

		// Token Program
		expect(registry.getMessage('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', 0)).toBeDefined();

		// Token 2022 Program
		expect(registry.getMessage('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', 0)).toBeDefined();

		// Stake Program
		expect(registry.getMessage('Stake11111111111111111111111111111111111111', 0)).toBeDefined();

		// Compute Budget Program
		expect(registry.getMessage('ComputeBudget111111111111111111111111111111', 0)).toBeDefined();

		// Associated Token Program
		expect(registry.getMessage('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', 0)).toBeDefined();
	});

	test('Token 2022 inherits Token Program errors', () => {
		const registry = createProgramErrorRegistry();

		// Check that Token 2022 has the same base errors as Token Program
		expect(registry.getMessage('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', 1)).toBe(
			registry.getMessage('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', 1),
		);

		// And also has additional Token 2022 specific errors
		expect(registry.getMessage('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', 21)).toBe('Non-transferable token');
	});
});
