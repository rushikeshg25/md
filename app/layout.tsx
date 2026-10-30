import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Markdown Editor',
    description: 'A local-first Markdown editor with live preview, themes, charts, math and portable export.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <html lang="en"><body className="antialiased">{children}</body></html>;
}
