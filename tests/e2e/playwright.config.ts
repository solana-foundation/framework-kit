import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E wallet connection tests.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: false, // Wallet tests need sequential execution
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1, // Single worker for wallet extension tests
    reporter: process.env.CI ? 'github' : 'html',
    timeout: 60_000, // Wallet interactions can be slow

    use: {
        baseURL: 'http://localhost:5174',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* Run the vite-react example app before tests */
    webServer: {
        command: 'pnpm --filter @solana/example-vite-react dev',
        url: 'http://localhost:5174',
        reuseExistingServer: !process.env.CI,
        cwd: '../../',
        timeout: 120_000,
    },
});
