import { describe, expect, test, vi } from 'vitest';

import { createSplTransferController, type SplTransferInput } from './splTransferController';

type MockSignature = `sig-${string}`;

function createHelper() {
	return {
		sendTransfer: vi.fn<[Required<SplTransferInput>], Promise<MockSignature>>().mockResolvedValue('sig-1'),
	} as unknown as Parameters<typeof createSplTransferController>[0]['helper'];
}

describe('createSplTransferController', () => {
	test('requires both authority and source owner', async () => {
		const helper = createHelper();
		const controller = createSplTransferController({ helper });
		await expect(
			controller.send({
				amount: 1n,
				destinationOwner: 'dest',
			} as SplTransferInput),
		).rejects.toThrow(/authority/);

		const controllerWithAuthority = createSplTransferController({
			authorityProvider: () => ({}) as SplTransferInput['authority'],
			helper,
		});
		await expect(
			controllerWithAuthority.send({
				amount: 1n,
				destinationOwner: 'dest',
			} as SplTransferInput),
		).rejects.toThrow(/source owner/);
	});

	test('falls back to provided authority and source owner', async () => {
		const helper = createHelper();
		const authority = {} as SplTransferInput['authority'];
		const sourceOwner = 'owner';
		const controller = createSplTransferController({
			authorityProvider: () => authority,
			helper,
			sourceOwnerProvider: () => sourceOwner,
		});
		await controller.send({
			amount: 2n,
			destinationOwner: 'dest',
		} as SplTransferInput);
		expect(helper.sendTransfer).toHaveBeenCalledWith(
			expect.objectContaining({ authority, sourceOwner }),
			undefined,
		);
	});

	test('tracks async state transitions', async () => {
		const helper = createHelper();
		const controller = createSplTransferController({
			authorityProvider: () => ({}) as SplTransferInput['authority'],
			helper,
			sourceOwnerProvider: () => 'owner',
		});
		const snapshots: string[] = [];
		const unsubscribe = controller.subscribe(() => {
			snapshots.push(controller.getState().status);
		});
		await controller.send({
			amount: 1n,
			destinationOwner: 'dest',
		} as SplTransferInput);
		controller.reset();
		unsubscribe();
		expect(snapshots).toEqual(['loading', 'success', 'idle']);
	});
});
