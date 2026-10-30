import { useState, useEffect, useCallback } from 'react';
import { loadFromLocalStorage, saveToLocalStorage, openFile, saveFile, downloadFile, isCancelled } from '@/lib/storage';

const INITIAL_CONTENT = '# Welcome to Markdown Editor\n\nStart typing...';

export const useMarkdownFile = () => {
    const [content, setContent] = useState('');
    const [filename, setFilename] = useState('Untitled.md');
    const [ready, setReady] = useState(false);
    const [message, setMessage] = useState('Loading draft…');

    useEffect(() => {
        const draft = loadFromLocalStorage();
        // Hydrate browser-only storage after the server and first client render agree.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContent(draft.content ?? INITIAL_CONTENT);
        setFilename(draft.filename ?? 'Untitled.md');
        setReady(true);
    }, []);

    useEffect(() => {
        if (!ready) return;
        const saved = saveToLocalStorage(content, filename);
        // Report the outcome of syncing this document to browser storage.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessage(saved ? 'Draft saved in this browser' : 'Draft could not be saved. Download a copy.');
    }, [content, filename, ready]);

    const handleChange = useCallback((value: string) => setContent(value), []);
    const handleOpen = useCallback(async () => {
        if (content && !window.confirm('Replace the current document? Download a copy first if you need to keep it.')) return;
        try {
            const file = await openFile();
            setContent(file.content);
            setFilename(file.name);
        } catch (error) {
            if (!isCancelled(error)) setMessage('Could not open the file. Try again or paste its contents.');
        }
    }, [content]);
    const handleSave = useCallback(async () => {
        try {
            await saveFile(content, filename);
            setMessage('File saved or download started');
        } catch (error) {
            if (!isCancelled(error)) setMessage('Could not save the file. Use Download to keep a copy.');
        }
    }, [content, filename]);
    const handleDownload = useCallback(() => downloadFile(content, filename), [content, filename]);

    return { content, filename, ready, message, handleChange, handleOpen, handleSave, handleDownload };
};
