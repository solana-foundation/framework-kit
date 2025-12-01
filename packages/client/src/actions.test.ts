import type { Address, ClusterUrl, Lamports, SendableTransaction, Signature, Transaction } from '@solana/kit';
import type { TransactionWithLastValidBlockHeight } from '@solana/transaction-confirmation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	connectWallet,
	disconnectWallet,
	fetchAccount,
	fetchBalance,
	requestAirdrop,
	sendTransaction,
	setCluster,
} from './actions';
import type { AccountCacheEntry, ClientActions, SolanaClient } from './types';

describe('action wrappers', () => {
	let actions: ClientActions;
	let client: SolanaClient;
	let fetchAccountResult: AccountCacheEntry;
	let connectWalletMock: ReturnType<typeof vi.fn>;
	let disconnectWalletMock: ReturnType<typeof vi.fn>;
	let fetchBalanceMock: ReturnType<typeof vi.fn>;
	let fetchAccountMock: ReturnType<typeof vi.fn>;
	let requestAirdropMock: ReturnType<typeof vi.fn>;
	let sendTransactionMock: ReturnType<typeof vi.fn>;
	let setClusterMock: ReturnType<typeof vi.fn>;
	const address = 'address' as Address;
	const endpoint = 'https://rpc.test' as ClusterUrl;
	const websocketEndpoint = 'wss://rpc.test' as ClusterUrl;
	const lamports = 100n as Lamports;
	const signature = 'sig' as Signature;
	const airdropSignature = 'airdrop-sig' as Signature;
	const transaction = { lastValidBlockHeight: 1n } as SendableTransaction &
		Transaction &
		TransactionWithLastValidBlockHeight;

	beforeEach(() => {
		connectWalletMock = vi.fn(async () => undefined);
		disconnectWalletMock = vi.fn(async () => undefined);
		fetchBalanceMock = vi.fn(async () => lamports);
		fetchAccountMock = vi.fn(async () => fetchAccountResult);
		requestAirdropMock = vi.fn(async () => airdropSignature);
		sendTransactionMock = vi.fn(async () => signature);
		setClusterMock = vi.fn(async () => undefined);

		fetchAccountResult = {
			address,
			data: null,
			error: undefined,
			fetching: false,
			lamports,
			lastFetchedAt: 1,
			slot: 1n,
		};

		actions = {
			connectWallet: connectWalletMock,
			disconnectWallet: disconnectWalletMock,
			fetchAccount: fetchAccountMock,
			fetchBalance: fetchBalanceMock,
			requestAirdrop: requestAirdropMock,
			sendTransaction: sendTransactionMock,
			setCluster: setClusterMock,
		};

		client = { actions } as unknown as SolanaClient;
	});

	it('forwards parameters to client actions', async () => {
		await connectWallet(client, { connectorId: 'wallet', options: { autoConnect: true } });
		expect(connectWalletMock).toHaveBeenCalledWith('wallet', { autoConnect: true });

		await disconnectWallet(client);
		expect(disconnectWalletMock).toHaveBeenCalledWith();

		const balanceResult = await fetchBalance(client, { address, commitment: 'processed' });
		expect(fetchBalanceMock).toHaveBeenCalledWith(address, 'processed');
		expect(balanceResult).toBe(lamports);

		const accountResult = await fetchAccount(client, { address });
		expect(fetchAccountMock).toHaveBeenCalledWith(address, undefined);
		expect(accountResult).toBe(fetchAccountResult);

		const dropSignature = await requestAirdrop(client, { address, lamports });
		expect(requestAirdropMock).toHaveBeenCalledWith(address, lamports);
		expect(dropSignature).toBe(airdropSignature);

		const sentSignature = await sendTransaction(client, { commitment: 'finalized', transaction });
		expect(sendTransactionMock).toHaveBeenCalledWith(transaction, 'finalized');
		expect(sentSignature).toBe(signature);

		await setCluster(client, { endpoint, config: { commitment: 'processed', websocketEndpoint } });
		expect(setClusterMock).toHaveBeenCalledWith(endpoint, { commitment: 'processed', websocketEndpoint });
	});
});
