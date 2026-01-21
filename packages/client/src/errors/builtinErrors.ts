import type { ProgramErrorMapping } from './programErrors';

/**
 * Error mappings for the System Program.
 * @see https://github.com/solana-labs/solana/blob/master/sdk/program/src/system_instruction.rs
 */
export const SYSTEM_PROGRAM_ERRORS: ProgramErrorMapping = {
	0: 'Account already in use',
	1: 'Account data too small for instruction',
	2: 'Cannot assign account to this program id',
	3: 'Cannot allocate account data of this length',
	4: 'Invalid account data length',
	5: 'Account not associated with this nonce account',
	6: 'Nonce account not rent exempt',
	7: 'Advance nonce account without recent blockhash',
	8: 'Advance nonce account with separate blockhash',
	9: 'The account has too many addresses',
	10: 'Address is too long',
};

/**
 * Error mappings for the Token Program.
 * @see https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/error.rs
 */
export const TOKEN_PROGRAM_ERRORS: ProgramErrorMapping = {
	0: 'Lamport balance below rent-exempt threshold',
	1: 'Insufficient funds for the operation',
	2: 'Invalid mint authority',
	3: 'Mint token supply mismatch',
	4: 'Account owner mismatch',
	5: 'Fixed supply mint cannot mint more tokens',
	6: 'Account not associated with this mint',
	7: 'Invalid owner - expected the token program',
	8: 'Operation overflows u64',
	9: 'Invalid account state',
	10: 'Invalid instruction',
	11: 'Invalid mint decimals',
	12: 'Account already initialized',
	13: 'Account not initialized',
	14: 'Native token required',
	15: 'Non-native token required',
	16: 'Invalid seed for PDA',
	17: 'Account is frozen',
	18: 'Requested decimals exceeds maximum',
};

/**
 * Error mappings for the Token-2022 Program.
 * Inherits Token Program errors and adds additional ones.
 * @see https://github.com/solana-labs/solana-program-library/blob/master/token/program-2022/src/error.rs
 */
export const TOKEN_2022_PROGRAM_ERRORS: ProgramErrorMapping = {
	...TOKEN_PROGRAM_ERRORS,
	19: 'Mint required for instruction',
	20: 'Mint decimals mismatch',
	21: 'Non-transferable token',
	22: 'Extension type mismatch',
	23: 'Extension not initialized',
	24: 'Extension already initialized',
	25: 'Invalid extension combination',
	26: 'Extension type length mismatch',
	27: 'Account not rent exempt',
	28: 'Authority type not supported',
	29: 'CPI guard error',
	30: 'Permanent delegate mismatch',
	31: 'Account has permanent delegate',
	32: 'Invalid account',
	33: 'Timestamps out of order',
	34: 'Transfer fee basis points exceeded',
	35: 'Account has confidential transfer',
	36: 'Illegal owner',
};

/**
 * Error mappings for the Stake Program.
 * @see https://github.com/solana-labs/solana/blob/master/programs/stake/src/stake_instruction.rs
 */
export const STAKE_PROGRAM_ERRORS: ProgramErrorMapping = {
	0: 'Not enough credits to redeem',
	1: 'Lockup has not expired',
	2: 'Stake already deactivated',
	3: 'Stake account not delegated',
	4: 'Stake account already has a delegation',
	5: 'Custodian address mismatch',
	6: 'Custodian signature required',
	7: 'Insufficient stake for merge',
	8: 'Source stake account is merging',
	9: 'Stake account is merging',
	10: 'Minimum delegation requirement not met',
	11: 'Stake account with transient credits',
	12: 'Stake must be fully activated before split',
	13: 'Stake redelegation',
};

/**
 * Error mappings for the Compute Budget Program.
 * @see https://github.com/solana-labs/solana/blob/master/sdk/src/compute_budget.rs
 */
export const COMPUTE_BUDGET_PROGRAM_ERRORS: ProgramErrorMapping = {
	0: 'Invalid instruction',
	1: 'Duplicate instruction',
};

/**
 * Error mappings for the Associated Token Account Program.
 * @see https://github.com/solana-labs/solana-program-library/blob/master/associated-token-account/program/src/error.rs
 */
export const ASSOCIATED_TOKEN_PROGRAM_ERRORS: ProgramErrorMapping = {
	0: 'Invalid owner - expected system program',
	1: 'Invalid owner - account already exists',
};

/**
 * Known program addresses mapped to their error definitions.
 */
export const BUILTIN_PROGRAM_ERRORS: Record<string, ProgramErrorMapping> = {
	// System Program
	'11111111111111111111111111111111': SYSTEM_PROGRAM_ERRORS,
	// Token Program
	TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: TOKEN_PROGRAM_ERRORS,
	// Token 2022 Program
	TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: TOKEN_2022_PROGRAM_ERRORS,
	// Stake Program
	Stake11111111111111111111111111111111111111: STAKE_PROGRAM_ERRORS,
	// Compute Budget Program
	ComputeBudget111111111111111111111111111111: COMPUTE_BUDGET_PROGRAM_ERRORS,
	// Associated Token Account Program
	ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: ASSOCIATED_TOKEN_PROGRAM_ERRORS,
};
