import {
    Bold, Italic, Link, Image, Table, Heading1, Heading2,
    Quote, List, ListOrdered, Code, FileCode, CheckSquare
} from 'lucide-react';

export const EDITOR_TOOLS = [
    { icon: Bold, label: 'Bold', template: '**bold** ', actionType: 'insert' },
    { icon: Italic, label: 'Italic', template: '*italic* ', actionType: 'insert' },
    { icon: Heading1, label: 'H1', template: '# ', actionType: 'insert' },
    { icon: Heading2, label: 'H2', template: '## ', actionType: 'insert' },
    { icon: Link, label: 'Link', template: '[text](url) ', actionType: 'insert' },
    { icon: Image, label: 'Image', template: '![alt](url) ', actionType: 'insert' },
    { icon: Quote, label: 'Quote', template: '> quote ', actionType: 'insert' },
    { icon: Code, label: 'Code', template: '`code` ', actionType: 'insert' },
    { icon: FileCode, label: 'Block', template: '\n```\ncode block\n```\n', actionType: 'insert' },
    { icon: List, label: 'List', template: '- item ', actionType: 'insert' },
    { icon: ListOrdered, label: 'Ordered List', template: '1. item ', actionType: 'insert' },
    { icon: CheckSquare, label: 'Task', template: '- [ ] task ', actionType: 'insert' },
    { icon: Table, label: 'Table', template: '\n| Header | Header |\n| --- | --- |\n| Cell | Cell |\n', actionType: 'insert' },
];
