"use client";

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import {
    FileText, Save, FolderOpen, Download,
    Maximize, Minimize, Eye, Sun
} from 'lucide-react';

import { EDITOR_TOOLS } from '@/lib/constants';

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOpen: () => void;
    onSave: () => void;
    onDownload: () => void;
    togglePreview: () => void;
    toggleTheme: () => void;
    toggleZenMode: () => void;
    onInsert: (template: string) => void;
    isDarkMode: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    open, onOpenChange, onOpen, onSave, onDownload, togglePreview, toggleTheme, toggleZenMode, onInsert, isDarkMode
}) => {
    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        }
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [open, onOpenChange]);

    const run = (action: () => void) => {
        action();
        onOpenChange(false);
    }

    const itemClass = `flex items-center gap-2 px-2 py-2 text-sm rounded cursor-pointer transition-colors ${isDarkMode
        ? 'text-neutral-300 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white'
        : 'text-gray-700 data-[selected=true]:bg-gray-200 data-[selected=true]:text-gray-900'
        }`;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm transition-opacity">
            <Command className={`w-[600px] max-w-[90vw] rounded-xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-gray-200 text-gray-800'}`}>
                <div className="flex items-center border-b border-neutral-800 px-3" cmdk-input-wrapper="">
                    <Command.Input
                        autoFocus
                        placeholder="Type a command or search..."
                        className={`flex h-12 w-full bg-transparent px-2 text-sm outline-none placeholder:text-neutral-500`}
                    />
                </div>
                <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                    <Command.Empty className="py-6 text-center text-sm text-neutral-500">No results found.</Command.Empty>

                    <Command.Group heading="File Actions" className="mb-2 text-xs font-medium text-neutral-500 px-2 slide-in-from-top-1">
                        <Command.Item onSelect={() => run(onOpen)} className={itemClass}>
                            <FolderOpen size={14} /> Open File
                        </Command.Item>
                        <Command.Item onSelect={() => run(onSave)} className={itemClass}>
                            <Save size={14} /> Save File
                        </Command.Item>
                        <Command.Item onSelect={() => run(onDownload)} className={itemClass}>
                            <Download size={14} /> Download .md
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="View" className="mb-2 text-xs font-medium text-neutral-500 px-2">
                        <Command.Item onSelect={() => run(togglePreview)} className={itemClass}>
                            <Eye size={14} /> Toggle Preview
                        </Command.Item>
                        <Command.Item onSelect={() => run(toggleZenMode)} className={itemClass}>
                            <Maximize size={14} /> Toggle Zen Mode
                        </Command.Item>
                        <Command.Item onSelect={() => run(toggleTheme)} className={itemClass}>
                            <Sun size={14} /> Toggle Theme
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Insert" className="mb-2 text-xs font-medium text-neutral-500 px-2">
                        {EDITOR_TOOLS.map((tool, idx) => (
                            <Command.Item key={idx} onSelect={() => run(() => onInsert(tool.template))} className={itemClass}>
                                <tool.icon size={14} /> {tool.label}
                            </Command.Item>
                        ))}
                    </Command.Group>
                </Command.List>
            </Command>
        </div>
    );
};
