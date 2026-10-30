import { useState, useRef, useEffect, useCallback } from 'react';

export const useResizable = (initialWidth = 50) => {
    const [width, setWidth] = useState(initialWidth);
    const containerRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{ cursor: string; userSelect: string } | null>(null);
    const resize = useCallback((value: number) => setWidth(Math.max(20, Math.min(80, value))), []);
    useEffect(() => {
        const move = (event: PointerEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (drag.current && rect?.width) resize(((event.clientX - rect.left) / rect.width) * 100);
        };
        const stop = () => {
            if (!drag.current) return;
            document.body.style.cursor = drag.current.cursor;
            document.body.style.userSelect = drag.current.userSelect;
            drag.current = null;
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', stop);
        window.addEventListener('pointercancel', stop);
        window.addEventListener('blur', stop);
        return () => {
            stop();
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', stop);
            window.removeEventListener('pointercancel', stop);
            window.removeEventListener('blur', stop);
        };
    }, [resize]);
    const startResizing = useCallback((event: React.PointerEvent) => {
        if (event.button !== 0) return;
        event.preventDefault();
        drag.current = { cursor: document.body.style.cursor, userSelect: document.body.style.userSelect };
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);
    const onResizeKey = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'ArrowLeft') resize(width - 5);
        else if (event.key === 'ArrowRight') resize(width + 5);
        else if (event.key === 'Home') resize(20);
        else if (event.key === 'End') resize(80);
        else return;
        event.preventDefault();
    }, [width, resize]);
    return { width, containerRef, startResizing, onResizeKey };
};
