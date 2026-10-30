"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Save, FolderOpen, Download, Search, Maximize, FileText, Command as CommandIcon } from 'lucide-react';
import { EDITOR_TOOLS } from '@/lib/constants';
import { TEMPLATES } from '@/lib/templates';
import { THEMES, type Theme } from '@/lib/preferences';

interface ToolbarProps {
    onInsert: (template: string) => void;
    onSave: () => void;
    onOpen: () => void;
    onDownload: () => void;
    onExportHtml: () => void;
    onPrint: () => void;
    layout: 'editor' | 'split' | 'preview';
    onLayoutChange: (layout: 'editor' | 'split' | 'preview') => void;
    isNarrow: boolean;
    onSearch: () => void;
    toggleZenMode: () => void;
    openCommandPalette: () => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}

export function Toolbar({ onInsert, onSave, onOpen, onDownload, onExportHtml, onPrint, layout, onLayoutChange, isNarrow, onSearch, toggleZenMode, openCommandPalette, theme, onThemeChange }: ToolbarProps) {
    const actions = [
        { label: 'Open file', icon: FolderOpen, action: onOpen },
        { label: 'Command palette', icon: CommandIcon, action: openCommandPalette },
        { label: 'Save file', icon: Save, action: onSave },
        { label: 'Download Markdown', icon: Download, action: onDownload },
        { label: 'Export HTML', icon: FileText, action: onExportHtml },
        { label: 'Print or save PDF', icon: FileText, action: onPrint },
        { label: 'Find and replace', icon: Search, action: onSearch },
        { label: 'Zen mode', icon: Maximize, action: toggleZenMode },
    ];
    return (
        <TooltipProvider>
            <div className="toolbar flex flex-wrap items-center justify-between gap-2 p-2 border-b border-divider bg-surface">
                <div className="flex items-center gap-1 overflow-x-auto" role="group" aria-label="Formatting">
                    {EDITOR_TOOLS.map(tool => (
                        <Tooltip key={tool.label}>
                            <TooltipTrigger asChild>
                                <button aria-label={tool.label} onMouseDown={event => event.preventDefault()}
                                    onClick={() => onInsert(tool.template)} className="tool-button">
                                    <tool.icon size={18} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{tool.label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Document actions">
                    <select aria-label="Insert template" value="" onChange={event => {
                        const template = TEMPLATES.find(item => item.label === event.target.value);
                        if (template) onInsert(`\n\n${template.source}\n\n`);
                    }} className="rounded border border-divider bg-canvas p-2 text-sm text-content">
                        <option value="" disabled>Insert…</option>
                        {['Charts', 'Diagrams', 'Markdown'].map(category => <optgroup key={category} label={category}>
                            {TEMPLATES.filter(item => item.category === category).map(item => <option key={item.label}>{item.label}</option>)}
                        </optgroup>)}
                    </select>
                    <select aria-label="View" value={layout} onChange={event => onLayoutChange(event.target.value as ToolbarProps['layout'])}
                        className="rounded border border-divider bg-canvas p-2 text-sm text-content">
                        <option value="editor">Editor</option>
                        {!isNarrow && <option value="split">Split</option>}
                        <option value="preview">Preview</option>
                    </select>
                    <select aria-label="Theme" value={theme} onChange={event => onThemeChange(event.target.value as Theme)}
                        className="rounded border border-divider bg-canvas p-2 text-sm text-content capitalize">
                        {THEMES.map(name => <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>)}
                    </select>
                    {actions.map(({ label, icon: Icon, action }) => (
                        <Tooltip key={label}>
                            <TooltipTrigger asChild><button aria-label={label} onClick={event => { event.currentTarget.focus(); action(); }} className="tool-button"><Icon size={18} /></button></TooltipTrigger>
                            <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}
