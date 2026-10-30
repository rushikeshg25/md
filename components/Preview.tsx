"use client";

import React, { forwardRef, memo, useMemo, useRef, useImperativeHandle } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { markdownPlugins } from '@/lib/markdown';
import type { Preferences } from '@/lib/preferences';
import 'katex/dist/katex.min.css';

import 'github-markdown-css/github-markdown.css';

import { DocumentOutline } from './DocumentOutline';
import { CodeBlock } from './CodeBlock';
import { MermaidBlock } from './MermaidBlock';

interface PreviewProps {
    extensions: Preferences['extensions'];
    content: string;
    className?: string;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    isDarkMode: boolean;
}

export const Preview = memo(forwardRef<HTMLDivElement, PreviewProps>(({ content, extensions, className, onScroll, isDarkMode }, ref) => {

    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => containerRef.current!, []);
    const components = useMemo<Components>(() => ({
        a({ href, children }) {
            const external = /^(https?:)?\/\//.test(href ?? '');
            const target = href?.startsWith('#') && !href.startsWith('#user-content-') && !href.startsWith('#md-') ? `#md-${href.slice(1)}` : href;
            return <a href={target} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{children}</a>;
        },
        pre({ node, children }) {
            const code = node?.children[0];
            if (extensions.mermaid && code?.type === 'element' && code.tagName === 'code' &&
                Array.isArray(code.properties.className) && code.properties.className.includes('language-mermaid')) {
                const chart = code.children.map(child => child.type === 'text' ? child.value : '').join('').replace(/\n$/, '');
                return <MermaidBlock chart={chart} isDarkMode={isDarkMode} />;
            }
            const textOf = (element: typeof code): string => {
                if (!element) return '';
                if (element.type === 'text') return element.value;
                return 'children' in element ? element.children.map(textOf).join('') : '';
            };
            const source = textOf(code);
            return <CodeBlock key={source} source={source}>{children}</CodeBlock>;
        }
    }), [isDarkMode, extensions.mermaid]);
    const plugins = useMemo(() => markdownPlugins(extensions), [extensions]);

    return (
        <div
            ref={containerRef}
            onScroll={onScroll}
            className={`h-full w-full overflow-auto p-8 ${className}`}
            style={{ backgroundColor: 'transparent' }}
        >
            <DocumentOutline container={containerRef} content={content} />
            <article className="markdown-body" data-document>
            <ReactMarkdown
                {...plugins}
                components={components}
            >
                {content}
            </ReactMarkdown>
            </article>
        </div>
    );
}));

Preview.displayName = 'Preview';
