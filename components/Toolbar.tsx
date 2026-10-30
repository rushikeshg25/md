"use client";

import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Save, FolderOpen, Download, Sun, Moon, Eye, Columns, Maximize, Minimize, FileText, Command as CommandIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { EDITOR_TOOLS } from '@/lib/constants';

interface ToolbarProps {
    onInsert: (template: string) => void;
    onSave: () => void;
    onOpen: () => void;
    onDownload: () => void;
    togglePreview: () => void;
    toggleTheme: () => void;
    toggleZenMode: () => void;
    openCommandPalette: () => void;
    showPreview: boolean;
    isDarkMode: boolean;
    zenMode: boolean;
    className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    onInsert, onSave, onOpen, onDownload, togglePreview, toggleTheme, toggleZenMode, openCommandPalette, showPreview, isDarkMode, zenMode, className
}) => {
    const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

    return (
        <TooltipProvider>
            <div className={cn("flex items-center justify-between p-2 border-b bg-neutral-900 border-neutral-800 dark:bg-neutral-900 dark:border-neutral-800 light:bg-white light:border-gray-200 overflow-x-auto", className)}>
                <div className="flex items-center gap-1">
                    {EDITOR_TOOLS.map((tool, idx) => (
                        <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                                <button
                                    aria-label={tool.label}
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => onInsert(tool.template)}
                                    className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                                >
                                    <tool.icon size={18} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{tool.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button aria-label="Toggle theme" onClick={toggleTheme} className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isDarkMode ? "Light Mode" : "Dark Mode"}</p>
                        </TooltipContent>
                    </Tooltip>

                    <div className="mx-2 w-px h-6 bg-neutral-800/50" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button aria-label="Open file" onClick={onOpen} className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                                <FolderOpen size={18} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Open File</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button aria-label="Command palette" onClick={openCommandPalette} className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                                <CommandIcon size={18} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Command Palette (Cmd+K)</p>
                        </TooltipContent>
                    </Tooltip>


                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button aria-label="Save file" onClick={onSave} className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                                <Save size={18} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Save (Ctrl+S)</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button aria-label="Download Markdown" onClick={onDownload} className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                                <Download size={18} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Download .md</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button aria-label="Print or save PDF" onClick={() => window.print()} className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                                <FileText size={18} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Export to PDF (Print)</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button aria-label="Toggle preview" onClick={togglePreview} className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                                {showPreview ? <Columns size={18} /> : <Eye size={18} />}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{showPreview ? "Hide Preview" : "Show Preview"}</p>
                        </TooltipContent>
                    </Tooltip>

                    <div className="mx-2 w-px h-6 bg-neutral-800/50" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button aria-label="Toggle Zen mode" onClick={toggleZenMode} className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                                {zenMode ? <Minimize size={18} /> : <Maximize size={18} />}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{zenMode ? "Exit Zen Mode (Esc)" : "Zen Mode"}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
};
