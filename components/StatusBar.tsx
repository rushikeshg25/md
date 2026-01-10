"use client";

import React from 'react';

interface StatusBarProps {
    wordCount: number;
    charCount: number;
    cursorLine: number;
    cursorCol: number;
    className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
    wordCount, charCount, cursorLine, cursorCol, className
}) => {
    return (
        <div className={`h-6 w-full bg-neutral-900 border-t border-neutral-800 text-xs text-neutral-500 flex items-center justify-end px-4 gap-4 select-none ${className}`}>
            <div className="flex items-center gap-1">
                <span className="font-medium text-neutral-400">{cursorLine}:{cursorCol}</span>
            </div>
            <div className="w-px h-3 bg-neutral-800" />
            <div className="flex items-center gap-1">
                <span className="font-medium text-neutral-400">{wordCount}</span>
                <span>words</span>
            </div>
            <div className="w-px h-3 bg-neutral-800" />
            <div className="flex items-center gap-1">
                <span className="font-medium text-neutral-400">{charCount}</span>
                <span>chars</span>
            </div>
        </div>
    );
};
