import { type PublicKey, TransactionInstruction, SystemProgram as Web3SystemProgram } from '@solana/web3.js';

type TransferParams = Readonly<{
	fromPubkey: PublicKey;
	lamports: number | bigint;
	toPubkey: PublicKey;
}>;

const TRANSFER_INSTRUCTION_INDEX = 2;

export const SystemProgram = Object.freeze({
	...Web3SystemProgram,
	transfer({ fromPubkey, toPubkey, lamports }: TransferParams): TransactionInstruction {
		const data = Buffer.alloc(12);
		data.writeUInt32LE(TRANSFER_INSTRUCTION_INDEX, 0);
		data.writeBigUInt64LE(BigInt(lamports), 4);
		return new TransactionInstruction({
			data,
			keys: [
				{ isSigner: true, isWritable: true, pubkey: fromPubkey },
				{ isSigner: false, isWritable: true, pubkey: toPubkey },
			],
			programId: Web3SystemProgram.programId,
		});
	},
});
