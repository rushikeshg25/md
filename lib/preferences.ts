export const THEMES = ['system', 'light', 'dark', 'sepia', 'midnight'] as const;
export type Theme = typeof THEMES[number];
export const PREFERENCES_KEY = 'markdown-editor-preferences';
export interface Preferences { theme: Theme }
export const DEFAULT_PREFERENCES: Preferences = { theme: 'system' };
export function parsePreferences(raw: string | null): Preferences {
    try {
        const value = JSON.parse(raw ?? '{}');
        return { theme: THEMES.includes(value?.theme) ? value.theme : 'system' };
    } catch { return DEFAULT_PREFERENCES; }
}
