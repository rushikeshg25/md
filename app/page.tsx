"use client";

import { useState, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import { EditorSelection } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { formatSelection } from '@/lib/editing';
import type { EditorStats } from '@/components/Editor';
import { Editor } from '@/components/Editor';
import { MarkdownSettings } from '@/components/MarkdownSettings';
import { Preview } from '@/components/Preview';
import { Toolbar } from '@/components/Toolbar';
import { StatusBar } from '@/components/StatusBar';
import { CommandPalette } from '@/components/CommandPalette';
import { useScrollSync } from '@/hooks/useScrollSync';
import { useResizable } from '@/hooks/useResizable';
import { usePreferences } from '@/hooks/usePreferences';
import { useMarkdownFile } from '@/hooks/useMarkdownFile';

export default function Home() {
    const {
        content,
        filename,
        ready,
        message,
        handleChange,
        handleOpen,
        handleSave,
        handleDownload
    } = useMarkdownFile();

    const previewContent = useDeferredValue(content);
    const editorView = useRef<EditorView | null>(null);
    const handleInsert = useCallback((template: string) => {
        const view = editorView.current;
        if (!view) return;
        view.dispatch(view.state.changeByRange(range => {
            const insert = formatSelection(template, view.state.sliceDoc(range.from, range.to));
            return { changes: { from: range.from, to: range.to, insert }, range: EditorSelection.cursor(range.from + insert.length) };
        }));
        view.focus();
    }, []);
    useEffect(() => {
        const save = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                void handleSave();
            }
        };
        window.addEventListener('keydown', save);
        return () => window.removeEventListener('keydown', save);
    }, [handleSave]);

    const [showPreview, setShowPreview] = useState(true);
    const { preferences, updatePreferences, theme, isDarkMode, warning } = usePreferences();
    const [zenMode, setZenMode] = useState(false); // Zen Mode state
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    // Stats state
    const [stats, setStats] = useState({ wordCount: 0, charCount: 0, line: 1, col: 1 });

    // Custom Hooks
    const { editorRef, previewRef, handleScroll } = useScrollSync();
    const scrollEditor = useCallback((target: HTMLElement) => handleScroll('editor', target), [handleScroll]);
    const scrollPreview = useCallback((event: React.UIEvent<HTMLDivElement>) => handleScroll('preview', event.currentTarget), [handleScroll]);
    const { width: editorWidth, startResizing } = useResizable(50);

    const handleStats = useCallback((s: EditorStats) => {
        setStats(prev => {
            if (prev.line === s.line && prev.col === s.col && prev.wordCount === s.wordCount && prev.charCount === s.charCount) {
                return prev;
            }
            return s;
        });
    }, []);

    // Zen Mode Esc Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && zenMode) {
                setZenMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zenMode]);

    return (
        <main data-theme={theme} className={`flex flex-col h-dvh ${isDarkMode ? 'dark' : ''} bg-canvas text-content transition-colors duration-300 relative print:h-auto print:overflow-visible print:bg-white`}>
            <div role="status" className="px-3 py-1 text-xs bg-surface text-muted print:hidden">{filename} · {message}{warning && ` · ${warning}`}</div>
            {/* Toolbar hidden in Zen Mode and Print */}
            {!zenMode && (
                <div className="print:hidden">
                    <Toolbar
                        onInsert={handleInsert}
                        onSave={handleSave}
                        onOpen={handleOpen}
                        onDownload={handleDownload}
                        togglePreview={() => setShowPreview(!showPreview)}
                        theme={preferences.theme}
                        onThemeChange={theme => updatePreferences({ theme })}
                        toggleZenMode={() => setZenMode(!zenMode)}
                        openCommandPalette={() => setCommandPaletteOpen(true)}
                        showPreview={showPreview}
                    />
                </div>
            )}

            {!zenMode && <MarkdownSettings extensions={preferences.extensions} onChange={extensions => updatePreferences({ extensions })} />}

            {/* Exit Zen Mode Floating Button (Visible only in Zen Mode) - Hidden in Print */}
            {zenMode && (
                <button
                    onClick={() => setZenMode(false)}
                    className="absolute top-4 right-4 z-50 p-2 bg-neutral-800 text-neutral-400 rounded-full hover:bg-neutral-700 hover:text-white shadow-lg opacity-0 hover:opacity-100 transition-opacity print:hidden"
                    title="Exit Zen Mode (Esc)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
                </button>
            )}

            {/* Command Palette */}
            <CommandPalette
                open={commandPaletteOpen}
                onOpenChange={setCommandPaletteOpen}
                onOpen={handleOpen}
                onSave={handleSave}
                onDownload={handleDownload}
                togglePreview={() => setShowPreview(!showPreview)}
                toggleTheme={() => updatePreferences({ theme: isDarkMode ? 'light' : 'dark' })}
                toggleZenMode={() => setZenMode(!zenMode)}
                onInsert={handleInsert}
                isDarkMode={isDarkMode}
            />
            <div className="flex-1 flex overflow-hidden relative print:overflow-visible print:h-auto print:block">
                <div
                    className={`transition-all duration-75 ${showPreview ? '' : 'w-full'} border-r border-divider print:hidden`}
                    style={{ width: showPreview ? `${editorWidth}%` : '100%' }}
                >
                    {ready && <Editor
                        ref={editorRef}
                        onCreateEditor={view => { editorView.current = view; }}
                        value={content}
                        onChange={handleChange}
                        onScroll={scrollEditor}
                        isDarkMode={isDarkMode}
                        onStatistics={handleStats} // Update stats
                    />}
                </div>

                {showPreview && (
                    <>
                        <div
                            className={`w-1 cursor-col-resize flex flex-col justify-center items-center group absolute top-0 bottom-0 z-10 transition-colors hover:bg-blue-500 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'} print:hidden`}
                            style={{ left: `${editorWidth}%` }}
                            onMouseDown={startResizing}
                        >
                            <div className={`h-8 w-1 rounded-full ${isDarkMode ? 'bg-neutral-600 group-hover:bg-blue-300' : 'bg-gray-400 group-hover:bg-blue-400'}`} />
                        </div>

                        <div
                            className="h-full bg-surface print:bg-white print:w-full print:h-auto print:absolute print:top-0 print:left-0 print:m-0 print:z-50"
                            style={{ width: `${100 - editorWidth}%`, marginLeft: '4px' }}
                        >
                            <Preview
                                ref={previewRef}
                                extensions={preferences.extensions}
                                content={previewContent}
                                onScroll={scrollPreview}
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* StatusBar hidden in Zen Mode, or can be kept minimal - Hidden in Print */}
            {
                !zenMode && (
                    <div className="print:hidden">
                        <StatusBar
                            wordCount={stats.wordCount}
                            charCount={stats.charCount}
                            cursorLine={stats.line}
                            cursorCol={stats.col}
                        />
                    </div>
                )
            }
        </main >
    );
}
