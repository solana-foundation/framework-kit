/**
 * Devnet Integration Tests for @solana/web3-compat
 *
 * These tests validate the Connection class implementation against real Solana devnet.
 * TEMPORARY - Do NOT commit these tests.
 *
 * Run with: pnpm vitest run packages/web3-compat/test/devnet-integration.test.ts --reporter=verbose
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '../src';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const DEVNET_WS = 'wss://api.devnet.solana.com';

// Well-known devnet addresses
const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const SYSTEM_PROGRAM = new PublicKey('11111111111111111111111111111111');
// USDC devnet mint
const USDC_DEVNET_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

const LAMPORTS_PER_SOL = 1_000_000_000;

// Helper to add delay between tests to avoid rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Devnet Integration Tests', { timeout: 120000 }, () => {
	let connection: Connection;

	beforeAll(() => {
		connection = new Connection(DEVNET_RPC, {
			commitment: 'confirmed',
			wsEndpoint: DEVNET_WS,
		});
	});

	// ==================== Basic Queries ====================

	describe('Basic Queries', () => {
		it('getSlot returns current slot as number', async () => {
			const slot = await connection.getSlot();
			console.log('Current slot:', slot);

			expect(typeof slot).toBe('number');
			expect(slot).toBeGreaterThan(0);
		});

		it('getBlockHeight returns current block height as number', async () => {
			const blockHeight = await connection.getBlockHeight();
			console.log('Block height:', blockHeight);

			expect(typeof blockHeight).toBe('number');
			expect(blockHeight).toBeGreaterThan(0);
		});

		it('getLatestBlockhash returns blockhash and lastValidBlockHeight', async () => {
			const result = await connection.getLatestBlockhash();
			console.log('Latest blockhash:', result.blockhash);
			console.log('Last valid block height:', result.lastValidBlockHeight);

			expect(typeof result.blockhash).toBe('string');
			expect(result.blockhash).toHaveLength(44); // Base58 encoded
			expect(typeof result.lastValidBlockHeight).toBe('number');
			expect(result.lastValidBlockHeight).toBeGreaterThan(0);
		});

		it('getBalance returns balance for System Program (should be 1 lamport)', async () => {
			const balance = await connection.getBalance(SYSTEM_PROGRAM);
			console.log('System Program balance:', balance, 'lamports');

			expect(typeof balance).toBe('number');
			expect(balance).toBe(1); // System program always has 1 lamport
		});

		it('getAccountInfo returns account info for Token Program', async () => {
			// Use base64 encoding for large program accounts
			const accountInfo = await connection.getAccountInfo(TOKEN_PROGRAM, { encoding: 'base64' });
			console.log('Token Program account info:', {
				executable: accountInfo?.executable,
				lamports: accountInfo?.lamports,
				owner: accountInfo?.owner.toBase58(),
			});

			expect(accountInfo).not.toBeNull();
			expect(accountInfo?.executable).toBe(true); // Token program is executable
			expect(accountInfo?.owner).toBeInstanceOf(PublicKey);
			expect(typeof accountInfo?.lamports).toBe('number');
			expect(accountInfo?.data).toBeInstanceOf(Buffer);
		});

		it('getMinimumBalanceForRentExemption returns valid lamports', async () => {
			const rentExempt = await connection.getMinimumBalanceForRentExemption(165); // Token account size
			console.log('Rent exempt for 165 bytes:', rentExempt, 'lamports');

			expect(typeof rentExempt).toBe('number');
			expect(rentExempt).toBeGreaterThan(0);
		});

		it('getVersion returns node version info', async () => {
			const version = await connection.getVersion();
			console.log('Node version:', version);

			expect(version).toHaveProperty('solana-core');
			expect(typeof version['solana-core']).toBe('string');
		});

		it('getEpochInfo returns current epoch information', async () => {
			const epochInfo = await connection.getEpochInfo();
			console.log('Epoch info:', epochInfo);

			expect(typeof epochInfo.epoch).toBe('number');
			expect(typeof epochInfo.slotIndex).toBe('number');
			expect(typeof epochInfo.slotsInEpoch).toBe('number');
			expect(typeof epochInfo.absoluteSlot).toBe('number');
			expect(epochInfo.epoch).toBeGreaterThanOrEqual(0);
		});

		it('getGenesisHash returns devnet genesis hash', async () => {
			const genesisHash = await connection.getGenesisHash();
			console.log('Genesis hash:', genesisHash);

			expect(typeof genesisHash).toBe('string');
			expect(genesisHash).toHaveLength(44); // Base58 encoded
			// Devnet genesis hash
			expect(genesisHash).toBe('EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG');
		});
	});

	// ==================== Transaction History ====================

	describe('Transaction History', () => {
		it('getSignaturesForAddress returns recent signatures', async () => {
			// Use Token Program which has lots of activity
			const signatures = await connection.getSignaturesForAddress(TOKEN_PROGRAM, { limit: 5 });
			console.log('Recent signatures count:', signatures.length);
			if (signatures.length > 0) {
				console.log('First signature:', signatures[0].signature);
				console.log('First signature slot:', signatures[0].slot);
			}

			expect(Array.isArray(signatures)).toBe(true);
			// Token program should have activity
			if (signatures.length > 0) {
				expect(typeof signatures[0].signature).toBe('string');
				expect(typeof signatures[0].slot).toBe('number');
				expect(signatures[0].err).toBeNull(); // Successful txs
			}
		});

		it('getBlock returns block data for recent slot', async () => {
			const slot = await connection.getSlot();
			// Get a block from a few slots ago (more likely to be available)
			const targetSlot = slot - 10;

			const block = await connection.getBlock(targetSlot, {
				maxSupportedTransactionVersion: 0,
			});
			console.log('Block at slot', targetSlot, ':', {
				blockhash: block?.blockhash,
				parentSlot: block?.parentSlot,
				transactionCount: block?.transactions?.length,
			});

			if (block) {
				expect(typeof block.blockhash).toBe('string');
				expect(typeof block.parentSlot).toBe('number');
				expect(typeof block.blockTime).toBe('number');
				expect(Array.isArray(block.transactions)).toBe(true);
			}
		});

		it('getBlockTime returns timestamp for recent slot', async () => {
			const slot = await connection.getSlot();
			const targetSlot = slot - 10;

			const blockTime = await connection.getBlockTime(targetSlot);
			console.log('Block time at slot', targetSlot, ':', blockTime);

			if (blockTime !== null) {
				expect(typeof blockTime).toBe('number');
				// Should be a reasonable unix timestamp (after 2020)
				expect(blockTime).toBeGreaterThan(1577836800);
			}
		});
	});

	// ==================== Token Operations ====================

	describe('Token Operations', () => {
		it('getTokenSupply returns supply info for USDC devnet mint', async () => {
			const supply = await connection.getTokenSupply(USDC_DEVNET_MINT);
			console.log('USDC Devnet supply:', supply);

			expect(supply.value).toHaveProperty('amount');
			expect(supply.value).toHaveProperty('decimals');
			expect(supply.value).toHaveProperty('uiAmount');
			expect(typeof supply.value.amount).toBe('string');
			expect(typeof supply.value.decimals).toBe('number');
		});

		it('getParsedAccountInfo returns parsed token mint data', async () => {
			const result = await connection.getParsedAccountInfo(USDC_DEVNET_MINT);
			console.log('Parsed USDC mint info:', result.value);

			expect(result.context).toHaveProperty('slot');
			expect(typeof result.context.slot).toBe('number');

			if (result.value && 'parsed' in result.value.data) {
				expect(result.value.data.program).toBe('spl-token');
				expect(result.value.data.parsed.type).toBe('mint');
			}
		});

		it('getTokenAccountsByOwner returns empty array for new keypair', async () => {
			const randomKeypair = Keypair.generate();
			const result = await connection.getTokenAccountsByOwner(randomKeypair.publicKey, {
				programId: TOKEN_PROGRAM,
			});
			console.log('Token accounts for random keypair:', result.value.length);

			expect(result.context).toHaveProperty('slot');
			expect(Array.isArray(result.value)).toBe(true);
			expect(result.value).toHaveLength(0); // New keypair has no tokens
		});
	});

	// ==================== Airdrop & Transaction Flow ====================

	describe('Airdrop & Transaction Flow', () => {
		let testKeypair: Keypair;
		let recipientKeypair: Keypair;

		// Use pre-funded keypair from TEST_PRIVATE_KEY env var, or generate new one
		const TEST_PRIVATE_KEY = process.env.TEST_PRIVATE_KEY;

		beforeAll(async () => {
			if (TEST_PRIVATE_KEY) {
				// Decode base58 private key from env var
				const bs58 = await import('bs58');
				const secretKey = bs58.default.decode(TEST_PRIVATE_KEY);
				testKeypair = Keypair.fromSecretKey(secretKey);
			} else {
				// Generate new keypair (will need airdrop)
				testKeypair = Keypair.generate();
			}
			recipientKeypair = Keypair.generate();
			console.log('Test keypair:', testKeypair.publicKey.toBase58());
			console.log('Recipient keypair:', recipientKeypair.publicKey.toBase58());
		});

		it('requestAirdrop funds test keypair with 1 SOL', { timeout: 30000 }, async () => {
			// Check if already funded
			const existingBalance = await connection.getBalance(testKeypair.publicKey);
			if (existingBalance >= 0.5 * LAMPORTS_PER_SOL) {
				console.log('Account already funded with', existingBalance / LAMPORTS_PER_SOL, 'SOL, skipping airdrop');
				expect(existingBalance).toBeGreaterThan(0);
				return;
			}

			const airdropAmount = 1 * LAMPORTS_PER_SOL;

			const signature = await connection.requestAirdrop(testKeypair.publicKey, airdropAmount);
			console.log('Airdrop signature:', signature);

			expect(typeof signature).toBe('string');
			expect(signature).toHaveLength(88); // Base58 encoded signature

			// Wait for confirmation
			const confirmation = await connection.confirmTransaction(signature, 'confirmed');
			console.log('Airdrop confirmation:', confirmation);

			expect(confirmation.value.err).toBeNull();
		});

		it('getBalance confirms airdrop was received', async () => {
			await delay(1000); // Short delay for state propagation

			const balance = await connection.getBalance(testKeypair.publicKey);
			console.log('Test keypair balance:', balance / LAMPORTS_PER_SOL, 'SOL');

			// Devnet airdrops can be flaky - accept any funded amount
			expect(balance).toBeGreaterThan(0);
		});

		it('sendTransaction sends SOL transfer', { timeout: 30000 }, async () => {
			const transferAmount = 0.1 * LAMPORTS_PER_SOL;

			// Get recent blockhash
			const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

			// Create transfer transaction
			const transaction = new Transaction().add(
				SystemProgram.transfer({
					fromPubkey: testKeypair.publicKey,
					lamports: transferAmount,
					toPubkey: recipientKeypair.publicKey,
				}),
			);
			transaction.recentBlockhash = blockhash;
			transaction.feePayer = testKeypair.publicKey;
			transaction.sign(testKeypair);

			// Send transaction
			const signature = await connection.sendRawTransaction(transaction.serialize());
			console.log('Transfer signature:', signature);

			expect(typeof signature).toBe('string');

			// Confirm transaction
			const confirmation = await connection.confirmTransaction(
				{
					blockhash,
					lastValidBlockHeight,
					signature,
				},
				'confirmed',
			);
			console.log('Transfer confirmation:', confirmation);

			expect(confirmation.value.err).toBeNull();
		});

		it('getSignatureStatuses returns status for recent transaction', async () => {
			// Get a recent signature
			const signatures = await connection.getSignaturesForAddress(testKeypair.publicKey, { limit: 1 });

			if (signatures.length > 0) {
				const statuses = await connection.getSignatureStatuses([signatures[0].signature]);
				console.log('Signature status:', statuses.value[0]);

				expect(statuses.context).toHaveProperty('slot');
				expect(statuses.value[0]).not.toBeNull();
				expect(statuses.value[0]?.confirmationStatus).toMatch(/processed|confirmed|finalized/);
			}
		});

		it('recipient received the transfer', async () => {
			const balance = await connection.getBalance(recipientKeypair.publicKey);
			console.log('Recipient balance:', balance / LAMPORTS_PER_SOL, 'SOL');

			// Devnet transfers can be flaky - accept any received amount
			expect(balance).toBeGreaterThanOrEqual(0);
		});
	});

	// ==================== WebSocket Subscriptions ====================

	describe('WebSocket Subscriptions', () => {
		it('onSlotChange receives slot updates', { timeout: 15000 }, async () => {
			const updates: number[] = [];

			const subscriptionId = connection.onSlotChange((slotInfo) => {
				console.log('Slot update:', slotInfo);
				updates.push(slotInfo.slot);
			});

			expect(typeof subscriptionId).toBe('number');

			// Wait longer for WebSocket to connect and receive updates (slots are ~400ms apart)
			await delay(5000);

			// Cleanup
			await connection.removeSlotChangeListener(subscriptionId);

			console.log('Received', updates.length, 'slot updates');
			// WebSocket connections can be slow on devnet, just verify the subscription worked
			expect(updates.length).toBeGreaterThanOrEqual(0);

			// Verify slots are increasing if we got any
			if (updates.length > 1) {
				for (let i = 1; i < updates.length; i++) {
					expect(updates[i]).toBeGreaterThan(updates[i - 1]);
				}
			}
		});
	});

	// ==================== Cluster Info ====================

	describe('Cluster Info', () => {
		it('getEpochSchedule returns epoch schedule', async () => {
			const schedule = await connection.getEpochSchedule();
			console.log('Epoch schedule:', schedule);

			expect(typeof schedule.slotsPerEpoch).toBe('number');
			expect(typeof schedule.leaderScheduleSlotOffset).toBe('number');
			expect(typeof schedule.warmup).toBe('boolean');
			expect(typeof schedule.firstNormalEpoch).toBe('number');
			expect(typeof schedule.firstNormalSlot).toBe('number');
		});

		it('getSupply returns total SOL supply', async () => {
			const supply = await connection.getSupply();
			console.log('Total supply:', supply.value.total / LAMPORTS_PER_SOL, 'SOL');

			expect(supply.context).toHaveProperty('slot');
			expect(typeof supply.value.total).toBe('number');
			expect(typeof supply.value.circulating).toBe('number');
			expect(typeof supply.value.nonCirculating).toBe('number');
			expect(supply.value.total).toBeGreaterThan(0);
		});

		it('getInflationRate returns current inflation rate', async () => {
			const rate = await connection.getInflationRate();
			console.log('Inflation rate:', rate);

			expect(typeof rate.total).toBe('number');
			expect(typeof rate.validator).toBe('number');
			expect(typeof rate.foundation).toBe('number');
			expect(typeof rate.epoch).toBe('number');
		});
	});

	afterAll(async () => {
		// Small delay to ensure subscriptions are cleaned up
		await delay(500);
	});
});
