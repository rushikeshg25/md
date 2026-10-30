"use client";

import React, { forwardRef, memo, useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { markdownPlugins } from '@/lib/markdown';
import type { Preferences } from '@/lib/preferences';
import 'katex/dist/katex.min.css';

import 'github-markdown-css/github-markdown.css';

import { MermaidBlock } from './MermaidBlock';

interface PreviewProps {
    extensions: Preferences['extensions'];
    content: string;
    className?: string;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    isDarkMode: boolean;
}

export const Preview = memo(forwardRef<HTMLDivElement, PreviewProps>(({ content, extensions, className, onScroll, isDarkMode }, ref) => {

    const components = useMemo<Components>(() => ({
        pre({ node, children }) {
            const code = node?.children[0];
            if (extensions.mermaid && code?.type === 'element' && code.tagName === 'code' &&
                Array.isArray(code.properties.className) && code.properties.className.includes('language-mermaid')) {
                const chart = code.children.map(child => child.type === 'text' ? child.value : '').join('').replace(/\n$/, '');
                return <MermaidBlock chart={chart} isDarkMode={isDarkMode} />;
            }
            return <pre>{children}</pre>;
        }
    }), [isDarkMode, extensions.mermaid]);
    const plugins = useMemo(() => markdownPlugins(extensions), [extensions]);

    return (
        <div
            ref={ref}
            onScroll={onScroll}
            className={`h-full w-full overflow-auto p-8 markdown-body ${className}`}
            style={{ backgroundColor: 'transparent' }}
        >
            <ReactMarkdown
                {...plugins}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}));

Preview.displayName = 'Preview';
