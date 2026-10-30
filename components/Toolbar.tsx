"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Save, FolderOpen, Download, Eye, Columns, Maximize, FileText, Command as CommandIcon } from 'lucide-react';
import { EDITOR_TOOLS } from '@/lib/constants';
import { THEMES, type Theme } from '@/lib/preferences';

interface ToolbarProps {
    onInsert: (template: string) => void;
    onSave: () => void;
    onOpen: () => void;
    onDownload: () => void;
    togglePreview: () => void;
    toggleZenMode: () => void;
    openCommandPalette: () => void;
    showPreview: boolean;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}

export function Toolbar({ onInsert, onSave, onOpen, onDownload, togglePreview, toggleZenMode, openCommandPalette, showPreview, theme, onThemeChange }: ToolbarProps) {
    const actions = [
        { label: 'Open file', icon: FolderOpen, action: onOpen },
        { label: 'Command palette', icon: CommandIcon, action: openCommandPalette },
        { label: 'Save file', icon: Save, action: onSave },
        { label: 'Download Markdown', icon: Download, action: onDownload },
        { label: 'Print or save PDF', icon: FileText, action: () => window.print() },
        { label: showPreview ? 'Hide preview' : 'Show preview', icon: showPreview ? Columns : Eye, action: togglePreview },
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
                    <select aria-label="Theme" value={theme} onChange={event => onThemeChange(event.target.value as Theme)}
                        className="rounded border border-divider bg-canvas p-2 text-sm text-content capitalize">
                        {THEMES.map(name => <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>)}
                    </select>
                    {actions.map(({ label, icon: Icon, action }) => (
                        <Tooltip key={label}>
                            <TooltipTrigger asChild><button aria-label={label} onClick={action} className="tool-button"><Icon size={18} /></button></TooltipTrigger>
                            <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}
