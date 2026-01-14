import { expect, test } from '@jupyterlab/galata';

test.use({ autoGoto: false });

test.describe('Local dev mode', () => {
  test('should emit activation console message', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', message => logs.push(message.text()));

    await page.goto();

    expect(
      logs.filter(
        s => s === 'JupyterLab extension berdl-jupyterlab-coreui is activated!'
      )
    ).toHaveLength(1);
  });

  test('debug commands should be registered', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', message => logs.push(message.text()));

    await page.goto();
    await page.waitForFunction(() => (window as any).kbase !== undefined);

    expect(logs.some(s => s.includes('Debug commands'))).toBe(true);

    // Test showing and dismissing dialog (don't await - dialog promise resolves on close)
    await page.evaluate(() => void (window as any).kbase.showWarningDialog(5));
    const dialog = page.locator('.jp-Dialog');
    await expect(dialog).toBeVisible();

    await page.evaluate(() => (window as any).kbase.dismissDialog());
    await expect(dialog).not.toBeVisible();
  });
});

/**
 * Production mode tests mock the auth API to test token dialog states.
 * Uses __KBASE_DIALOG_TEST__ flag to bypass local dev detection.
 * Overrides waitForApplication since blocking dialogs prevent Launcher interaction.
 */
test.describe('Production mode (token dialogs)', () => {
  test.use({
    autoGoto: false,
    waitForApplication: async ({ baseURL }, use) => {
      await use(async page => {
        await page.waitForSelector('#jupyterlab-splash', { state: 'detached' });
      });
    }
  });

  const setupProductionMode = async (page: any, baseURL: string) => {
    await page.addInitScript(() => {
      (window as any).__KBASE_DIALOG_TEST__ = true;
    });
    return new URL(baseURL).hostname;
  };

  const setMockCookie = async (page: any, hostname: string) => {
    await page.context().addCookies([
      {
        name: 'kbase_session',
        value: 'mock-token',
        domain: hostname,
        path: '/'
      }
    ]);
  };

  const mockTokenApi = async (page: any, response: object) => {
    await page.route('**/services/auth/api/V2/token', (route: any) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  };

  test('should show no-token dialog when token is missing', async ({
    page,
    baseURL
  }) => {
    await setupProductionMode(page, baseURL!);

    await page.route('**/services/auth/api/V2/token', (route: any) => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });

    await page.goto(baseURL!);

    const dialog = page.locator('.jp-Dialog');
    await expect(dialog).toBeVisible({ timeout: 30000 });
    await expect(dialog.locator('.jp-Dialog-content')).toContainText(
      /authenticat/i
    );
  });

  test('should show warning dialog when token is expiring soon', async ({
    page,
    baseURL
  }) => {
    const hostname = await setupProductionMode(page, baseURL!);
    await setMockCookie(page, hostname);
    await mockTokenApi(page, {
      expires: Date.now() + 2 * 60 * 1000,
      user: 'testuser',
      type: 'Login'
    });

    await page.goto(baseURL!);

    const dialog = page.locator('.jp-Dialog');
    await expect(dialog).toBeVisible({ timeout: 30000 });
    await expect(dialog.locator('.jp-Dialog-content')).toContainText(
      /expir|session/i
    );
  });

  test('should show expired dialog when token is already expired', async ({
    page,
    baseURL
  }) => {
    const hostname = await setupProductionMode(page, baseURL!);
    await setMockCookie(page, hostname);
    await mockTokenApi(page, {
      expires: Date.now() - 1000,
      user: 'testuser',
      type: 'Login'
    });

    await page.goto(baseURL!);

    const dialog = page.locator('.jp-Dialog');
    await expect(dialog).toBeVisible({ timeout: 30000 });
    await expect(dialog.locator('.jp-Dialog-content')).toContainText(
      /expired/i
    );
  });

  test('should not show dialog when token is valid', async ({
    page,
    baseURL
  }) => {
    const hostname = await setupProductionMode(page, baseURL!);
    await setMockCookie(page, hostname);
    await mockTokenApi(page, {
      expires: Date.now() + 60 * 60 * 1000,
      user: 'testuser',
      type: 'Login'
    });

    await page.goto(baseURL!);
    await page.waitForSelector('.jp-Launcher', { timeout: 30000 });

    await expect(page.locator('.jp-Dialog')).not.toBeVisible();
  });
});
