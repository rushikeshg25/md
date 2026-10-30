import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, parsePreferences, type Preferences } from '@/lib/preferences';
const subscribeSystemTheme = (notify: () => void) => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', notify);
    return () => media.removeEventListener('change', notify);
};
export function usePreferences() {
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [warning, setWarning] = useState('');
    const systemDark = useSyncExternalStore(subscribeSystemTheme, () => window.matchMedia('(prefers-color-scheme: dark)').matches, () => false);
    useEffect(() => {
        try {
            // Synchronize browser-only preferences after hydration.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreferences(parsePreferences(localStorage.getItem(PREFERENCES_KEY)));
        } catch { setWarning('Preferences cannot be saved in this browser.'); }
    }, []);
    const updatePreferences = useCallback((patch: Partial<Preferences>) => {
        const next = { ...preferences, ...patch };
        setPreferences(next);
        try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)); setWarning(''); }
        catch { setWarning('Preferences cannot be saved in this browser.'); }
    }, [preferences]);
    const theme = preferences.theme === 'system' ? (systemDark ? 'dark' : 'light') : preferences.theme;
    return { preferences, updatePreferences, theme, isDarkMode: theme === 'dark' || theme === 'midnight', warning };
}
