// @vitest-environment jsdom

import type { SolanaClient } from '@solana/client';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createMockSolanaClient } from '../test/mocks';

import { SolanaClientProvider } from './context';
import { SolanaQueryProvider } from './QueryProvider';
import { useSolanaRpcQuery } from './query';

vi.mock('swr', async () => {
	const actual = await vi.importActual<typeof import('swr')>('swr');
	return {
		...actual,
		__esModule: true,
		default: vi.fn(),
	};
});

import useSWR, { type SWRConfiguration, useSWRConfig } from 'swr';

const useSWRMock = useSWR as unknown as vi.Mock;
let providerConfig: SWRConfiguration | undefined;

describe('useSolanaRpcQuery suspense configuration', () => {
	beforeEach(() => {
		useSWRMock.mockReset();
		providerConfig = undefined;
	});
	it('disables suspense by default', () => {
		const client = createMockSolanaClient();
		useSWRMock.mockReturnValue(createSWRMockResponse());

		render(
			<SolanaClientProvider client={client}>
				<SolanaQueryProvider>
					<TestQuery />
				</SolanaQueryProvider>
			</SolanaClientProvider>,
		);

		expect(useSWRMock).toHaveBeenCalled();
		const config = useSWRMock.mock.calls[0][2];
		expect(config?.suspense).toBe(false);
		expect(providerConfig?.dedupingInterval).toBe(2_000);
		expect(providerConfig?.focusThrottleInterval).toBe(5_000);
		expect(providerConfig?.revalidateIfStale).toBe(true);
		expect(providerConfig?.revalidateOnFocus).toBe(true);
		expect(providerConfig?.revalidateOnReconnect).toBe(true);
	});

	it('enables suspense when the provider opts in', () => {
		const client = createMockSolanaClient();
		useSWRMock.mockReturnValue(createSWRMockResponse());

		render(
			<SolanaClientProvider client={client}>
				<SolanaQueryProvider suspense>
					<TestQuery />
				</SolanaQueryProvider>
			</SolanaClientProvider>,
		);

		expect(useSWRMock).toHaveBeenCalled();
		const config = useSWRMock.mock.calls[0][2];
		expect(config?.suspense).toBe(true);
	});

	it('ignores provider suspense when the query is disabled', () => {
		const client = createMockSolanaClient();
		useSWRMock.mockReturnValue(createSWRMockResponse());

		render(
			<SolanaClientProvider client={client}>
				<SolanaQueryProvider suspense>
					<TestQuery disabled />
				</SolanaQueryProvider>
			</SolanaClientProvider>,
		);

		expect(useSWRMock).toHaveBeenCalledWith(
			null,
			expect.any(Function),
			expect.objectContaining({ suspense: false }),
		);
	});
});

function TestQuery({ disabled = false }: { disabled?: boolean }) {
	providerConfig = useSWRConfig();
	useSolanaRpcQuery('test-suspense', [], (_client: SolanaClient) => Promise.resolve('ok'), { disabled });
	return null;
}

function createSWRMockResponse() {
	return {
		data: undefined,
		error: undefined,
		isLoading: false,
		isValidating: false,
		mutate: vi.fn(),
	};
}
