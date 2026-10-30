export const CONTENT_KEY = 'markdown-editor-content';
export const FILENAME_KEY = 'markdown-editor-filename';
export const DRAFT_KEY = 'markdown-editor-draft';

export function saveToLocalStorage(content: string, filename = 'Untitled.md'): boolean {
    try {
        // One write keeps the document and its name together if storage is full.
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, filename }));
        return true;
    } catch {
        return false;
    }
}

export function loadFromLocalStorage(): { content: string | null; filename: string | null } {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw !== null) {
            const draft: unknown = JSON.parse(raw);
            if (draft && typeof draft === 'object' && 'content' in draft && 'filename' in draft &&
                typeof draft.content === 'string' && typeof draft.filename === 'string') {
                return { content: draft.content, filename: draft.filename };
            }
        }
    } catch { /* Try the older draft format if the new record cannot be read. */ }
    try {
        return { content: localStorage.getItem(CONTENT_KEY), filename: localStorage.getItem(FILENAME_KEY) };
    } catch {
        return { content: null, filename: null };
    }
}

interface MarkdownFileHandle {
    getFile(): Promise<File>;
    createWritable(): Promise<{ write(content: string): Promise<void>; close(): Promise<void> }>;
}
type PickerWindow = Window & {
    showOpenFilePicker?: (options: object) => Promise<MarkdownFileHandle[]>;
    showSaveFilePicker?: (options: object) => Promise<MarkdownFileHandle>;
};
const fileTypes = [{ description: 'Markdown files', accept: { 'text/markdown': ['.md', '.markdown'], 'text/plain': ['.txt'] } }];
export const isCancelled = (error: unknown) => error instanceof Error && error.name === 'AbortError';

export async function openFile(): Promise<{ content: string; name: string }> {
    const picker = (window as PickerWindow).showOpenFilePicker;
    if (picker) {
        const [handle] = await picker.call(window, { types: fileTypes });
        const file = await handle.getFile();
        return { content: await file.text(), name: file.name };
    }
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.txt,text/markdown,text/plain';
        input.hidden = true;
        const clean = () => input.remove();
        input.oncancel = () => { clean(); reject(new DOMException('Cancelled', 'AbortError')); };
        input.onchange = async () => {
            const file = input.files?.[0];
            clean();
            if (!file) { reject(new DOMException('Cancelled', 'AbortError')); return; }
            try { resolve({ content: await file.text(), name: file.name }); }
            catch (error) { reject(error); }
        };
        document.body.append(input);
        input.click();
    });
}

export function downloadFile(content: string, filename: string, type = 'text/markdown;charset=utf-8') {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    // Let the browser consume the URL before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function saveFile(content: string, filename = 'Untitled.md') {
    const picker = (window as PickerWindow).showSaveFilePicker;
    if (!picker) { downloadFile(content, filename); return; }
    const handle = await picker.call(window, { suggestedName: filename, types: fileTypes });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
}
