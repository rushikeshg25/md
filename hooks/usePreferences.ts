import { useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, parsePreferences, type Preferences } from '@/lib/preferences';
export function usePreferences() {
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [warning, setWarning] = useState('');
    const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
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
