import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://md.rushikesh.live'),
    title: 'Markdown Editor',
    description: 'A local-first Markdown editor with live preview, themes, charts, math and portable export.',
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        url: '/',
        siteName: 'Markdown Editor',
        title: 'Markdown Editor — Write. Preview. Make it yours.',
        description: 'Turn Markdown into beautiful documents. Live preview, themes, diagrams, math and export — right in your browser.',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Markdown Editor — Write. Preview. Make it yours.',
        description: 'Live Markdown preview, themes, diagrams, math and export — right in your browser.',
        images: [{ url: '/opengraph-image', alt: 'Markdown Editor with Markdown source beside a rendered preview.' }],
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <html lang="en"><body className="antialiased">{children}</body></html>;
}
