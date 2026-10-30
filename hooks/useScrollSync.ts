import { useRef, useCallback, useEffect } from 'react';
import { scrollFraction } from '@/lib/scroll';
type ScrollSource = 'editor' | 'preview';

export const useScrollSync = () => {
    const editorRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const sourceRef = useRef<ScrollSource | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const handleScroll = useCallback((source: ScrollSource, target: HTMLElement) => {
        if (sourceRef.current && sourceRef.current !== source) return;
        sourceRef.current = source;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => { sourceRef.current = null; }, 100);
        const destination = source === 'editor'
            ? previewRef.current
            : editorRef.current?.querySelector<HTMLElement>('.cm-scroller');
        if (destination) {
            destination.scrollTop = scrollFraction(target.scrollTop, target.scrollHeight, target.clientHeight)
                * Math.max(0, destination.scrollHeight - destination.clientHeight);
        }
    }, []);
    return { editorRef, previewRef, handleScroll };
};
