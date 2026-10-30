import type { Root, RootContent } from 'mdast';
export function remarkHeadings() {
    return (tree: Root) => {
        const used = new Set<string>();
        const textOf = (node: RootContent): string => {
            if ('value' in node) return node.value;
            if (node.type === 'image') return node.alt ?? '';
            return 'children' in node ? node.children.map(child => textOf(child as RootContent)).join('') : '';
        };
        const visit = (node: Root | RootContent) => {
            if (node.type === 'heading') {
                const base = textOf(node).trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '').replace(/\s/g, '-') || 'section';
                let slug = base;
                let index = 0;
                while (used.has(slug)) slug = `${base}-${++index}`;
                used.add(slug);
                node.data = { ...node.data, hProperties: { id: `md-${slug}` } };
            }
            if ('children' in node) node.children.forEach(child => visit(child as RootContent));
        };
        visit(tree);
    };
}
