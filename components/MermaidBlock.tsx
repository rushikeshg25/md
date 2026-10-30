"use client";

import { downloadFile } from '@/lib/storage';
import { useEffect, useId, useState } from 'react';

// Mermaid has global configuration. Serialize initialization and rendering together.
let renderQueue: Promise<unknown> = Promise.resolve();
interface RenderResult { chart: string; dark: boolean; svg?: string; error?: string }

export function MermaidBlock({ chart, isDarkMode }: { chart: string; isDarkMode: boolean }) {
    const id = `mermaid-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const [result, setResult] = useState<RenderResult | null>(null);
    const current = result?.chart === chart && result.dark === isDarkMode ? result : null;

    useEffect(() => {
        let cancelled = false;
        const timer = window.setTimeout(() => {
            renderQueue = renderQueue.catch(() => undefined).then(async () => {
                if (cancelled) return;
                const container = document.createElement('div');
                container.style.cssText = 'position:fixed;left:-10000px;top:0;visibility:hidden;';
                document.body.append(container);
                try {
                    const { default: mermaid } = await import('mermaid');
                    if (cancelled) return;
                    mermaid.initialize({
                        startOnLoad: false,
                        securityLevel: 'strict',
                        theme: isDarkMode ? 'dark' : 'neutral',
                        // Preserve existing diagrams across Mermaid 12's new defaults.
                        layout: 'dagre',
                        look: 'classic',
                        suppressErrorRendering: true,
                        maxTextSize: 50000,
                    });
                    const { svg } = await mermaid.render(id, chart, container);
                    if (!cancelled) setResult({ chart, dark: isDarkMode, svg });
                } catch {
                    if (!cancelled) setResult({ chart, dark: isDarkMode, error: 'Could not render this Mermaid diagram. Check the syntax below.' });
                } finally {
                    container.remove();
                }
            });
        }, 200);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [chart, isDarkMode, id]);

    return (
        <div className="diagram-block my-4 rounded border border-divider p-4" aria-label="Mermaid diagram" aria-busy={!current}>
            {!current && <p role="status">Rendering diagram…</p>}
            {current?.error && <p role="alert" className="text-red-500">{current.error}</p>}
            {current?.svg && <div className="overflow-x-auto flex justify-center" dangerouslySetInnerHTML={{ __html: current.svg }} />}
            {current?.svg && <button className="mt-2 text-sm text-muted print:hidden" onClick={() => downloadFile(current.svg!, 'diagram.svg', 'image/svg+xml')}>Download SVG</button>}
            <details className="mt-2 text-sm" open={!!current?.error}>
                <summary>Diagram source</summary>
                <pre><code>{chart}</code></pre>
            </details>
        </div>
    );
}
