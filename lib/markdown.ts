import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import type { Root, RootContent } from 'mdast';
import type { PluggableList } from 'unified';
import type { Preferences } from './preferences';

export function remarkAlerts() {
    return (tree: Root) => {
        const walk = (node: Root | RootContent) => {
            if (node.type === 'blockquote') {
                const paragraph = node.children[0];
                const text = paragraph?.type === 'paragraph' ? paragraph.children[0] : null;
                const match = text?.type === 'text' ? /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\n|$)/.exec(text.value) : null;
                if (match && text?.type === 'text') {
                    text.value = text.value.slice(match[0].length);
                    node.data = { ...node.data, hProperties: { className: ['markdown-alert', `markdown-alert-${match[1].toLowerCase()}`] } };
                    node.children.unshift({ type: 'paragraph', children: [{ type: 'strong', children: [{ type: 'text', value: match[1] }] }] });
                }
            }
            if ('children' in node) node.children.forEach(child => walk(child as RootContent));
        };
        walk(tree);
    };
}

export function markdownPlugins(options: Preferences['extensions']) {
    const remarkPlugins: PluggableList = [];
    const rehypePlugins: PluggableList = [];
    if (options.gfm) remarkPlugins.push(remarkGfm);
    if (options.math) { remarkPlugins.push(remarkMath); rehypePlugins.push([rehypeKatex, { trust: false }]); }
    if (options.breaks) remarkPlugins.push(remarkBreaks);
    if (options.alerts) remarkPlugins.push(remarkAlerts);
    if (options.highlight) rehypePlugins.push([rehypeHighlight, { detect: false, plainText: ['mermaid'] }]);
    return { remarkPlugins, rehypePlugins };
}
