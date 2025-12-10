import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { createKeyPairSignerFromBytes, createKeyPairSignerFromPrivateKeyBytes, type KeyPairSigner } from '@solana/kit';
import bs58 from 'bs58';

type PersistableKeypair = Readonly<{
	base58SecretKey: string;
	publicKey: Uint8Array;
	secretKey: Uint8Array;
	signer: KeyPairSigner;
}>;

type KeypairLoadOptions = Readonly<{
	extractable?: boolean;
}>;

function concatBytes(first: Uint8Array, second: Uint8Array): Uint8Array {
	const result = new Uint8Array(first.length + second.length);
	result.set(first, 0);
	result.set(second, first.length);
	return result;
}

async function exportPublicKeyBytes(signer: KeyPairSigner): Promise<Uint8Array> {
	const raw = await crypto.subtle.exportKey('raw', signer.keyPair.publicKey);
	return new Uint8Array(raw);
}

async function loadSignerFromBytes(bytes: Uint8Array, extractable: boolean): Promise<PersistableKeypair> {
	const normalized = new Uint8Array(bytes);
	if (normalized.length !== 32 && normalized.length !== 64) {
		throw new Error('Expected 32-byte private key or 64-byte secret key.');
	}
	const signer =
		normalized.length === 32
			? await createKeyPairSignerFromPrivateKeyBytes(normalized, extractable)
			: await createKeyPairSignerFromBytes(normalized, extractable);
	const publicKey = await exportPublicKeyBytes(signer);
	const secretKey = normalized.length === 64 ? normalized : concatBytes(normalized, publicKey);
	return {
		base58SecretKey: bs58.encode(secretKey),
		publicKey,
		secretKey,
		signer,
	};
}

function parseKeyMaterial(raw: string): Uint8Array {
	const trimmed = raw.trim();
	try {
		const parsed = JSON.parse(trimmed);
		if (Array.isArray(parsed)) {
			return new Uint8Array(parsed);
		}
	} catch {
		// fall through to base58 parsing below
	}
	try {
		return bs58.decode(trimmed);
	} catch {
		throw new Error('Could not parse key material. Expected a base58 string or JSON array.');
	}
}

async function ensureParentDir(path: string): Promise<void> {
	await fs.mkdir(dirname(path), { recursive: true });
}

export async function generateKeypair(options: KeypairLoadOptions = {}): Promise<PersistableKeypair> {
	const byteCount = 32;
	const seed = new Uint8Array(byteCount);
	crypto.getRandomValues(seed);
	return loadSignerFromBytes(seed, options.extractable ?? true);
}

export async function loadKeypairFromBytes(
	bytes: Uint8Array,
	options: KeypairLoadOptions = {},
): Promise<PersistableKeypair> {
	return loadSignerFromBytes(bytes, options.extractable ?? true);
}

export async function loadKeypairFromBase58(
	secret: string,
	options: KeypairLoadOptions = {},
): Promise<PersistableKeypair> {
	return loadSignerFromBytes(bs58.decode(secret), options.extractable ?? true);
}

export async function loadKeypairFromEnv(
	variableName: string,
	options: KeypairLoadOptions = {},
): Promise<PersistableKeypair> {
	const value = process.env[variableName];
	if (!value) {
		throw new Error(`Environment variable ${variableName} is not set.`);
	}
	return loadSignerFromBytes(parseKeyMaterial(value), options.extractable ?? true);
}

export async function loadKeypairFromFile(
	filePath: string,
	options: KeypairLoadOptions = {},
): Promise<PersistableKeypair> {
	const contents = await fs.readFile(filePath, 'utf8');
	return loadSignerFromBytes(parseKeyMaterial(contents), options.extractable ?? true);
}

export type SaveFormat = 'json' | 'base58';

export type SaveKeypairInput = Readonly<{
	format?: SaveFormat;
	keypair: Pick<PersistableKeypair, 'secretKey'> | PersistableKeypair;
}>;

export async function saveKeypairToFile(filePath: string, input: SaveKeypairInput): Promise<void> {
	const secretKey = new Uint8Array(input.keypair.secretKey);
	const format = input.format ?? 'json';
	const encoded = format === 'base58' ? bs58.encode(secretKey) : JSON.stringify(Array.from(secretKey));
	await ensureParentDir(filePath);
	await fs.writeFile(filePath, `${encoded}\n`, { encoding: 'utf8', mode: 0o600 });
}

export async function saveKeypairToEnvFile(
	envPath: string,
	variableName: string,
	input: SaveKeypairInput,
): Promise<void> {
	const secretKey = new Uint8Array(input.keypair.secretKey);
	const format = input.format ?? 'base58';
	const encoded = format === 'base58' ? bs58.encode(secretKey) : JSON.stringify(Array.from(secretKey));
	await ensureParentDir(envPath);
	await fs.appendFile(envPath, `${variableName}=${encoded}\n`, { encoding: 'utf8', mode: 0o600 });
}

export type ServerKeypair = PersistableKeypair;
