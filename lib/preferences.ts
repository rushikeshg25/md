export const THEMES = ['system', 'light', 'dark', 'sepia', 'midnight'] as const;
export type Theme = typeof THEMES[number];
export const PREFERENCES_KEY = 'markdown-editor-preferences';
export const EXTENSIONS = [
    { key: 'gfm', label: 'GitHub Markdown', description: 'Tables, task lists, strikethrough, autolinks and footnotes' },
    { key: 'math', label: 'Math', description: 'LaTeX equations with dollar delimiters' },
    { key: 'mermaid', label: 'Diagrams and charts', description: 'Mermaid fenced code blocks' },
    { key: 'highlight', label: 'Code highlighting', description: 'Syntax colors for fenced code' },
    { key: 'breaks', label: 'Single-line breaks', description: 'Render a new line without two trailing spaces' },
    { key: 'alerts', label: 'GitHub alerts', description: 'NOTE, TIP, IMPORTANT, WARNING and CAUTION callouts' },
] as const;
export type ExtensionKey = typeof EXTENSIONS[number]['key'];
export interface Preferences { theme: Theme; extensions: Record<ExtensionKey, boolean> }
export const DEFAULT_EXTENSIONS = { gfm: true, math: true, mermaid: true, highlight: true, breaks: true, alerts: true };
export const DEFAULT_PREFERENCES: Preferences = { theme: 'system', extensions: DEFAULT_EXTENSIONS };
export function parsePreferences(raw: string | null): Preferences {
    try {
        const value = JSON.parse(raw ?? '{}');
        const extensions = { ...DEFAULT_EXTENSIONS };
        for (const { key } of EXTENSIONS) {
            if (typeof value?.extensions?.[key] === 'boolean') extensions[key] = value.extensions[key];
        }
        return { theme: THEMES.includes(value?.theme) ? value.theme : 'system', extensions };
    } catch { return DEFAULT_PREFERENCES; }
}
