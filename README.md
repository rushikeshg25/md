# Markdown Editor

A local-first Markdown editor built with Next.js, React and CodeMirror. Write in the editor, view the rendered document, and export your work without an account.

## Features

- Editor, split and preview views. Phones use a full-width editor/preview switch.
- Choose **View → Reading mode** for a centered Markdown preview without editing controls. Use **Exit reading mode** or Escape to return to the previous view.
- Cursor-aware formatting, undo/redo, find/replace, synchronized scrolling and a keyboard-accessible divider.
- System, Light, Dark, Sepia and Midnight themes with saved preferences.
- Configurable Markdown extensions: GitHub tables/tasks/footnotes, KaTeX math, Mermaid diagrams/charts, syntax highlighting, single-line breaks and GitHub alerts.
- Templates for flowcharts, sequence diagrams, mind maps, pie charts, bar/line charts, Gantt charts, math and callouts.
- Document outline, heading anchors, code-copy buttons and SVG diagram downloads.
- Local draft recovery, including empty documents, with visible storage errors.
- Local Markdown file import/save, with file-input and download fallbacks for browsers without native file pickers.
- Markdown download, portable HTML export with SVG and MathML, and print/PDF through the browser.
- A searchable Ctrl/Cmd+K command palette with grouped file actions, view modes, formatting, templates, all themes and Markdown extension toggles. Available in Reading and Zen modes too, with current settings marked.

See the [Markdown guide](docs/markdown-guide.md) for syntax and the [research notes](docs/editor-research.md) for the feature comparison and sources.

## Run locally

Use Node.js **22.18 or newer** (Node 24 recommended) and **Bun 1.4.4**. `bun.lock` is the canonical lockfile.

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://localhost:3000. For a production server:

```sh
bun run build
bun run start
```

## Site identity and link previews

`app/icon.svg` is the favicon source, with `app/favicon.ico` and `app/apple-icon.png` as browser and Apple touch variants. `app/opengraph-image.tsx` generates the 1200×630 sharing card at build time. Titles, descriptions and the production URL (`https://md.rushikesh.live`) are set in `app/layout.tsx`; update that URL and the card's domain label when hosting on another domain. Sharing apps can cache old previews after deployment.

## Verification

```sh
bun run lint
bun run typecheck
bun run test
bun run build
bunx playwright install chromium firefox webkit
bun run test:e2e
bun audit
```

The browser suite starts the production build on port **3100**, which must be free. It exercises desktop Chromium/Firefox and mobile Chromium/WebKit. Build before running it. On Linux, use `bunx playwright install --with-deps chromium firefox webkit` to install browser system prerequisites. Failed runs retain traces in `test-results/`. CI runs the same lint, type, unit, build and browser checks.

Tests use Node's native TypeScript support for small modules. Browser tests cover persistence, formatting/undo, themes, extensions, diagram recovery, portable files, modal focus, outline/copy behavior, export and mobile layout.

## Shortcuts

| Shortcut | Action |
| --- | --- |
| Cmd/Ctrl + K | Command palette |
| Cmd/Ctrl + S | Save file or start a download |
| Cmd/Ctrl + F | Find/replace in the editor |
| Cmd/Ctrl + Z | Undo |
| Escape | Close the palette or leave Zen mode |
| Left/Right on the divider | Resize by 5 percentage points |
| Home/End on the divider | Set editor width to 20%/80% |

## Storage, rendering and export

The app keeps one draft and preferences in this browser's local storage. Autosave waits 250 ms after editing and flushes when the page becomes hidden. It is not a disk save or a backup. Browser storage can be cleared or denied; use Save or Download for durable copies. Multiple tabs share the draft slot. Opening a file asks before replacing a nonempty document.

Raw HTML is escaped, unsafe link protocols are filtered, Mermaid uses strict mode, and KaTeX trust is disabled. The extension list is curated; arbitrary JavaScript plugin loading is not supported. See the guide for supported chart formats. Large diagrams may take time to render; export asks you to retry while rendering is pending.

HTML export includes rendered diagrams and native MathML equations without runtime scripts or external fonts. Remote images and external links still need network access. Browser print/PDF uses a light document style even when the editor is dark. Save to PDF from the browser's print dialog.

KaTeX is overridden to the patched 0.19 series throughout the dependency tree because the Markdown/Mermaid packages still request an older range. Rendering and untrusted-command regression tests cover this integration. Recheck the override when those upstream ranges advance.

Cloud sync, collaboration, arbitrary chart libraries and full offline app installation are not included.
