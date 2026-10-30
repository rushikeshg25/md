import type { Page } from '@playwright/test';

export async function shortcut(page: Page, key: string) {
    // ControlOrMeta uses the runner OS, which can differ from an emulated iPhone.
    // Match the browser's platform so CodeMirror receives the native shortcut.
    const apple = await page.evaluate(() =>
        /Mac|iPhone|iPad|iPod/.test(navigator.platform) || /iPhone|iPad|iPod/.test(navigator.userAgent));
    return `${apple ? 'Meta' : 'Control'}+${key}`;
}
