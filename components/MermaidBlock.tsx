"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidBlockProps {
    chart: string;
    isDarkMode: boolean;
}

mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'loose',
});

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart, isDarkMode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: isDarkMode ? 'dark' : 'neutral',
        });
    }, [isDarkMode]);

    useEffect(() => {
        const renderChart = async () => {
            if (!ref.current) return;

            try {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, chart);
                setSvg(svg);
                setError(null);
            } catch (err: any) {
                console.error("Mermaid Render Error:", err);
                // Mermaid often throws error text into the DOM, but we can capture it here
                setError('Invalid Mermaid Syntax');
            }
        };

        renderChart();
    }, [chart, isDarkMode]);

    if (error) {
        return <div className="text-red-500 text-sm p-2 border border-red-500/20 bg-red-500/10 rounded">{error}</div>;
    }

    return (
        <div
            ref={ref}
            className="flex justify-center my-4 overflow-x-auto p-4 bg-neutral-50/5 dark:bg-neutral-900/50 rounded"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};
