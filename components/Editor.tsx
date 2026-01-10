"use client";

import React, { useCallback, forwardRef } from 'react';
import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';

interface EditorStats {
    line: number;
    col: number;
    wordCount: number;
    charCount: number;
}

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    isDarkMode: boolean;
    onStatistics?: (stats: EditorStats) => void; // New prop
}

export const Editor = forwardRef<HTMLDivElement, EditorProps>(({ value, onChange, className, onScroll, isDarkMode, onStatistics }, ref) => {
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

        // Content stats
        const text = state.doc.toString();
        const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const charCount = text.length;

        const newStats = { line, col, wordCount, charCount };
        const prev = prevStatsRef.current;

        if (prev.line !== line || prev.col !== col || prev.wordCount !== wordCount || prev.charCount !== charCount) {
            prevStatsRef.current = newStats;
            onStatistics(newStats);
        }
    }, [onStatistics]);

    return (
        <div
            ref={ref}
            onScroll={onScroll}
            className={`h-full w-full overflow-auto ${className}`}
            style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }}
        >
            <CodeMirror
                value={value}
                height="100%"
                extensions={[
                    markdown({ base: markdownLanguage }),
                    EditorView.lineWrapping,
                ]}
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
