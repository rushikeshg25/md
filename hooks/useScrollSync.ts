import { useRef, useCallback } from 'react';

type ScrollSource = 'editor' | 'preview';

export const useScrollSync = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef<ScrollSource | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback((source: ScrollSource, e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (isScrolling.current && isScrolling.current !== source) return;

    isScrolling.current = source;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isScrolling.current = null;
    }, 100);

    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);

    if (source === 'editor' && previewRef.current) {
      previewRef.current.scrollTop = percentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    } else if (source === 'preview' && editorRef.current) {
      // Find the scroller within the editor wrapper (CodeMirror specific)
      const scroller = editorRef.current.querySelector('.cm-scroller');
      if (scroller) {
        scroller.scrollTop = percentage * (scroller.scrollHeight - scroller.clientHeight);
      }
    }
  }, []);

  return { editorRef, previewRef, handleScroll };
};
