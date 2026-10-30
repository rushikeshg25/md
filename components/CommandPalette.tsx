"use client";

import { useEffect, useRef } from 'react';
import { Command } from 'cmdk';
import { Search, FolderOpen, Save, Download, FileCode, Printer, PanelLeft, Columns2, Eye, BookOpen, Maximize, Palette, Puzzle, ChartNoAxesCombined, Workflow, FileText, Check, type LucideIcon } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import { EDITOR_TOOLS } from '@/lib/constants';
import { THEMES, THEME_LABELS, EXTENSIONS, type Theme, type Preferences } from '@/lib/preferences';

type Layout = 'editor' | 'split' | 'preview';
interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOpen: () => void;
    onSave: () => void;
    onDownload: () => void;
    onExportHtml: () => void;
    onPrint: () => void;
    onSearch: () => void;
    layout: Layout;
    onLayoutChange: (layout: Layout) => void;
    isNarrow: boolean;
    readingMode: boolean;
    toggleReadingMode: () => void;
    zenMode: boolean;
    toggleZenMode: () => void;
    onInsert: (template: string) => void;
    theme: Theme;
    preferences: Preferences;
    onPreferencesChange: (preferences: Partial<Preferences>) => void;
}
interface PaletteItem {
    label: string;
    description?: string;
    icon: LucideIcon;
    action: () => void;
    active?: boolean;
    state?: string;
    shortcut?: string;
}
export function CommandPalette({ open, onOpenChange, onOpen, onSave, onDownload, onExportHtml, onPrint, onSearch, layout, onLayoutChange, isNarrow, readingMode, toggleReadingMode, zenMode, toggleZenMode, onInsert, theme, preferences, onPreferencesChange }: CommandPaletteProps) {
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
    const groups: { label: string; items: PaletteItem[] }[] = [
        { label: 'Files & export', items: [
            { label: 'Open file', description: 'Choose a Markdown file from your device', icon: FolderOpen, action: onOpen },
            { label: 'Save file', icon: Save, action: onSave, shortcut: 'Ctrl/⌘ S' },
            { label: 'Download Markdown', icon: Download, action: onDownload },
            { label: 'Export HTML', description: 'Download a standalone rendered document', icon: FileCode, action: onExportHtml },
            { label: 'Print or save PDF', icon: Printer, action: onPrint },
        ] },
        { label: 'View & focus', items: [
            { label: 'Editor view', description: 'Edit the Markdown source', icon: PanelLeft, action: () => onLayoutChange('editor'), active: !readingMode && layout === 'editor' },
            ...(!isNarrow ? [{ label: 'Split view', description: 'Source and preview side by side', icon: Columns2, action: () => onLayoutChange('split'), active: !readingMode && layout === 'split' }] : []),
            { label: 'Preview view', description: 'Rendered Markdown with the toolbar', icon: Eye, action: () => onLayoutChange('preview'), active: !readingMode && layout === 'preview' },
            { label: readingMode ? 'Exit reading mode' : 'Reading mode', description: 'Only the rendered document, without editing controls', icon: BookOpen, action: toggleReadingMode, active: readingMode },
            { label: zenMode ? 'Exit Zen mode' : 'Zen mode', description: 'Hide controls and keep the current workspace', icon: Maximize, action: toggleZenMode, active: zenMode },
        ] },
        { label: 'Editing', items: [
            { label: 'Find and replace', description: 'Search the Markdown source', icon: Search, action: onSearch, shortcut: 'Ctrl/⌘ F' },
            ...EDITOR_TOOLS.map(item => ({ label: item.label, icon: item.icon, action: () => onInsert(item.template) })),
        ] },
        ...(['Charts', 'Diagrams', 'Markdown'] as const).map(category => ({
            label: category === 'Markdown' ? 'Markdown templates' : category,
            items: TEMPLATES.filter(item => item.category === category).map(item => ({
                label: item.label, icon: category === 'Charts' ? ChartNoAxesCombined : category === 'Diagrams' ? Workflow : FileText,
                action: () => onInsert(`\n\n${item.source}\n\n`),
            })),
        })),
        { label: 'Themes', items: THEMES.map(name => ({
            label: `${THEME_LABELS[name]} theme`,
            description: name === 'system' ? 'Follow your device appearance' : undefined,
            icon: Palette, active: preferences.theme === name, action: () => onPreferencesChange({ theme: name }),
        })) },
        { label: 'Markdown extensions', items: EXTENSIONS.map(({ key, label, description }) => ({
            label: `${preferences.extensions[key] ? 'Disable' : 'Enable'} ${label}`,
            description, icon: Puzzle, state: preferences.extensions[key] ? 'On' : 'Off',
            action: () => onPreferencesChange({ extensions: { ...preferences.extensions, [key]: !preferences.extensions[key] } }),
        })) },
    ];
    return <dialog ref={dialog} data-theme={theme} aria-labelledby="command-title" className="command-dialog print:hidden"
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
        {open && <Command label="Editor commands" filter={(value, search, keywords) => {
            const query = search.trim().toLowerCase();
            const label = value.toLowerCase();
            const text = [label, ...(keywords ?? [])].join(' ').toLowerCase();
            return query.split(/\s+/).every(word => text.includes(word)) ? (label.includes(query) ? 1 : 0.5) : 0;
        }}>
            <div className="command-search">
                <Search size={20} aria-hidden="true" />
                <Command.Input ref={input} placeholder="Search actions, views, themes…" aria-label="Search commands" />
                <button aria-label="Close command palette" onClick={() => onOpenChange(false)}><kbd>Esc</kbd></button>
            </div>
            <Command.List className="command-list">
                <Command.Empty className="command-empty">No matching commands. Try “reading”, “theme”, or “chart”.</Command.Empty>
                {groups.map(group => <Command.Group key={group.label} heading={group.label}>
                    {group.items.map(item => <Command.Item key={item.label} value={item.label} keywords={[group.label, item.description ?? '']} aria-label={item.label} onSelect={() => run(item.action)} className="command-item">
                        <item.icon size={19} aria-hidden="true" className="command-icon" />
                        <span className="command-item-copy"><span className="command-item-label">{item.label}</span>{item.description && <span className="command-item-description">{item.description}</span>}</span>
                        {item.shortcut && <kbd className="command-shortcut">{item.shortcut}</kbd>}
                        {item.active && <span className="command-state"><Check size={15} aria-hidden="true" /><span className="sr-only">Current</span></span>}
                        {item.state && <span className="command-state">{item.state}</span>}
                    </Command.Item>)}
                </Command.Group>)}
            </Command.List>
            <div className="command-footer" aria-hidden="true"><span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Run</span><span><kbd>Esc</kbd> Close</span></div>
        </Command>}
    </dialog>;
}
