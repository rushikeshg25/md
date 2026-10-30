/** Preserve selected text when applying a formatting template. */
export function formatSelection(template: string, selected: string): string {
    if (!selected) return template;
    const wrappers: Record<string, (text: string) => string> = {
        '**bold** ': text => `**${text}**`,
        '*italic* ': text => `*${text}*`,
        '`code` ': text => `\`${text}\``,
        '[text](url) ': text => `[${text}](url)`,
        '![alt](url) ': text => `![${text}](url)`,
        '\n```\ncode block\n```\n': text => `\n\`\`\`\n${text}\n\`\`\`\n`,
    };
    if (wrappers[template]) return wrappers[template](selected);
    const prefixes: Record<string, string> = { '# ': '# ', '## ': '## ', '> quote ': '> ', '- item ': '- ', '1. item ': '1. ', '- [ ] task ': '- [ ] ' };
    if (prefixes[template]) return selected.split('\n').map(line => prefixes[template] + line).join('\n');
    return template;
}
