"use client";

import React, { forwardRef } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import 'github-markdown-css/github-markdown.css';

import { MermaidBlock } from './MermaidBlock';

interface PreviewProps {
    content: string;
    className?: string;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    isDarkMode: boolean;
}

export const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ content, className, onScroll, isDarkMode }, ref) => {

    const components: Components = {
        code(props) {
            const { children, className, node, ...rest } = props
            const match = /language-(\w+)/.exec(className || '')
            const lang = match ? match[1] : ''

            if (lang === 'mermaid') {
                return <MermaidBlock chart={String(children).replace(/\n$/, '')} isDarkMode={isDarkMode} />
            }

            return <code className={className} {...rest}>{children}</code>
        }
    };

    return (
        <div
            ref={ref}
            onScroll={onScroll}
            className={`h-full w-full overflow-auto p-8 markdown-body ${className}`}
            style={{ backgroundColor: 'transparent' }}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});

Preview.displayName = 'Preview';
