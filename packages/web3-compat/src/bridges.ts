import type { Address } from '@solana/addresses';
import { fromLegacyPublicKey, fromLegacyTransactionInstruction } from '@solana/compat';
import { AccountRole, createKeyPairSignerFromBytes, type Instruction, type KeyPairSigner } from '@solana/kit';
import { type Keypair, PublicKey, type PublicKeyInitData, TransactionInstruction } from '@solana/web3.js';

type WithOptionalExtractable = Readonly<{
	extractable?: boolean;
}>;

export type ToKitSignerConfig = WithOptionalExtractable;

export function toAddress<TAddress extends string = string>(input: PublicKey | PublicKeyInitData): Address<TAddress> {
	const pubkey = input instanceof PublicKey ? input : new PublicKey(input);
	return fromLegacyPublicKey(pubkey);
}

export function toPublicKey(input: Address | PublicKeyInitData): PublicKey {
	if (input instanceof PublicKey) {
		return input;
	}
	if (typeof input === 'string') {
		return new PublicKey(input);
	}
	return new PublicKey(input);
}

export async function toKitSigner(keypair: Keypair, config: ToKitSignerConfig = {}): Promise<KeyPairSigner> {
	const secretKey = new Uint8Array(64);
	secretKey.set(keypair.secretKey);
	secretKey.set(keypair.publicKey.toBytes(), 32);
	return await createKeyPairSignerFromBytes(secretKey, config.extractable ?? false);
}

export function toWeb3Instruction(kitInstruction: Instruction): TransactionInstruction {
	const keys =
		kitInstruction.accounts?.map((account) => {
			const role = account.role;
			const isSigner = role === AccountRole.READONLY_SIGNER || role === AccountRole.WRITABLE_SIGNER;
			const isWritable = role === AccountRole.WRITABLE || role === AccountRole.WRITABLE_SIGNER;
			return {
				isSigner,
				isWritable,
				pubkey: toPublicKey(account.address),
			};
		}) ?? [];

	const data = kitInstruction.data ? Buffer.from(kitInstruction.data) : Buffer.alloc(0);
	return new TransactionInstruction({
		data,
		keys,
		programId: toPublicKey(kitInstruction.programAddress),
	});
}

export function fromWeb3Instruction(legacyInstruction: TransactionInstruction): Instruction {
	return fromLegacyTransactionInstruction(legacyInstruction);
}
