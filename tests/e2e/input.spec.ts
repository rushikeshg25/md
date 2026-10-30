import { test, expect } from '@playwright/test';
import { shortcut } from './keyboard';

test('native keyboard input remains editable and persisted', async ({ page }) => {
    await page.goto('/');
    const editor = page.getByRole('textbox', { name: 'Markdown source', exact: true });
    await editor.click();
    await editor.press(await shortcut(page, 'A'));
    await page.keyboard.insertText('First bulk replacement');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('markdown-editor-draft') ?? '{}').content)).toBe('First bulk replacement');
    await editor.press(await shortcut(page, 'A'));
    await editor.pressSequentially('keyboard input');
    await expect(editor).toHaveText('keyboard input');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('markdown-editor-draft') ?? '{}').content)).toBe('keyboard input');
    await editor.press(await shortcut(page, 'A'));
    await page.keyboard.insertText('Inserted text\nwith two lines.');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('markdown-editor-draft') ?? '{}').content)).toBe('Inserted text\nwith two lines.');
});
