export const TEMPLATES = [
    { label: 'Flowchart', category: 'Diagrams', source: '```mermaid\nflowchart LR\n    A[Write Markdown] --> B{Preview looks right?}\n    B -->|Yes| C[Export]\n    B -->|No| A\n```' },
    { label: 'Sequence diagram', category: 'Diagrams', source: '```mermaid\nsequenceDiagram\n    participant Browser\n    participant API\n    Browser->>API: GET /documents\n    API-->>Browser: Markdown content\n```' },
    { label: 'Pie chart', category: 'Charts', source: '```mermaid\npie showData\n    title Project time\n    "Writing" : 45\n    "Review" : 30\n    "Research" : 25\n```' },
    { label: 'Bar chart', category: 'Charts', source: '```mermaid\nxychart-beta\n    title "Weekly progress"\n    x-axis [Mon, Tue, Wed, Thu, Fri]\n    y-axis "Tasks" 0 --> 20\n    bar [4, 8, 12, 9, 16]\n```' },
    { label: 'Line chart', category: 'Charts', source: '```mermaid\nxychart-beta\n    title "Monthly readers"\n    x-axis [Jan, Feb, Mar, Apr, May]\n    y-axis "Readers" 0 --> 100\n    line [15, 35, 30, 65, 90]\n```' },
    { label: 'Gantt chart', category: 'Charts', source: '```mermaid\ngantt\n    title Release plan\n    dateFormat YYYY-MM-DD\n    section Work\n    Research :done, research, 2026-11-01, 3d\n    Build :active, build, after research, 5d\n    Review :after build, 2d\n```' },
    { label: 'Mind map', category: 'Diagrams', source: '```mermaid\nmindmap\n  root((Document))\n    Research\n    Draft\n    Review\n    Publish\n```' },
    { label: 'Math equation', category: 'Markdown', source: '$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$' },
    { label: 'Note callout', category: 'Markdown', source: '> [!NOTE]\n> Add useful context here.' },
    { label: 'Footnote', category: 'Markdown', source: 'A claim with a reference[^reference].\n\n[^reference]: Add the source here.' },
] as const;
