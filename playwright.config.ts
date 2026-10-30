import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 2,
    timeout: 45000,
    expect: { timeout: 15000 },
    reporter: 'list',
    use: { baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
        { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
    ],
    webServer: { command: 'npm run start -- --port 3100', url: 'http://127.0.0.1:3100', reuseExistingServer: false, timeout: 60000 },
});
