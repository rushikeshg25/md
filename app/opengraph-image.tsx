import { ImageResponse } from 'next/og';

export const alt = 'Markdown Editor with Markdown source beside a rendered preview.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
    return new ImageResponse(
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '48px 56px', background: '#101b2d', color: '#e7eef9', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <svg width="48" height="48" viewBox="0 0 64 64">
                    <rect width="64" height="64" rx="16" fill="#22344d" />
                    <path d="M12 43V21h6l8 10 8-10h6v22h-7V32l-7 9-7-9v11z" fill="#e7eef9" />
                    <path d="M49 21v19m-6-6 6 6 6-6" fill="none" stroke="#70efc3" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 26, fontWeight: 700 }}>Markdown Editor</span>
                <span style={{ marginLeft: 'auto', color: '#a4b6cf', fontSize: 22 }}>md.rushikesh.live</span>
            </div>
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 46 }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: 470 }}>
                    <div style={{ color: '#70efc3', fontSize: 18, letterSpacing: 3, marginBottom: 20 }}>YOUR WORDS. YOUR SPACE.</div>
                    <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.08, letterSpacing: -3 }}>Write. Preview.</div>
                    <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.08, letterSpacing: -3, color: '#70efc3' }}>Make it yours.</div>
                    <div style={{ display: 'flex', flexDirection: 'column', color: '#a4b6cf', fontSize: 25, lineHeight: 1.5, marginTop: 24 }}><span>A live Markdown editor.</span><span>All in your browser.</span></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', width: 570, border: '1px solid #364b67', borderRadius: 20, background: '#18263c', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #364b67', fontSize: 17, color: '#a4b6cf' }}>
                        <span style={{ color: '#70efc3', marginRight: 12 }}>●</span> ideas.md
                        <span style={{ marginLeft: 'auto' }}>Live preview</span>
                    </div>
                    <div style={{ display: 'flex', minHeight: 260 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '50%', padding: 24, borderRight: '1px solid #364b67', fontFamily: 'monospace', fontSize: 19, lineHeight: 1.8 }}>
                            <span style={{ color: '#70efc3' }}># A little idea</span>
                            <span style={{ color: '#a4b6cf', marginTop: 12 }}>Make it **bold**.</span>
                            <span style={{ color: '#a4b6cf', marginTop: 12 }}>- [x] Write</span>
                            <span style={{ color: '#a4b6cf' }}>- [x] Create</span>
                            <span style={{ color: '#a4b6cf' }}>- [ ] Share</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '50%', padding: 24, fontSize: 20, lineHeight: 1.8 }}>
                            <span style={{ fontSize: 27, fontWeight: 700 }}>A little idea</span>
                            <div style={{ display: 'flex', marginTop: 12 }}>Make it <b style={{ marginLeft: 5 }}>bold.</b></div>
                            {['Write', 'Create', 'Share'].map((label, index) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: index === 0 ? 12 : 0 }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16">
                                        <rect x="1" y="1" width="14" height="14" rx="3" stroke="#70efc3" fill={index < 2 ? '#70efc3' : 'none'} />
                                        {index < 2 && <path d="m4 8 3 3 5-6" fill="none" stroke="#101b2d" strokeWidth="2" />}
                                    </svg>
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 20, color: '#a4b6cf', borderTop: '1px solid #364b67', paddingTop: 24 }}>
                <span>Themes</span><span style={{ color: '#70efc3' }}> / </span>
                <span>Diagrams & charts</span><span style={{ color: '#70efc3' }}> / </span>
                <span>Math</span><span style={{ color: '#70efc3' }}> / </span>
                <span>Portable export</span>
            </div>
        </div>,
        size,
    );
}
