"use client";

import { useState, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import { EditorSelection } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { openSearchPanel } from '@codemirror/search';
import { Maximize } from 'lucide-react';
import { buildHtmlDocument, renderedDocumentHtml, exportFilename } from '@/lib/export';
import { downloadFile } from '@/lib/storage';
import { formatSelection } from '@/lib/editing';
import { Editor, type EditorStats } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { Toolbar } from '@/components/Toolbar';
import { StatusBar } from '@/components/StatusBar';
import { CommandPalette } from '@/components/CommandPalette';
import { useScrollSync } from '@/hooks/useScrollSync';
import { useResizable } from '@/hooks/useResizable';
import { usePreferences } from '@/hooks/usePreferences';
import { useMarkdownFile } from '@/hooks/useMarkdownFile';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type Layout = 'editor' | 'split' | 'preview';
export default function Home() {
    const { content, filename, ready, message, handleChange, handleOpen, handleSave, handleDownload } = useMarkdownFile();
    const { preferences, updatePreferences, theme, isDarkMode, warning } = usePreferences();
    const [layout, setLayout] = useState<Layout>('split');
    const [readingMode, setReadingMode] = useState(false);
    const exitReadingButton = useRef<HTMLButtonElement>(null);
    const isNarrow = useMediaQuery('(max-width: 767px)');
    const effectiveLayout = readingMode ? 'preview' : isNarrow && layout === 'split' ? 'editor' : layout;
    const [zenMode, setZenMode] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [exportNotice, setExportNotice] = useState('');
    const [stats, setStats] = useState<EditorStats>({ wordCount: 0, charCount: 0, line: 1, col: 1 });
    const previewContent = useDeferredValue(content);
    const editorView = useRef<EditorView | null>(null);
    const { editorRef, previewRef, handleScroll } = useScrollSync();
    const { width: editorWidth, containerRef, startResizing, onResizeKey } = useResizable(50);
    const scrollEditor = useCallback((target: HTMLElement) => handleScroll('editor', target), [handleScroll]);
    const scrollPreview = useCallback((event: React.UIEvent<HTMLDivElement>) => handleScroll('preview', event.currentTarget), [handleScroll]);
    const handleStats = useCallback((next: EditorStats) => setStats(previous =>
        previous.line === next.line && previous.col === next.col && previous.wordCount === next.wordCount && previous.charCount === next.charCount ? previous : next), []);

    const handleInsert = useCallback((template: string) => {
        const view = editorView.current;
        if (!view) return;
        setReadingMode(false);
        view.dispatch(view.state.changeByRange(range => {
            const insert = formatSelection(template, view.state.sliceDoc(range.from, range.to));
            return { changes: { from: range.from, to: range.to, insert }, range: EditorSelection.cursor(range.from + insert.length) };
        }));
        if (effectiveLayout === 'preview') setLayout('editor');
        requestAnimationFrame(() => view.focus());
    }, [effectiveLayout]);
    const handleSearch = () => {
        setReadingMode(false);
        if (effectiveLayout === 'preview') setLayout('editor');
        requestAnimationFrame(() => { if (editorView.current) openSearchPanel(editorView.current); });
    };
    const exportReady = () => {
        const article = previewRef.current?.querySelector<HTMLElement>('[data-document]');
        if (!article || previewContent !== content || article.querySelector('[aria-busy="true"]')) {
            setExportNotice('Preview is still rendering. Try exporting again in a moment.');
            return null;
        }
        setExportNotice('');
        return article;
    };
    const handleExportHtml = () => {
        const article = exportReady();
        if (article) downloadFile(buildHtmlDocument(filename, renderedDocumentHtml(article)), exportFilename(filename), 'text/html;charset=utf-8');
    };
    const handlePrint = () => { if (exportReady()) window.print(); };
    const exitReadingMode = useCallback(() => {
        setReadingMode(false);
        requestAnimationFrame(() => document.querySelector<HTMLSelectElement>('select[aria-label="View"]')?.focus());
    }, []);

    useEffect(() => {
        if (readingMode) exitReadingButton.current?.focus();
    }, [readingMode]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                void handleSave();
            }
            if (event.key === 'Escape' && !commandPaletteOpen) {
                if (readingMode) exitReadingMode();
                else if (zenMode) setZenMode(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleSave, zenMode, commandPaletteOpen, readingMode, exitReadingMode]);

    return (
        <main data-theme={theme} data-layout={effectiveLayout} data-reading={readingMode || undefined} className={`flex flex-col h-dvh ${isDarkMode ? 'dark' : ''} bg-canvas text-content relative print:h-auto print:overflow-visible print:bg-white`}>
            {!zenMode && !readingMode && <div className="editor-chrome print:hidden">
                <Toolbar filename={filename} status={`${exportNotice || message}${warning ? ` · ${warning}` : ''}`} onInsert={handleInsert} onSave={handleSave} onOpen={handleOpen} onDownload={handleDownload}
                    onExportHtml={handleExportHtml} onPrint={handlePrint} layout={effectiveLayout} onLayoutChange={setLayout} onReadingMode={() => setReadingMode(true)}
                    isNarrow={isNarrow} onSearch={handleSearch} theme={preferences.theme} onThemeChange={theme => updatePreferences({ theme })}
                    toggleZenMode={() => setZenMode(true)} openCommandPalette={() => setCommandPaletteOpen(true)} />
            </div>}
            {readingMode && <div className="flex shrink-0 justify-end px-4 py-2 print:hidden">
                <button ref={exitReadingButton} onClick={exitReadingMode} className="rounded border border-divider bg-surface px-3 py-2 text-sm text-content" title="Exit reading mode (Esc)">Exit reading mode</button>
            </div>}
            {zenMode && <button onClick={() => setZenMode(false)} className="absolute top-3 right-3 z-50 rounded border border-divider bg-surface p-2 text-content shadow print:hidden" aria-label="Exit Zen mode" title="Exit Zen mode (Esc)"><Maximize size={20} /></button>}
            <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} onOpen={handleOpen} onSave={handleSave}
                onDownload={handleDownload} onExportHtml={handleExportHtml} onPrint={handlePrint} onSearch={handleSearch}
                layout={effectiveLayout} isNarrow={isNarrow} onLayoutChange={next => { setReadingMode(false); setLayout(next); }}
                readingMode={readingMode} toggleReadingMode={() => { if (readingMode) exitReadingMode(); else { setZenMode(false); setReadingMode(true); } }}
                zenMode={zenMode} toggleZenMode={() => { setReadingMode(false); setZenMode(value => !value); }}
                preferences={preferences} onPreferencesChange={updatePreferences} onInsert={handleInsert} theme={theme} />
            <div ref={containerRef} className="workspace flex-1 min-h-0 flex overflow-hidden relative print:overflow-visible print:h-auto print:block">
                <div className={`editor-pane min-w-0 h-full ${effectiveLayout === 'preview' ? 'hidden' : ''} print:hidden`}
                    style={{ width: effectiveLayout === 'split' ? `${editorWidth}%` : '100%' }}>
                    {ready && <Editor ref={editorRef} onCreateEditor={view => { editorView.current = view; }} value={content}
                        onChange={handleChange} onScroll={scrollEditor} isDarkMode={isDarkMode} onStatistics={handleStats} />}
                </div>
                {effectiveLayout === 'split' && <div role="separator" aria-label="Resize editor" aria-orientation="vertical"
                    aria-valuemin={20} aria-valuemax={80} aria-valuenow={Math.round(editorWidth)} tabIndex={0}
                    className="pane-divider w-1 shrink-0 cursor-col-resize touch-none bg-divider hover:bg-blue-500 focus:bg-blue-500 print:hidden"
                    onPointerDown={startResizing} onKeyDown={onResizeKey} />}
                <div className={`preview-pane min-w-0 h-full flex-1 bg-canvas ${effectiveLayout === 'editor' ? 'hidden' : ''} print:block print:w-full print:h-auto`}>
                    <Preview ref={previewRef} extensions={preferences.extensions} content={previewContent} onScroll={scrollPreview} isDarkMode={isDarkMode} />
                </div>
            </div>
            {!zenMode && !readingMode && <div className="print:hidden"><StatusBar wordCount={stats.wordCount} charCount={stats.charCount} cursorLine={stats.line} cursorCol={stats.col} /></div>}
        </main>
    );
}
