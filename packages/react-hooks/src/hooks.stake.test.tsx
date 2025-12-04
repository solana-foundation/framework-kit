// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import { createAddress, createWalletSession } from '../test/fixtures';
import { act, renderHookWithClient, waitFor } from '../test/utils';

import { useStake } from './hooks';

describe('useStake hook', () => {
	it('delegates staking to the helper and tracks status', async () => {
		const session = createWalletSession();
		const validatorId = createAddress(100);
		const { client, result } = renderHookWithClient(() => useStake(validatorId), {
			clientOptions: {
				state: {
					wallet: {
						connectorId: session.connector.id,
						session,
						status: 'connected',
					},
				},
			},
		});

		expect(result.current.helper).toBe(client.stake);
		expect(result.current.status).toBe('idle');
		expect(result.current.signature).toBeNull();
		expect(result.current.validatorId).toBe(String(validatorId));

		await act(async () => {
			const signature = await result.current.stake({ amount: 1_000_000_000n });
			expect(signature).toBeDefined();
		});

		expect(client.stake.sendStake).toHaveBeenCalledWith(
			{ amount: 1_000_000_000n, authority: session, validatorId: String(validatorId) },
			undefined,
		);
		expect(result.current.status).toBe('success');
		expect(result.current.signature).not.toBeNull();
		expect(result.current.isStaking).toBe(false);

		act(() => {
			result.current.reset();
		});

		expect(result.current.signature).toBeNull();
		expect(result.current.status).toBe('idle');
	});

	it('throws when attempting to stake without an authority', async () => {
		const validatorId = createAddress(101);
		const { result } = renderHookWithClient(() => useStake(validatorId));
		await expect(
			act(async () => {
				await result.current.stake({ amount: 1_000_000_000n });
			}),
		).rejects.toThrowError('Connect a wallet or supply an `authority` before staking SOL.');
	});

	it('surfaces helper errors and preserves them until reset', async () => {
		const session = createWalletSession();
		const validatorId = createAddress(102);
		const failure = new Error('stake failed');
		const { client, result } = renderHookWithClient(() => useStake(validatorId), {
			clientOptions: {
				state: {
					wallet: {
						connectorId: session.connector.id,
						session,
						status: 'connected',
					},
				},
			},
		});

		client.stake.sendStake.mockRejectedValueOnce(failure);

		await act(async () => {
			await expect(result.current.stake({ amount: 2_000_000_000n })).rejects.toThrowError(failure);
		});

		await waitFor(() => {
			expect(result.current.status).toBe('error');
		});
		expect(result.current.error).toBe(failure);

		act(() => {
			result.current.reset();
		});

		expect(result.current.status).toBe('idle');
		expect(result.current.error).toBeNull();
	});

	it('properly normalizes validator ID', async () => {
		const session = createWalletSession();
		const validatorId = createAddress(103);
		const { result } = renderHookWithClient(() => useStake(validatorId), {
			clientOptions: {
				state: {
					wallet: {
						connectorId: session.connector.id,
						session,
						status: 'connected',
					},
				},
			},
		});

		expect(result.current.validatorId).toBe(String(validatorId));
	});

	it('tracks isStaking state during transaction', async () => {
		const session = createWalletSession();
		const validatorId = createAddress(104);
		const { result } = renderHookWithClient(() => useStake(validatorId), {
			clientOptions: {
				state: {
					wallet: {
						connectorId: session.connector.id,
						session,
						status: 'connected',
					},
				},
			},
		});

		expect(result.current.isStaking).toBe(false);

		let stakePromise: Promise<unknown> | undefined;
		act(() => {
			stakePromise = result.current.stake({ amount: 500_000_000n });
		});

		// During the stake operation, isStaking should be true
		await waitFor(() => {
			expect(result.current.isStaking).toBe(true);
		});

		if (!stakePromise) {
			throw new Error('stakePromise not initialized');
		}
		await stakePromise;

		// After completion, isStaking should be false
		expect(result.current.isStaking).toBe(false);
	});
});
