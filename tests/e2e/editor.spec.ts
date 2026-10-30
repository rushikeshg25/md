import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { TEMPLATES } from '../../lib/templates';

const source = (page: Page) => page.getByRole('textbox', { name: 'Markdown source', exact: true });
async function write(page: Page, text: string) {
    await page.getByRole('combobox', { name: 'View', exact: true }).selectOption('editor');
    await source(page).click();
    await source(page).press('ControlOrMeta+A');
    if (text) await page.keyboard.insertText(text);
    else await page.keyboard.press('Backspace');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('markdown-editor-draft') ?? '{}').content)).toBe(text);
}
async function preview(page: Page) {
    await page.getByRole('combobox', { name: 'View', exact: true }).selectOption('preview');
}

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(source(page)).toBeVisible();
});

test('empty drafts and toolbar changes survive reload; formatting supports undo', async ({ page }) => {
    await write(page, 'selected words');
    await source(page).press('ControlOrMeta+A');
    await page.getByRole('button', { name: 'Bold', exact: true }).click();
    await expect(source(page)).toHaveText('**selected words**');
    await source(page).press('ControlOrMeta+z');
    await expect(source(page)).toHaveText('selected words');
    await write(page, '');
    await page.reload();
    await expect(source(page)).toHaveText('');
    await page.getByRole('button', { name: 'Italic', exact: true }).click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('markdown-editor-draft') ?? '{}').content)).toBe('*italic* ');
    await page.reload();
    await expect(source(page)).toHaveText('*italic*');
});

test('themes persist, system follows OS, and narrow views stay full width', async ({ page, isMobile }, testInfo) => {
    const theme = page.getByRole('combobox', { name: 'Theme', exact: true });
    for (const name of ['light', 'dark', 'sepia', 'midnight']) {
        await theme.selectOption(name);
        await expect(page.locator('main')).toHaveAttribute('data-theme', name);
        const colors = await page.evaluate(() => [getComputedStyle(document.querySelector('.cm-editor')!).backgroundColor, getComputedStyle(document.querySelector('main')!).backgroundColor]);
        expect(colors[0]).toBe(colors[1]);
    }
    await page.reload();
    await expect(theme).toHaveValue('midnight');
    await theme.selectOption('system');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('main')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect.poll(() => page.evaluate(() => ({ theme: document.querySelector('main')?.getAttribute('data-theme'), darkPreference: matchMedia('(prefers-color-scheme: dark)').matches })) ).toEqual({ theme: 'light', darkPreference: false });
    if (isMobile) {
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        const box = await page.locator('.editor-pane').boundingBox();
        expect(box!.width).toBeGreaterThan(350);
        await preview(page);
        await expect(source(page)).toBeHidden();
        expect((await page.locator('.preview-pane').boundingBox())!.width).toBeGreaterThan(350);
    }
    await page.screenshot({ path: testInfo.outputPath('layout.png'), fullPage: true });
});

test('code blocks share one background across themes and print', async ({ page }, testInfo) => {
    await write(page, [
        'Inline `code` keeps its background.',
        '```\nEC2 instance: the virtual computer\nLinux: its operating system\n```',
        '```text\nEnvoy: a program running on that computer\nSecond line\n```',
        '```js\nconst proxy = "Envoy";\nconsole.log(proxy);\n```',
        '```diff\n- removed\n+ added\n```',
    ].join('\n\n'));
    await preview(page);
    const blocks = page.locator('[data-document] pre > code');
    await expect(blocks).toHaveCount(4);
    const transparent = 'rgba(0, 0, 0, 0)';
    for (const theme of ['light', 'dark', 'sepia', 'midnight']) {
        await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme);
        for (const block of await blocks.all()) {
            await expect(block).toHaveCSS('background-color', transparent);
        }
        await expect(page.locator('[data-document] p > code')).not.toHaveCSS('background-color', transparent);
        await expect(page.locator('[data-document] .hljs-addition')).not.toHaveCSS('background-color', transparent);
        await expect(page.locator('[data-document] .hljs-deletion')).not.toHaveCSS('background-color', transparent);
    }
    await page.screenshot({ path: testInfo.outputPath('code-backgrounds.png'), fullPage: true });
    await page.emulateMedia({ media: 'print' });
    for (const block of await blocks.all()) {
        await expect(block).toHaveCSS('background-color', transparent);
    }
});

test('reading mode hides editing controls and restores the previous view', async ({ page, isMobile }, testInfo) => {
    await write(page, '# Reading mode\n\nKeep **this document**.');
    const view = page.getByRole('combobox', { name: 'View', exact: true });
    for (const previous of isMobile ? ['editor', 'preview'] : ['editor', 'split', 'preview']) {
        await view.selectOption(previous);
        await view.selectOption('reading');
        await expect(page.locator('main')).toHaveAttribute('data-layout', 'preview');
        await expect(source(page)).toBeHidden();
        await expect(view).toBeHidden();
        await expect(page.getByRole('group', { name: 'Formatting', exact: true })).toBeHidden();
        await expect(page.getByText('Markdown extensions', { exact: true })).toBeHidden();
        await expect(page.locator('[data-document] h1')).toHaveText('Reading mode');
        await expect(page.locator('[data-document] strong')).toHaveText('this document');
        const exit = page.getByRole('button', { name: 'Exit reading mode', exact: true });
        await expect(exit).toBeFocused();
        const documentBox = await page.locator('[data-document]').boundingBox();
        expect(documentBox!.width).toBeLessThanOrEqual(900);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`reading-${previous}.png`), fullPage: true });
        if (previous === 'editor') await exit.click();
        else await page.keyboard.press('Escape');
        await expect(view).toHaveValue(previous);
        await expect(view).toBeFocused();
    }
    await view.selectOption('editor');
    await expect(source(page)).toContainText('Keep **this document**.');
    await source(page).press('ControlOrMeta+End');
    await page.keyboard.insertText(' Still editable.');
    await expect(source(page)).toContainText('Still editable.');
    await source(page).press('ControlOrMeta+z');
    await expect(source(page)).not.toContainText('Still editable.');
});

test('extension settings change rendering and persist', async ({ page }) => {
    await write(page, '# Example\n\n~~old~~\n\n$x^2$\n\n> [!NOTE]\n> Read this.');
    await preview(page);
    await expect(page.locator('[data-document] del')).toHaveText('old');
    await expect(page.locator('.katex')).toBeVisible();
    await expect(page.locator('.markdown-alert')).toContainText('Read this.');
    await page.getByText('Markdown extensions', { exact: true }).click();
    await page.getByRole('checkbox', { name: /^Math/ }).uncheck();
    await expect(page.locator('.katex')).toHaveCount(0);
    await page.getByRole('checkbox', { name: /^GitHub Markdown/ }).uncheck();
    await expect(page.locator('[data-document] del')).toHaveCount(0);
    await page.reload();
    await page.getByText('Markdown extensions', { exact: true }).click();
    await expect(page.getByRole('checkbox', { name: /^Math/ })).not.toBeChecked();
});

test('all diagram/chart templates render and invalid diagrams recover', async ({ page }) => {
    const diagrams = TEMPLATES.filter(item => item.source.startsWith('```mermaid'));
    await write(page, diagrams.map(item => `## ${item.label}\n\n${item.source}`).join('\n\n'));
    await preview(page);
    await expect(page.locator('.diagram-block svg')).toHaveCount(diagrams.length);
    await expect(page.locator('.diagram-block [role=alert]')).toHaveCount(0);
    await write(page, '```mermaid\ngraph ???\n```');
    await preview(page);
    await expect(page.locator('.diagram-block [role=alert]')).toBeVisible();
    await write(page, '```mermaid\ngraph TD\nA --> B\n```');
    await preview(page);
    await expect(page.locator('.diagram-block svg')).toHaveCount(1);
    await expect(page.locator('.diagram-block [role=alert]')).toHaveCount(0);
    await expect(page.locator('pre .diagram-block')).toHaveCount(0);
});

test('portable file fallback imports and downloads the original filename', async ({ page }) => {
    await page.evaluate(() => {
        Object.defineProperty(window, 'showOpenFilePicker', { value: undefined, configurable: true });
        Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true });
    });
    page.on('dialog', dialog => dialog.accept());
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Open file', exact: true }).click();
    await (await chooser).setFiles({ name: 'imported.md', mimeType: 'text/markdown', buffer: Buffer.from('# Imported\n\nKeep me.') });
    await expect(source(page)).toContainText('# Imported');
    await expect(page.locator('.document-status')).toContainText('imported.md');
    const download = page.waitForEvent('download');
    await source(page).press('ControlOrMeta+s');
    const file = await download;
    expect(file.suggestedFilename()).toBe('imported.md');
    expect(await readFile((await file.path())!, 'utf8')).toBe('# Imported\n\nKeep me.');
});

test('storage failures remain visible and do not erase the editor', async ({ page }) => {
    await page.evaluate(() => {
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
            if (key === 'markdown-editor-draft') throw new DOMException('Quota exceeded', 'QuotaExceededError');
            original.call(this, key, value);
        };
    });
    await source(page).click();
    await source(page).press('ControlOrMeta+A');
    await page.keyboard.insertText('Important unsaved document');
    await expect(page.getByRole('status')).toContainText('could not be saved');
    await expect(source(page)).toHaveText('Important unsaved document');
});

test('command palette traps focus, filters commands and restores focus', async ({ page }) => {
    const opener = page.getByRole('button', { name: 'Command palette', exact: true });
    await opener.click();
    const dialog = page.getByRole('dialog', { name: 'Command palette' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('combobox').fill('Line chart');
    await expect(dialog.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await source(page).click();
    await source(page).press('ControlOrMeta+k');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('combobox').fill('Pie chart');
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(source(page)).toContainText('pie showData');
});

test('outline, copy controls and external links work', async ({ page }) => {
    await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (text: string) => sessionStorage.setItem('copied', text) }, configurable: true });
    });
    await write(page, '# First\n\n' + 'Paragraph.\n\n'.repeat(80) + '## Second\n\n```js\nconst answer = 42;\n```\n\n[Website](https://example.com)');
    await preview(page);
    await page.locator('.document-outline summary').click();
    await page.getByRole('navigation', { name: 'Document outline' }).getByRole('link', { name: 'Second' }).click();
    await expect.poll(() => page.locator('.preview-pane > div').evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Copy code', exact: true }).click();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('copied'))).toBe('const answer = 42;\n');
    await expect(page.getByRole('link', { name: 'Website' })).toHaveAttribute('target', '_blank');
});

test('HTML export retains chart and math; print works with hidden preview', async ({ page, browserName }) => {
    await write(page, '# Export\n\n$x^2$\n\n```mermaid\ngraph TD\nA --> B\n```');
    await expect(page.locator('.diagram-block svg')).toHaveCount(1);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export HTML', exact: true }).click();
    const html = await readFile((await (await download).path())!, 'utf8');
    expect(html).toContain('<svg'); expect(html).toContain('<math');
    expect(html).not.toContain('<button'); expect(html).not.toContain('Diagram source');
    expect(html).not.toContain('/_next/');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.preview-pane')).toBeVisible();
    await expect(page.locator('.editor-pane')).toBeHidden();
    await expect(page.locator('.document-outline')).toBeHidden();
    expect(await page.locator('[data-document]').evaluate(element => getComputedStyle(element).color)).toBe('rgb(17, 17, 17)');
    if (browserName === 'chromium') expect((await page.pdf()).subarray(0, 4).toString()).toBe('%PDF');
});

test('resize is keyboard accessible; Zen mode has a visible exit', async ({ page, isMobile }) => {
    if (!isMobile) {
        const divider = page.getByRole('separator', { name: 'Resize editor' });
        await divider.focus();
        await page.keyboard.press('ArrowRight');
        await expect(divider).toHaveAttribute('aria-valuenow', '55');
        await page.keyboard.press('Home');
        await expect(divider).toHaveAttribute('aria-valuenow', '20');
    }
    await page.getByRole('button', { name: 'Zen mode', exact: true }).click();
    const exit = page.getByRole('button', { name: 'Exit Zen mode' });
    await expect(exit).toBeVisible();
    await exit.click();
    await expect(page.getByRole('button', { name: 'Zen mode', exact: true })).toBeVisible();
});

test('footnote reference and return links keep their anchors', async ({ page }) => {
    await write(page, '# References\n\nA claim[^a].\n\n[^a]: Source details.');
    await preview(page);
    const reference = page.locator('[data-footnote-ref]');
    await expect(reference).toHaveAttribute('id', 'user-content-fnref-a');
    await reference.click();
    await expect(page.locator('#user-content-fn-a')).toBeVisible();
    const back = page.locator('[data-footnote-backref]');
    await expect(back).toHaveAttribute('href', '#user-content-fnref-a');
    await back.click();
    await expect(reference).toBeVisible();
});

test('preview and editor scroll in both directions', async ({ page, isMobile }) => {
    await write(page, Array.from({ length: 80 }, (_, index) => `## Section ${index}\n\nParagraph text for section ${index}.\n`).join('\n'));
    if (isMobile) {
        await preview(page);
        await expect(page.locator('[data-document] h2')).toHaveCount(80);
        return;
    }
    await page.getByRole('combobox', { name: 'View', exact: true }).selectOption('split');
    const editor = page.locator('.cm-scroller');
    const pane = page.locator('.preview-pane > div');
    await editor.evaluate(element => { element.scrollTop = (element.scrollHeight - element.clientHeight) / 2; });
    await expect.poll(() => pane.evaluate(element => element.scrollTop / (element.scrollHeight - element.clientHeight))).toBeGreaterThan(0.4);
    // Wait for the mirrored scroll event to finish before testing the other direction.
    await page.waitForTimeout(150);
    await pane.evaluate(element => { element.scrollTop = element.scrollHeight - element.clientHeight; });
    await expect.poll(() => editor.evaluate(element => element.scrollTop / (element.scrollHeight - element.clientHeight))).toBeGreaterThan(0.9);
});
