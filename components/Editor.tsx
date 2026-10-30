"use client";

import React, { useCallback, useMemo, forwardRef } from 'react';
import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';

export interface EditorStats {
    line: number;
    col: number;
    wordCount: number;
    charCount: number;
}

interface EditorProps {
    onCreateEditor?: (view: EditorView) => void;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    onScroll?: (target: HTMLElement) => void;
    isDarkMode: boolean;
    onStatistics?: (stats: EditorStats) => void; // New prop
}

export const Editor = forwardRef<HTMLDivElement, EditorProps>(({ value, onCreateEditor, onChange, className, onScroll, isDarkMode, onStatistics }, ref) => {
    const handleChange = useCallback((val: string) => {
        onChange(val);
    }, [onChange]);

    const prevStatsRef = React.useRef<EditorStats>({ line: 1, col: 1, wordCount: 0, charCount: 0 });

    const handleStatistics = useCallback((viewUpdate: ViewUpdate) => {
        if (!onStatistics) return;

        // Selection stats
        const state = viewUpdate.state;
        const mainSelection = state.selection.main;
        const lineObj = state.doc.lineAt(mainSelection.head);
        const line = lineObj.number;
        const col = mainSelection.head - lineObj.from + 1;

        // Cursor-only updates reuse the counts instead of scanning the document.
        const text = viewUpdate.docChanged ? state.doc.toString() : null;
        const wordCount = text === null ? prevStatsRef.current.wordCount : text.trim().split(/\s+/).filter(Boolean).length;
        const charCount = state.doc.length;

        const newStats = { line, col, wordCount, charCount };
        const prev = prevStatsRef.current;

        if (prev.line !== line || prev.col !== col || prev.wordCount !== wordCount || prev.charCount !== charCount) {
            prevStatsRef.current = newStats;
            onStatistics(newStats);
        }
    }, [onStatistics]);

    const extensions = useMemo(() => [
        markdown({ base: markdownLanguage }),
        EditorView.lineWrapping,
        EditorView.domEventHandlers({ scroll: (_event, view) => { onScroll?.(view.scrollDOM); } }),
    ], [onScroll]);

    return (
        <div
            ref={ref}
            className={`h-full w-full overflow-auto ${className}`}
            style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }}
        >
            <CodeMirror
                onCreateEditor={view => {
                    const text = view.state.doc.toString();
                    const stats = { line: 1, col: 1, wordCount: text.trim().split(/\s+/).filter(Boolean).length, charCount: text.length };
                    prevStatsRef.current = stats;
                    onStatistics?.(stats);
                    onCreateEditor?.(view);
                }}
                aria-label="Markdown source"
                value={value}
                height="100%"
                extensions={extensions}
                onChange={handleChange}
                onUpdate={handleStatistics} // Hook into updates
                theme={isDarkMode ? vscodeDark : vscodeLight}
                className="h-full text-base"
                basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightSpecialChars: true,
                    history: true,
                    foldGutter: true,
                    drawSelection: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    syntaxHighlighting: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: true,
                    crosshairCursor: true,
                    highlightActiveLine: true,
                    highlightSelectionMatches: true,
                    closeBracketsKeymap: true,
                    defaultKeymap: true,
                    searchKeymap: true,
                    historyKeymap: true,
                    foldKeymap: true,
                    completionKeymap: true,
                    lintKeymap: true,
                }}
            />
        </div>
    );
});

Editor.displayName = 'Editor';
