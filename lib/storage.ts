export const CONTENT_KEY = 'markdown-editor-content';
export const FILENAME_KEY = 'markdown-editor-filename';

export const saveToLocalStorage = (content: string, filename?: string) => {
  try {
    localStorage.setItem(CONTENT_KEY, content);
    if (filename) {
      localStorage.setItem(FILENAME_KEY, filename);
    }
  } catch (error) {
    console.error('Failed to save to local storage', error);
  }
};

export const loadFromLocalStorage = () => {
  try {
    const content = localStorage.getItem(CONTENT_KEY);
    const filename = localStorage.getItem(FILENAME_KEY);
    return { content, filename };
  } catch (error) {
    console.error('Failed to load from local storage', error);
    return { content: null, filename: null };
  }
};

export async function openFile(): Promise<{ content: string; name: string }> {
  try {
    // @ts-ignore - File System Access API types
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'Markdown Files',
          accept: {
            'text/markdown': ['.md', '.markdown'],
            'text/plain': ['.txt'],
          },
        },
      ],
    });
    const file = await fileHandle.getFile();
    return { content: await file.text(), name: file.name };
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('Cancelled');
    }
    throw error;
  }
}

export async function saveFile(content: string) {
  try {
    // @ts-ignore
    const fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: 'Markdown File',
          accept: {
            'text/markdown': ['.md'],
          },
        },
      ],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  } catch (error) {
     if ((error as Error).name === 'AbortError') {
      return; // User cancelled
    }
    console.error('Failed to save file', error);
    throw error;
  }
}
