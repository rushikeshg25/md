const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
export const exportFilename = (filename: string) => filename.replace(/\.(md|markdown|txt)$/i, '') + '.html';

export function buildHtmlDocument(title: string, body: string) {
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: http: data:; style-src 'unsafe-inline'; base-uri 'none'">
<title>${escapeHtml(title)}</title>
<style>
body{font:16px/1.65 system-ui,sans-serif;max-width:860px;margin:40px auto;padding:0 24px;color:#1f2937;background:#fff;overflow-wrap:anywhere}
h1,h2{border-bottom:1px solid #d1d9e0;padding-bottom:.3em}a{color:#0969da}img,svg{max-width:100%;height:auto}
pre{padding:16px;background:#f6f8fa;overflow:auto;border-radius:6px}code{font-family:ui-monospace,monospace;font-size:.9em}
:not(pre)>code{background:#f6f8fa;padding:.15em .3em}blockquote{margin:1em 0;padding:0 1em;border-left:4px solid #8b949e;color:#536174}
table{border-collapse:collapse;display:block;overflow:auto}th,td{border:1px solid #d1d9e0;padding:6px 13px}tr:nth-child(even){background:#f6f8fa}
.diagram-block{padding:16px;border:1px solid #d1d9e0;border-radius:6px;background:#fff}.diagram-block svg{background:#fff}
.diagram-block svg text,.diagram-block .label,.diagram-block foreignObject *{fill:#1f2937!important;color:#1f2937!important}
.diagram-block .node rect,.diagram-block .node polygon{fill:#f6f8fa!important;stroke:#536174!important}
.katex-display,math[display=block]{display:block;text-align:center;overflow:auto;margin:1em 0}
.hljs-keyword,.hljs-doctag{color:#cf222e}.hljs-string{color:#0a3069}.hljs-number,.hljs-literal{color:#0550ae}.hljs-title{color:#6639ba}.hljs-comment{color:#59636e}
.markdown-alert{border-left:4px solid #0969da;padding:.5em 1em;background:#f6f8fa}.markdown-alert-caution{border-color:#cf222e}.markdown-alert-warning{border-color:#9a6700}
@media print{body{margin:0;max-width:none}pre{white-space:pre-wrap}h1,h2,h3{break-after:avoid}img,svg{break-inside:avoid}}
</style></head><body><article>${body}</article></body></html>`;
}

/** Export only the already-sanitized rendered document, without editor controls. */
export function renderedDocumentHtml(article: HTMLElement): string {
    const clone = article.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('button, .diagram-block details').forEach(element => element.remove());
    // Native MathML makes equations portable without shipping KaTeX font files.
    clone.querySelectorAll('.katex').forEach(element => {
        const math = element.querySelector('math');
        if (math) {
            if (element.closest('.katex-display')) math.setAttribute('display', 'block');
            element.replaceWith(math.cloneNode(true));
        }
    });
    return clone.innerHTML;
}
