export {
	ASSOCIATED_TOKEN_PROGRAM_ERRORS,
	BUILTIN_PROGRAM_ERRORS,
	COMPUTE_BUDGET_PROGRAM_ERRORS,
	STAKE_PROGRAM_ERRORS,
	SYSTEM_PROGRAM_ERRORS,
	TOKEN_2022_PROGRAM_ERRORS,
	TOKEN_PROGRAM_ERRORS,
} from './builtinErrors';
export {
	createProgramErrorRegistry,
	type DecodedProgramError,
	type ProgramErrorMapping,
	type ProgramErrorRegistry,
	type ProgramErrorRegistryConfig,
	programErrors,
} from './programErrors';
