import { useState, type ReactNode } from 'react';
export function CodeBlock({ children, source }: { children: ReactNode; source: string }) {
    const [status, setStatus] = useState('Copy code');
    const copy = async () => {
        try { await navigator.clipboard.writeText(source); setStatus('Copied'); }
        catch { setStatus('Copy unavailable — select the code'); }
    };
    return <div className="code-block relative">
        <button className="code-copy absolute right-2 top-2 rounded border border-divider bg-surface px-2 py-1 text-xs text-content print:hidden" onClick={copy}>{status}</button>
        <pre>{children}</pre>
    </div>;
}
