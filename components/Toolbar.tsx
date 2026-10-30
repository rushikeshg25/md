"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Save, FolderOpen, Download, Search, Maximize, FileText, FileCode, Printer, Command as CommandIcon } from 'lucide-react';
import { EDITOR_TOOLS } from '@/lib/constants';
import { TEMPLATES } from '@/lib/templates';
import { THEMES, THEME_LABELS, type Theme } from '@/lib/preferences';

interface ToolbarProps {
    filename: string;
    status: string;
    onInsert: (template: string) => void;
    onSave: () => void;
    onOpen: () => void;
    onDownload: () => void;
    onExportHtml: () => void;
    onPrint: () => void;
    layout: 'editor' | 'split' | 'preview';
    onLayoutChange: (layout: 'editor' | 'split' | 'preview') => void;
    onReadingMode: () => void;
    isNarrow: boolean;
    onSearch: () => void;
    toggleZenMode: () => void;
    openCommandPalette: () => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}

export function Toolbar({ filename, status, onInsert, onSave, onOpen, onDownload, onExportHtml, onPrint, layout, onLayoutChange, onReadingMode, isNarrow, onSearch, toggleZenMode, openCommandPalette, theme, onThemeChange }: ToolbarProps) {
    const actions = [
        { label: 'Open file', text: 'Open', icon: FolderOpen, action: onOpen },
        { label: 'Save file', text: 'Save', icon: Save, action: onSave },
        { label: 'Download Markdown', icon: Download, action: onDownload },
        { label: 'Export HTML', icon: FileCode, action: onExportHtml },
        { label: 'Print or save PDF', icon: Printer, action: onPrint },
        { label: 'Find and replace', icon: Search, action: onSearch },
        { label: 'Zen mode', icon: Maximize, action: toggleZenMode },
    ];
    return (
        <TooltipProvider delayDuration={300}>
            <header className="toolbar" aria-label="Editor toolbar">
                <div className="toolbar-main">
                    <div className="toolbar-document">
                        <span className="toolbar-document-icon"><FileText size={20} aria-hidden="true" /></span>
                        <div className="toolbar-document-copy">
                            <div className="toolbar-filename" title={filename}>{filename}</div>
                            <div className="document-status" role="status">{status}</div>
                        </div>
                    </div>
                    <div className="toolbar-file-actions" role="group" aria-label="File and workspace actions">
                        {actions.map(({ label, icon: Icon, action, text }, index) => (
                            <Tooltip key={label}>
                                <TooltipTrigger asChild>
                                    <button aria-label={label} onClick={event => { event.currentTarget.focus(); action(); }} className={`tool-button toolbar-action ${index === 2 || index === 5 ? 'toolbar-group-start' : ''}`}>
                                        <Icon size={18} aria-hidden="true" />{text && <span>{text}</span>}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>{label}</TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                    <button aria-label="Command palette" aria-haspopup="dialog" onClick={openCommandPalette} className="command-launch">
                        <CommandIcon size={18} aria-hidden="true" /><span>Commands</span><kbd>Ctrl/⌘ K</kbd>
                    </button>
                </div>
                <div className="toolbar-editor-row">
                    <div className="toolbar-formatting" role="group" aria-label="Formatting">
                        {EDITOR_TOOLS.map((tool, index) => (
                            <Tooltip key={tool.label}>
                                <TooltipTrigger asChild>
                                    <button aria-label={tool.label} onMouseDown={event => event.preventDefault()} onClick={() => onInsert(tool.template)}
                                        className={`tool-button ${[2, 4, 9, 12].includes(index) ? 'toolbar-group-start' : ''}`}>
                                        <tool.icon size={17} aria-hidden="true" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>{tool.label}</TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                    <div className="toolbar-selectors" role="group" aria-label="Document actions">
                        <label className="toolbar-control">
                            <span>Insert</span>
                            <select aria-label="Insert template" value="" onChange={event => {
                                const template = TEMPLATES.find(item => item.label === event.target.value);
                                if (template) onInsert(`\n\n${template.source}\n\n`);
                            }}>
                                <option value="" disabled>Insert…</option>
                                {['Charts', 'Diagrams', 'Markdown'].map(category => <optgroup key={category} label={category}>
                                    {TEMPLATES.filter(item => item.category === category).map(item => <option key={item.label}>{item.label}</option>)}
                                </optgroup>)}
                            </select>
                        </label>
                        <label className="toolbar-control">
                            <span>View</span>
                            <select aria-label="View" value={layout} onChange={event => {
                                if (event.target.value === 'reading') onReadingMode();
                                else onLayoutChange(event.target.value as ToolbarProps['layout']);
                            }}>
                                <option value="editor">Editor</option>
                                {!isNarrow && <option value="split">Split</option>}
                                <option value="preview">Preview</option>
                                <option value="reading">Reading mode</option>
                            </select>
                        </label>
                        <label className="toolbar-control">
                            <span>Theme</span>
                            <select aria-label="Theme" value={theme} onChange={event => onThemeChange(event.target.value as Theme)}>
                                {THEMES.map(name => <option key={name} value={name}>{THEME_LABELS[name]}</option>)}
                            </select>
                        </label>
                    </div>
                </div>
            </header>
        </TooltipProvider>
    );
}
