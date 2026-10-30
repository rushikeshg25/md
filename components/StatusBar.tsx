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
        <div className={`h-6 w-full bg-surface border-t border-divider text-xs text-muted flex items-center justify-end px-4 gap-4 select-none ${className}`}>
            <div className="flex items-center gap-1">
                <span className="font-medium text-content">{cursorLine}:{cursorCol}</span>
            </div>
            <div className="w-px h-3 bg-divider" />
            <div className="flex items-center gap-1">
                <span className="font-medium text-content">{wordCount}</span>
                <span>words</span>
            </div>
            <div className="w-px h-3 bg-divider" />
            <div className="flex items-center gap-1">
                <span className="font-medium text-content">{charCount}</span>
                <span>chars</span>
            </div>
        </div>
    );
};
