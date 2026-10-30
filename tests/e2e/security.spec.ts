import { test, expect, type Locator } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function expectInertDocument(article: Locator) {
    await expect(article.locator('script, iframe, object, embed, form')).toHaveCount(0);
    const unsafeAttributes = await article.locator('*').evaluateAll(elements => elements.flatMap(element =>
        [...element.attributes].filter(attribute => /^on/i.test(attribute.name) ||
            (/^(href|xlink:href|src)$/i.test(attribute.name) && /^\s*(javascript|vbscript):/i.test(attribute.value)))
            .map(attribute => `${element.tagName} ${attribute.name}=${attribute.value}`)));
    expect(unsafeAttributes).toEqual([]);
}

test('responses prevent framing, MIME sniffing and referrer disclosure', async ({ request }) => {
    const response = await request.get('/');
    expect(response.ok()).toBe(true);
    const headers = response.headers();
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('no-referrer');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['content-security-policy']).toContain("object-src 'none'");
});

test('untrusted Markdown, math and Mermaid stay inert in preview and HTML export', async ({ page }) => {
    const content = [
        '# Untrusted document',
        '<script>document.documentElement.dataset.executed = "yes"</script>',
        '<img src="x" onerror="document.documentElement.dataset.executed = \'yes\'">',
        '[Unsafe link](javascript:alert%281%29)',
        '$\\href{javascript:alert(1)}{unsafe}$',
        '$x^2$',
        '```mermaid',
        '%%{init: {"securityLevel": "loose"}}%%',
        'graph TD',
        'A["<img src=x onerror=alert(1)>"] --> B[Safe node]',
        'click B "javascript:alert(1)"',
        '```',
    ].join('\n\n');
    const dialogs: string[] = [];
    page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.dismiss(); });
    await page.addInitScript(content => localStorage.setItem('markdown-editor-draft', JSON.stringify({
        filename: 'untrusted.md', content,
    })), content);
    await page.goto('/');
    await page.getByRole('combobox', { name: 'View', exact: true }).selectOption('preview');
    const article = page.locator('[data-document]');
    await expect(article.locator('.diagram-block svg')).toHaveCount(1);
    await expect(article.locator('.diagram-block [role=alert]')).toHaveCount(0);
    await expect(article.locator('.katex math')).toHaveCount(2);
    await expectInertDocument(article);
    // Strict mode permits links, but the loose-mode directive must not bypass URL sanitization.
    const diagramLink = article.locator('.diagram-block svg a');
    await expect(diagramLink).toHaveCount(1);
    expect(await diagramLink.evaluate(element => element.getAttribute('href') ?? element.getAttribute('xlink:href') ?? ''))
        .toMatch(/^(?:about:blank)?$/);
    await expect(page.locator('html')).not.toHaveAttribute('data-executed');
    expect(dialogs).toEqual([]);

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export HTML', exact: true }).click();
    const html = await readFile((await (await download).path())!, 'utf8');
    // Load the real export as a standalone document, with no app response headers.
    await page.route('**/security-export.html', route => route.fulfill({ contentType: 'text/html', body: html }));
    await page.goto('/security-export.html');
    await expect(page.locator('article h1')).toHaveText('Untrusted document');
    await expect(page.locator('article svg')).toHaveCount(1);
    await expect(page.locator('article math')).toHaveCount(2);
    await expectInertDocument(page.locator('article'));
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute('content', /default-src 'none'/);
    await expect(page.locator('html')).not.toHaveAttribute('data-executed');
    expect(dialogs).toEqual([]);
});
