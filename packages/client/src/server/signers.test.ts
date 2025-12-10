import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bs58 from 'bs58';
import { describe, expect, it } from 'vitest';

import { loadKeypairFromBase58, loadKeypairFromBytes, loadKeypairFromFile, saveKeypairToFile } from './signers';

describe('server signers', () => {
	it('derives signer and expanded secret key from base58 input', async () => {
		const seed = Uint8Array.from({ length: 32 }, (_value, index) => index);
		const base58 = bs58.encode(seed);

		const keypair = await loadKeypairFromBase58(base58);

		expect(keypair.secretKey).toHaveLength(64);
		expect(keypair.base58SecretKey).toBe(bs58.encode(keypair.secretKey));
		expect(typeof keypair.signer.address.toString()).toBe('string');
	});

	it('saves and reloads keypairs in JSON format', async () => {
		const seed = Uint8Array.from({ length: 32 }, (_value, index) => index + 5);
		const keypair = await loadKeypairFromBytes(seed);

		const dir = await mkdtemp(join(tmpdir(), 'server-signers-'));
		const filePath = join(dir, 'kp.json');

		await saveKeypairToFile(filePath, { keypair });
		const reloaded = await loadKeypairFromFile(filePath);

		expect(reloaded.base58SecretKey).toBe(keypair.base58SecretKey);
		await rm(dir, { recursive: true, force: true });
	});
});
