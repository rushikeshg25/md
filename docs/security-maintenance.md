# Security maintenance — 2026-10-31

The dependency audit reported no known advisories before or after this update. This was a dependency and rendering-boundary review, not a penetration test or a guarantee that all vulnerabilities are absent.

## Dependency changes

| Package | Previous | Updated | Reason |
| --- | --- | --- | --- |
| Mermaid | 11.17.2 | 12.2.0 | Current stable renderer and parser fixes; preserve Dagre/classic defaults explicitly |
| Lucide React | 0.562.0 | 1.65.0 | Current stable icon package; existing imports remain compatible |
| TypeScript | 5.9.3 | 6.0.3 | Newest stable version supported by the installed TypeScript ESLint parser |
| Node types | 20.19.43 | 24.19.2 | Match the Node 24 runtime used in CI |

Next.js, React, Playwright, and the other direct runtime dependencies were already current. The KaTeX 0.19 override remains necessary because upstream dependencies still request older ranges.

ESLint stays on 9.39.5: `eslint-plugin-react@7.37.5` does not declare support for ESLint 10. TypeScript 7 is outside `typescript-eslint@8.72.1`'s supported range (`>=4.8.4 <6.1.0`). Node 26 types are intentionally excluded while CI runs Node 24. Recheck those constraints before future major upgrades; do not force peer dependencies.

[Mermaid 12's release notes](https://github.com/mermaid-js/mermaid/releases/tag/mermaid%4012.0.0) require ES2024-capable browsers, including Safari 17.4+, and Node 22.12+. The project's Node 22.18 minimum meets that requirement. Older Safari versions are no longer supported for diagram rendering. Explicit `layout: 'dagre'` and `look: 'classic'` retain the previous diagram appearance while preserving the app's light/dark theme selection.

## Protections and regression coverage

- Keep React Markdown's raw-HTML escaping and URL filtering, KaTeX's `trust: false`, and Mermaid's strict security mode.
- Add `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, and a CSP restricting frames, objects, base URLs, and form targets. Embedding the editor in an iframe is now blocked. These headers take effect when the updated Next.js application is deployed.
- The app CSP deliberately does not restrict scripts or inline styles: Next.js static hydration and CodeMirror require those capabilities. The standalone HTML export already uses a separate script-blocking CSP.
- Add browser tests for hostile HTML, JavaScript URLs, unsafe math commands, a Mermaid directive attempting to enable loose security, and the actual downloaded HTML export. The tests verify safe content still renders, unsafe attributes do not survive, and scripts do not execute.
- Run `bun audit` in CI after the frozen-lockfile install. New advisories fail the workflow instead of relying on a manual audit.

Mermaid strict mode sanitizes URLs but can retain an inert anchor element. The regression checks the sanitized destination, rather than assuming every anchor is removed. Remote Markdown images can still make network requests, and browser drafts remain accessible to scripts on the same origin.

## Local verification

| Check | Result |
| --- | --- |
| `bun install --frozen-lockfile` with Bun 1.4.4 | Passed without lockfile changes |
| `bun audit` before updates | No vulnerabilities found; 714 packages checked |
| `bun audit` after updates | No vulnerabilities found; 718 packages checked |
| `bun run lint` | Passed |
| `bun run typecheck` | Passed |
| `bun run test` | 20 passed |
| `bun run build` | Passed |
| Playwright browser coverage | All 80 cases passed across Chromium, Firefox, mobile Chromium, and mobile WebKit |

The first run passed 57 of 60 Chromium/Firefox cases; the three new security cases incorrectly expected Mermaid to remove all anchors. After correcting that assertion to require an inert URL, all six security cases passed in those projects. The full mobile WebKit run passed all 20 cases. No existing assertions were removed or skipped.

Local verification used macOS and the documented macOS 15 WebKit binary workaround from [the verification notes](verification.md). Linux CI uses the standard Playwright browser builds. Mobile profiles emulate devices; physical devices and production deployment behavior were not tested locally.
