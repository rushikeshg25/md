import { useEffect, useState, type RefObject } from 'react';
interface Heading { id: string; title: string; level: number }
export function DocumentOutline({ container, content }: { container: RefObject<HTMLDivElement | null>; content: string }) {
    const [headings, setHeadings] = useState<Heading[]>([]);
    useEffect(() => {
        // Read headings from the committed preview instead of parsing the document twice.
        const frame = requestAnimationFrame(() => {
            setHeadings(Array.from(container.current?.querySelectorAll<HTMLElement>('[data-document] :is(h1,h2,h3,h4,h5,h6)[id]') ?? [])
                .map(heading => ({ id: heading.id, title: heading.textContent ?? '', level: Number(heading.tagName[1]) })));
        });
        return () => cancelAnimationFrame(frame);
    }, [container, content]);
    if (!headings.length) return null;
    return <details className="document-outline mb-6 rounded border border-divider bg-surface p-3 text-sm print:hidden">
        <summary className="font-medium">On this page · {headings.length} headings</summary>
        <nav aria-label="Document outline" className="max-h-60 overflow-y-auto pt-2">
            {headings.map(heading => <a key={heading.id} href={`#${heading.id}`} className="block py-1 text-muted hover:text-content"
                style={{ paddingLeft: `${(heading.level - 1) * 12}px` }} onClick={event => {
                    event.preventDefault();
                    const target = document.getElementById(heading.id);
                    target?.scrollIntoView({ block: 'start' });
                }}>{heading.title}</a>)}
        </nav>
    </details>;
}
