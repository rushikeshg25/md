"use client";

import { useEffect, useRef } from 'react';
import { Command } from 'cmdk';
import { TEMPLATES } from '@/lib/templates';
import { EDITOR_TOOLS } from '@/lib/constants';
import type { Theme } from '@/lib/preferences';

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOpen: () => void;
    onSave: () => void;
    onDownload: () => void;
    onExportHtml: () => void;
    onPrint: () => void;
    onSearch: () => void;
    togglePreview: () => void;
    toggleTheme: () => void;
    toggleZenMode: () => void;
    onInsert: (template: string) => void;
    theme: Theme;
}
export function CommandPalette({ open, onOpenChange, onOpen, onSave, onDownload, onExportHtml, onPrint, onSearch, togglePreview, toggleTheme, toggleZenMode, onInsert, theme }: CommandPaletteProps) {
    const dialog = useRef<HTMLDialogElement>(null);
    const input = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (open) { dialog.current?.showModal(); input.current?.focus(); }
        else dialog.current?.close();
    }, [open]);
    useEffect(() => {
        const down = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                onOpenChange(!open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [open, onOpenChange]);
    const run = (action: () => void) => {
        // Close first so native focus restoration cannot steal the editor selection.
        dialog.current?.close();
        onOpenChange(false);
        action();
    };
    const groups = [
        { label: 'File', items: [
            { label: 'Open file', action: onOpen }, { label: 'Save file', action: onSave },
            { label: 'Download Markdown', action: onDownload }, { label: 'Export HTML', action: onExportHtml },
            { label: 'Print or save PDF', action: onPrint },
        ] },
        { label: 'View and editing', items: [
            { label: 'Find and replace', action: onSearch }, { label: 'Toggle preview', action: togglePreview },
            { label: 'Toggle Zen mode', action: toggleZenMode }, { label: 'Toggle light/dark theme', action: toggleTheme },
        ] },
        { label: 'Charts and templates', items: TEMPLATES.map(item => ({ label: item.label, action: () => onInsert(`\n\n${item.source}\n\n`) })) },
        { label: 'Formatting', items: EDITOR_TOOLS.map(item => ({ label: item.label, action: () => onInsert(item.template) })) },
    ];
    return <dialog ref={dialog} data-theme={theme} aria-labelledby="command-title" className="command-dialog"
        onKeyDown={event => {
            if (event.key !== 'Tab') return;
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('input, button, [tabindex="0"]'));
            if (!controls.length) return;
            const index = controls.indexOf(document.activeElement as HTMLElement);
            const next = (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
            event.preventDefault();
            controls[next].focus();
        }}
        onCancel={event => { event.preventDefault(); onOpenChange(false); }}
        onClick={event => { if (event.target === event.currentTarget) onOpenChange(false); }}>
        <h2 id="command-title" className="sr-only">Command palette</h2>
        {open && <Command label="Editor commands">
            <div className="flex items-center border-b border-divider px-3">
                <Command.Input ref={input} placeholder="Search commands…" className="h-12 w-full bg-transparent px-2 text-sm outline-none" />
                <button className="tool-button" aria-label="Close command palette" onClick={() => onOpenChange(false)}>Esc</button>
            </div>
            <Command.List className="max-h-[55dvh] overflow-y-auto p-2">
                <Command.Empty className="p-6 text-center text-sm text-muted">No matching commands.</Command.Empty>
                {groups.map(group => <Command.Group key={group.label} heading={group.label} className="mb-2 px-2 text-xs text-muted">
                    {group.items.map(item => <Command.Item key={item.label} onSelect={() => run(item.action)}
                        className="cursor-pointer rounded px-2 py-2 text-sm text-content data-[selected=true]:bg-surface-hover">{item.label}</Command.Item>)}
                </Command.Group>)}
            </Command.List>
        </Command>}
    </dialog>;
}
