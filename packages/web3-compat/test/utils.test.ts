import {
	Keypair,
	Transaction,
	TransactionMessage,
	VersionedTransaction,
	LAMPORTS_PER_SOL as WEB3_LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { describe, expect, it, vi } from 'vitest';

import { compileFromCompat, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction } from '../src';

describe('utility helpers', () => {
	it('re-exports LAMPORTS_PER_SOL from web3.js', () => {
		expect(LAMPORTS_PER_SOL).toBe(WEB3_LAMPORTS_PER_SOL);
	});

	it('serializes legacy transactions to base64', () => {
		const payer = Keypair.generate();
		const recipient = Keypair.generate();
		const transaction = new Transaction();
		transaction.recentBlockhash = '11111111111111111111111111111111';
		transaction.feePayer = payer.publicKey;
		transaction.add(
			SystemProgram.transfer({
				fromPubkey: payer.publicKey,
				toPubkey: recipient.publicKey,
				lamports: 1,
			}),
		);
		transaction.sign(payer);

		const base64 = compileFromCompat(transaction);
		expect(typeof base64).toBe('string');
		expect(Buffer.from(base64, 'base64')).toBeInstanceOf(Buffer);
	});

	it('serializes versioned transactions to base64', () => {
		const payer = Keypair.generate();
		const recipient = Keypair.generate();
		const instructions = [
			SystemProgram.transfer({
				fromPubkey: payer.publicKey,
				toPubkey: recipient.publicKey,
				lamports: 5,
			}),
		];
		const message = new TransactionMessage({
			payerKey: payer.publicKey,
			recentBlockhash: '11111111111111111111111111111111',
			instructions,
		}).compileToV0Message();
		const versioned = new VersionedTransaction(message);
		versioned.sign([payer]);

		const base64 = compileFromCompat(versioned);
		expect(Buffer.from(base64, 'base64')).toBeInstanceOf(Buffer);
	});

	it('signs, sends, and confirms transactions using the provided connection', async () => {
		const payer = Keypair.generate();
		const recipient = Keypair.generate();
		const transaction = new Transaction({
			feePayer: payer.publicKey,
			recentBlockhash: '11111111111111111111111111111111',
		});
		transaction.add(
			SystemProgram.transfer({
				fromPubkey: payer.publicKey,
				toPubkey: recipient.publicKey,
				lamports: 2,
			}),
		);

		const mockSend = vi.fn().mockResolvedValue('MockSignature1111111111111111111111111111111111');
		const mockConfirm = vi.fn().mockResolvedValue({ value: { err: null } });
		const connection = {
			commitment: 'confirmed',
			sendRawTransaction: mockSend,
			confirmTransaction: mockConfirm,
		} as unknown as Parameters<typeof sendAndConfirmTransaction>[0];

		const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
			commitment: 'processed',
			skipPreflight: true,
		});

		expect(signature).toBe('MockSignature1111111111111111111111111111111111');
		expect(mockSend).toHaveBeenCalledTimes(1);
		expect(mockConfirm).toHaveBeenCalledWith('MockSignature1111111111111111111111111111111111', 'processed');
	});

	it('throws when confirmation reports an error', async () => {
		const payer = Keypair.generate();
		const transaction = new Transaction({
			feePayer: payer.publicKey,
			recentBlockhash: '11111111111111111111111111111111',
		});
		transaction.add(
			SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: payer.publicKey, lamports: 0 }),
		);

		const mockSend = vi.fn().mockResolvedValue('MockSignature1111111111111111111111111111111111');
		const mockConfirm = vi.fn().mockResolvedValue({ value: { err: { InstructionError: [0, 'CustomError'] } } });
		const connection = {
			commitment: 'confirmed',
			sendRawTransaction: mockSend,
			confirmTransaction: mockConfirm,
		} as unknown as Parameters<typeof sendAndConfirmTransaction>[0];

		await expect(() => sendAndConfirmTransaction(connection, transaction, [payer])).rejects.toThrow(
			'Transaction failed',
		);
	});
});
