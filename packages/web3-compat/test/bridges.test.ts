import { AccountRole, createSignableMessage, type Instruction, address as toKitAddress } from '@solana/kit';
import { Keypair, TransactionInstruction } from '@solana/web3.js';
import { describe, expect, it } from 'vitest';
import { toAddress, toKitSigner, toPublicKey, toWeb3Instruction } from '../src';

describe('bridge utilities', () => {
	it('converts PublicKey to kit Address and back', () => {
		const pubkey = Keypair.generate().publicKey;
		const kitAddress = toAddress(pubkey);
		expect(kitAddress.toString()).toBe(pubkey.toBase58());
		const roundTripped = toPublicKey(kitAddress);
		expect(roundTripped.equals(pubkey)).toBe(true);
	});

	it('creates kit signer from Keypair secret key bytes', async () => {
		const keypair = Keypair.generate();
		const signer = await toKitSigner(keypair);
		const message = createSignableMessage(new Uint8Array([1, 2, 3]));
		const [signatureDictionary] = await signer.signMessages([message]);
		expect(signatureDictionary[keypair.publicKey.toBase58()]).toBeDefined();
	});

	it('converts kit Instruction into web3.js TransactionInstruction', () => {
		const programId = Keypair.generate().publicKey;
		const writableSigner = Keypair.generate().publicKey;
		const readonlyAccount = Keypair.generate().publicKey;
		const instruction: Instruction = {
			programAddress: toKitAddress(programId.toBase58()),
			accounts: [
				{
					address: toKitAddress(writableSigner.toBase58()),
					role: AccountRole.WRITABLE_SIGNER,
				},
				{
					address: toKitAddress(readonlyAccount.toBase58()),
					role: AccountRole.READONLY,
				},
			],
			data: new Uint8Array([9, 8, 7]),
		};

		const web3Instruction = toWeb3Instruction(instruction);
		expect(web3Instruction).toBeInstanceOf(TransactionInstruction);
		expect(web3Instruction.programId.equals(programId)).toBe(true);
		expect(web3Instruction.keys).toHaveLength(2);
		expect(web3Instruction.keys[0]?.pubkey.equals(writableSigner)).toBe(true);
		expect(web3Instruction.keys[0]?.isWritable).toBe(true);
		expect(web3Instruction.keys[0]?.isSigner).toBe(true);
		expect(web3Instruction.keys[1]?.isWritable).toBe(false);
		expect(web3Instruction.keys[1]?.isSigner).toBe(false);
		expect(Buffer.from(web3Instruction.data).equals(Buffer.from([9, 8, 7]))).toBe(true);
	});
});
