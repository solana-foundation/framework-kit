import { Keypair } from '@solana/web3.js';
import { describe, expect, it } from 'vitest';

import { SystemProgram } from '../src';

describe('SystemProgram', () => {
	it('encodes transfer instruction data correctly', () => {
		const fromPubkey = Keypair.generate().publicKey;
		const toPubkey = Keypair.generate().publicKey;
		const instruction = SystemProgram.transfer({ fromPubkey, toPubkey, lamports: 42 });

		expect(instruction.programId.equals(SystemProgram.programId)).toBe(true);
		expect(instruction.keys).toHaveLength(2);
		expect(instruction.keys[0]?.pubkey.equals(fromPubkey)).toBe(true);
		expect(instruction.keys[0]?.isSigner).toBe(true);
		expect(instruction.keys[0]?.isWritable).toBe(true);
		expect(instruction.keys[1]?.pubkey.equals(toPubkey)).toBe(true);
		expect(instruction.keys[1]?.isSigner).toBe(false);
		expect(instruction.keys[1]?.isWritable).toBe(true);

		expect(instruction.data.byteLength).toBe(12);
		expect(instruction.data.readUInt32LE(0)).toBe(2);
		expect(Number(instruction.data.readBigUInt64LE(4))).toBe(42);
	});
});
