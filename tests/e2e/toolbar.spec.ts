import { test, expect } from '@playwright/test';
import { THEMES, THEME_LABELS, isDarkTheme } from '../../lib/preferences';

// Include the phone, desktop, and single-row toolbar breakpoints.
test('toolbar actions fit narrow screens and extensions stay accessible without a separate bar', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('markdown-editor-draft', JSON.stringify({
        filename: 'a-very-long-document-name-that-must-not-push-controls-offscreen.md',
        content: '# Responsive toolbar\n\nKeep the editor usable.',
    })));
    await page.goto('/');
    for (const width of [320, 390, 768, 1280, 1599, 1600, 1920]) {
        await page.setViewportSize({ width, height: 800 });
        await expect(page.getByRole('button', { name: 'Command palette', exact: true })).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const maxHeight = width < 768 ? 190 : width < 1600 ? 90 : 48;
        await expect.poll(async () => (await page.locator('.toolbar').boundingBox())!.height,
            { message: `Compact toolbar height at ${width}px` }).toBeLessThanOrEqual(maxHeight);
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
    await expect(page.locator('.markdown-settings')).toHaveCount(0);
    expect((await page.locator('.workspace').boundingBox())!.height).toBeGreaterThan(200);
    await page.getByRole('button', { name: 'Command palette', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Command palette' });
    await dialog.getByRole('combobox').fill('Disable GitHub alerts');
    await dialog.getByRole('option', { name: 'Disable GitHub alerts', exact: true }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Command palette', exact: true }).click();
    await dialog.getByRole('combobox').fill('Enable GitHub alerts');
    await expect(dialog.getByRole('option', { name: 'Enable GitHub alerts', exact: true })).toContainText('Off');
    await page.keyboard.press('Escape');
    const table = page.getByRole('button', { name: 'Table', exact: true });
    await table.focus();
    await expect(table).toBeFocused();
    expect((await table.boundingBox())!.x).toBeGreaterThanOrEqual(0);
    expect((await table.boundingBox())!.x + (await table.boundingBox())!.width).toBeLessThanOrEqual(320);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('textbox', { name: 'Markdown source', exact: true })).toContainText('| Header |');
    await page.getByRole('button', { name: 'Command palette', exact: true }).click();
    await expect(dialog).toBeVisible();
    await page.setViewportSize({ width: 568, height: 320 });
    const footer = await page.locator('.command-footer').boundingBox();
    expect(footer!.y + footer!.height).toBeLessThanOrEqual(320);
    await expect(dialog.getByRole('combobox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
});

test('every theme persists and reaches toolbar, search, preview and command menu', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('markdown-editor-draft', JSON.stringify({
        filename: 'themes.md',
        content: '# Theme check\n\n```js\nconst theme = "GitHub";\n```\n\n```mermaid\ngraph TD\nA --> B\n```',
    })));
    await page.goto('/');
    const themePicker = page.getByRole('combobox', { name: 'Theme', exact: true });
    for (const theme of THEMES.filter(name => name !== 'system')) {
        await themePicker.selectOption(theme);
        await expect(page.locator('main')).toHaveAttribute('data-theme', theme);
        expect(await page.locator('main').evaluate(element => element.classList.contains('dark'))).toBe(isDarkTheme(theme));
        await page.getByRole('button', { name: 'Find and replace', exact: true }).click();
        await expect(page.locator('.cm-panels')).toBeVisible();
        const colors = await page.evaluate(() => {
            const bg = (selector: string) => getComputedStyle(document.querySelector(selector)!).backgroundColor;
            return { canvas: bg('main'), editor: bg('.cm-editor'), select: bg('select[aria-label="Theme"]'), search: bg('.cm-textfield'), toolbar: bg('.toolbar'), panel: bg('.cm-panels') };
        });
        expect(colors.editor).toBe(colors.canvas);
        expect(colors.select).toBe(colors.canvas);
        expect(colors.search).toBe(colors.canvas);
        expect(colors.panel).toBe(colors.toolbar);
        const contrast = await page.locator('.command-launch').evaluate(element => {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            const context = canvas.getContext('2d')!;
            const luminance = (color: string) => {
                context.fillStyle = color;
                context.fillRect(0, 0, 1, 1);
                const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => value / 255)
                    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
                return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
            };
            const style = getComputedStyle(element);
            const a = luminance(style.color), b = luminance(style.backgroundColor);
            return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
        });
        expect(contrast, `${theme} command button text contrast`).toBeGreaterThanOrEqual(4.5);
        await page.getByRole('button', { name: 'Command palette', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Command palette' });
        await expect(dialog).toHaveCSS('background-color', colors.canvas);
        await dialog.getByRole('combobox').fill(`${THEME_LABELS[theme]} theme`);
        await expect(dialog.getByRole('option', { name: `${THEME_LABELS[theme]} theme`, exact: true })).toContainText('Current');
        await page.keyboard.press('Escape');
        await page.getByRole('combobox', { name: 'View', exact: true }).selectOption('preview');
        await expect(page.locator('.diagram-block svg')).toHaveCount(1);
        for (const code of await page.locator('[data-document] pre > code').all()) {
            await expect(code).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        }
        await page.screenshot({ path: testInfo.outputPath(`${theme}.png`), fullPage: true });
        await page.reload();
        await expect(themePicker).toHaveValue(theme);
        await expect(page.locator('main')).toHaveAttribute('data-theme', theme);
    }
});
