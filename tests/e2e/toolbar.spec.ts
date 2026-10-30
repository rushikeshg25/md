import { test, expect } from '@playwright/test';

// These widths include the smallest supported phone and the desktop breakpoint.
test('toolbar actions fit narrow screens and expanded settings leave room to edit', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('markdown-editor-draft', JSON.stringify({
        filename: 'a-very-long-document-name-that-must-not-push-controls-offscreen.md',
        content: '# Responsive toolbar\n\nKeep the editor usable.',
    })));
    await page.goto('/');
    for (const width of [320, 390, 768, 1280]) {
        await page.setViewportSize({ width, height: 800 });
        await expect(page.getByRole('button', { name: 'Command palette', exact: true })).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const bounds = await page.locator('.toolbar-file-actions button, .command-launch, .toolbar-selectors select').evaluateAll(elements => elements.map(element => {
            const rect = element.getBoundingClientRect();
            return { name: element.getAttribute('aria-label'), left: rect.left, right: rect.right };
        }));
        for (const box of bounds) {
            expect(box.left, box.name ?? '').toBeGreaterThanOrEqual(0);
            expect(box.right, box.name ?? '').toBeLessThanOrEqual(width);
        }
        await page.screenshot({ path: testInfo.outputPath(`toolbar-${width}.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 320, height: 568 });
    await page.locator('.markdown-settings summary').click();
    expect((await page.locator('.workspace').boundingBox())!.height).toBeGreaterThan(200);
    await page.getByRole('checkbox', { name: /^GitHub alerts/ }).uncheck();
    await expect(page.getByRole('checkbox', { name: /^GitHub alerts/ })).not.toBeChecked();
    await page.locator('.markdown-settings summary').click();
    await page.getByRole('button', { name: 'Command palette', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Command palette' });
    await expect(dialog).toBeVisible();
    await page.setViewportSize({ width: 568, height: 320 });
    const footer = await page.locator('.command-footer').boundingBox();
    expect(footer!.y + footer!.height).toBeLessThanOrEqual(320);
    await expect(dialog.getByRole('combobox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
});
