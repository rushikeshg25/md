import { useState, useEffect, useCallback } from 'react';
import { loadFromLocalStorage, saveToLocalStorage, openFile, saveFile as saveFileToDisk } from '@/lib/storage';

const INITIAL_CONTENT = '# Welcome to Markdown Editor\n\nStart typing...';

export const useMarkdownFile = () => {
    const [content, setContent] = useState<string>('');
    const [filename, setFilename] = useState<string>('Untitled.md');

    // Load from local storage on mount
    useEffect(() => {
        const { content: savedContent, filename: savedFilename } = loadFromLocalStorage();
        setContent(savedContent || INITIAL_CONTENT);
        if (savedFilename) setFilename(savedFilename);
    }, []);

    // Handle content change and auto-save to local storage
    const handleChange = useCallback((val: string) => {
        setContent(val);
        // We use the current filename state for local storage key if we wanted per-file keys, 
        // but current storage.ts implementation seems global. 
        // Passing filename to saveToLocalStorage as per existing logic.
        saveToLocalStorage(val, filename); 
    }, [filename]);

    const handleInsert = useCallback((template: string) => {
        setContent(prev => prev + template);
    }, []);

    const handleOpen = useCallback(async () => {
        try {
            const { content: fileContent, name } = await openFile();
            setContent(fileContent);
            setFilename(name);
            saveToLocalStorage(fileContent, name);
        } catch (error) {
            // Ignored (e.g. user cancel)
        }
    }, []);

    const handleSave = useCallback(async () => {
        try {
            await saveFileToDisk(content);
        } catch (error) {
            // Ignored
        }
    }, [content]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'document.md';
        a.click();
        URL.revokeObjectURL(url);
    }, [content, filename]);

    return {
        content,
        filename,
        setContent,
        handleChange,
        handleInsert,
        handleOpen,
        handleSave,
        handleDownload
    };
};
