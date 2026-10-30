<img src="app/icon.svg" width="64" height="64" alt="Markdown Editor icon" />

# Markdown Editor

Write Markdown, preview it live, and export a finished document—all in your browser. A local-first editor with themes, diagrams, math, and a focused reading experience. No account required.

**[Open the editor](https://md.rushikesh.live)** · [Markdown guide](docs/markdown-guide.md) · [Development](#development) · [Verification](#verification)

## Features

- **Live editing:** CodeMirror with syntax-aware editing, selection-aware formatting, undo/redo, find and replace, synchronized scrolling, and a resizable split view.
- **Flexible views:** Editor, Split, Preview, and Reading mode, plus Zen mode to hide controls around the current workspace. Mobile layouts use full-width Editor or Preview views.
- **Themes:** Light, Dark, Sepia, and Midnight, or System to follow your device. Preferences stay in your browser.
- **Rich Markdown:** Tables, task lists, footnotes, alerts, syntax-highlighted code, and KaTeX math. Enable or disable extensions individually.
- **Diagrams and charts:** Mermaid flowcharts, sequence diagrams, mind maps, Gantt charts, pie charts, and bar/line charts, with ready-to-insert templates and SVG downloads.
- **Document tools:** Heading outline, anchor links, code-copy buttons, local file import, draft recovery, Markdown downloads, standalone HTML export, and print/PDF.
- **Command palette:** Ctrl/Cmd+K brings together file actions, views, formatting, templates, themes, and extension settings in searchable categories.

## Using the editor

1. Open [md.rushikesh.live](https://md.rushikesh.live) and start writing, or choose **Open file** to load a `.md`, `.markdown`, or `.txt` file.
2. Choose a layout from the **View** dropdown beside **Insert…**. The dropdown displays the current view: Editor, Split, or Preview.
3. Use **Insert…** for chart and Markdown examples. Open **Markdown extensions** to choose which syntax features render.
4. Use **Save file** or **Download Markdown** to keep a copy. Choose **Export HTML** or **Print or save PDF** for a rendered document.

### Views and focus modes

| Mode | What it shows | How to open it |
| --- | --- | --- |
| Editor | Editable Markdown source | View → Editor |
| Split | Source and rendered preview side by side | View → Split, on wider screens |
| Preview | Rendered Markdown with editing controls available | View → Preview |
| Reading mode | A centered rendered document with editing controls hidden | View → Reading mode |
| Zen mode | The current workspace with toolbars and status bars hidden | Expand icon in the toolbar, or the command palette |

Reading mode displays the rendered document. Zen mode preserves your current layout, so it can still show the source editor. Use the visible exit button or **Escape** to leave either mode. Leaving Reading mode restores the previous view and preserves undo history.

### Command palette and shortcuts

Press **Ctrl+K** on Windows/Linux or **Cmd+K** on macOS. Search by action, category, or description—for example, `reading`, `theme`, `Mermaid`, or `export`. The palette is also available in Reading and Zen modes. Current views and themes have a check mark; extension commands show their on/off state.

| Shortcut | Action |
| --- | --- |
| Ctrl/Cmd + K | Open or close the command palette |
| Ctrl/Cmd + S | Save the file, or download it when a save picker is unavailable |
| Ctrl/Cmd + F | Find and replace while the source editor has focus |
| Ctrl/Cmd + Z | Undo while editing |
| ↑ / ↓, then Enter | Select and run a command in the palette |
| Escape | Close the command palette, or leave Reading/Zen mode |
| ← / → on the focused divider | Resize the split view by 5 percentage points |
| Home / End on the focused divider | Set the editor width to 20% / 80% |

For syntax examples and supported diagram types, see the [Markdown guide](docs/markdown-guide.md).

## Files, drafts, and export

The editor keeps **one draft per browser storage context**, together with its filename and preferences. Drafts save after a short typing pause and when the page becomes hidden. Multiple tabs on the same site share that draft slot.

Browser autosave is separate from saving a file to disk. Storage can be cleared, denied, or become full; use **Save file** or **Download Markdown** for a durable copy. Opening another file asks before replacing a nonempty document.

Native file pickers are used where supported. Other browsers use a file-input dialog for opening and a download for saving. Local files must be selected by the user; a URL containing a filename does not grant the site access to that file.

| Export | Contents |
| --- | --- |
| Markdown | The original Markdown source |
| HTML | A standalone rendered document, including SVG diagrams and MathML equations, without runtime scripts or external fonts |
| PDF | The browser's print output; select **Save as PDF** in the print dialog |
| SVG | An individual rendered diagram, downloaded from its controls |

Print/PDF uses a light document style regardless of the active theme. Large diagrams can take time to render; export asks you to retry if the preview is still being prepared. Remote images in documents and exported HTML still require network access.

## Development

### Requirements

- **Node.js 22.18 or newer**; Node 24 is used in CI.
- **Bun 1.4.4**, as specified in [package.json](package.json). Use the committed `bun.lock` for dependency installation.

```sh
git clone https://github.com/rushikeshg25/md.git
cd md
bun install --frozen-lockfile
bun run dev
```

Open [localhost:3000](http://localhost:3000).

To run a production build locally:

```sh
bun run build
bun run start
```

### Project structure

| Path | Purpose |
| --- | --- |
| [app/page.tsx](app/page.tsx) | Editor workspace, view modes, and action wiring |
| [app/globals.css](app/globals.css) | Themes, Markdown styling, command menu, and print layout |
| [components/](components/) | Editor, preview, toolbar, command palette, and document controls |
| [hooks/](hooks/) | Drafts, preferences, responsive layout, resizing, and scroll sync |
| [lib/](lib/) | Markdown pipeline, storage, templates, formatting, and export helpers |
| [tests/](tests/) | Unit/render checks and Playwright browser tests |
| [docs/](docs/) | Syntax guide, research, and dated verification notes |

Built with Next.js, React, TypeScript, CodeMirror, Tailwind CSS, react-markdown, Mermaid, and KaTeX. The [package manifest](package.json) is the source of truth for versions and scripts.

### Site identity and link previews

The production URL is `https://md.rushikesh.live`. When hosting on another domain, update `metadataBase` in [app/layout.tsx](app/layout.tsx) and the domain label in [app/opengraph-image.tsx](app/opengraph-image.tsx).

- [app/layout.tsx](app/layout.tsx) defines the page title, description, canonical URL, and Open Graph/Twitter metadata.
- [app/opengraph-image.tsx](app/opengraph-image.tsx) generates the 1200×630 sharing card at build time.
- [app/icon.svg](app/icon.svg) is the favicon source. [app/favicon.ico](app/favicon.ico) and [app/apple-icon.png](app/apple-icon.png) provide browser and Apple touch variants.

Sharing apps may cache an older preview after deployment.

## Verification

Run the code checks and build before browser tests:

```sh
bun run lint
bun run typecheck
bun run test
bun run build
bunx playwright install chromium firefox webkit
bun run test:e2e
```

On Linux, use `bunx playwright install --with-deps chromium firefox webkit` to install the required system libraries. Run `bun audit` separately to check dependency advisories.

The Playwright suite starts a production server on **port 3100**, which must be free. It covers desktop Chromium/Firefox and mobile Chromium/WebKit profiles. Mobile profiles emulate device layouts; they are not physical-device tests. Failures retain traces in `test-results/`.

Coverage includes document recovery, native input and undo, themes, Markdown extensions, diagrams, file operations, export, command-menu navigation, Reading/Zen modes, and responsive layouts. [GitHub Actions](.github/workflows/checks.yml) runs lint, type, unit, build, and browser checks on pushes and pull requests. See the [dated verification notes](docs/verification.md) for an earlier test run and the macOS WebKit compatibility workaround.

## Rendering boundaries

Raw HTML is displayed as text, unsafe link protocols are filtered, Mermaid uses strict security settings, and KaTeX runs with trust disabled. Extensions are curated; arbitrary JavaScript plugins are not loaded. Chart.js, Vega, and PlantUML fences remain source code.

KaTeX is overridden to the patched 0.19 series in [package.json](package.json) because upstream Markdown/Mermaid dependencies still request an older range. Rendering and untrusted-command regression tests cover the integration; review the override when those dependencies change.

Cloud sync, real-time collaboration, and an installable offline app are not currently included.

## Contributing

Keep changes focused and include a reproduction for bug reports. For behavior changes, update the relevant documentation and add regression coverage where it helps. Run the checks above before opening a pull request, and include desktop/mobile verification for interface changes.

The [research notes](docs/editor-research.md) document the editor comparison and sources behind the feature choices.
