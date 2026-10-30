# Verification — 2026-10-30

Verified locally on macOS 26.0 (Apple Silicon), Node 24.22.1 and Bun 1.4.4.

| Check | Result |
| --- | --- |
| `bun install --frozen-lockfile` | Passed with the text lockfile |
| `bun run lint` | Passed, zero warnings |
| `bun run typecheck` | Passed |
| `bun run test` | 19 passed |
| `bun run build` | Passed; editor route prerendered |
| Desktop Chromium | 13 browser tests passed |
| Desktop Firefox | 13 browser tests passed |
| Mobile Chromium (Pixel 7 profile) | 13 browser tests passed |
| Mobile WebKit (iPhone 13 profile) | 13 browser tests passed using the compatibility build below |
| `bun audit` | No vulnerabilities found; 714 packages checked |

Browser checks ran against the production build. They cover draft recovery and storage failures, formatting and undo, native text input, theme persistence/system changes, extensions, all seven diagram/chart templates, invalid-diagram recovery, file import/download, keyboard focus, outlines, code copying, heading/footnote navigation, scroll sync, HTML export, print styles, PDF generation in Chromium, and responsive layouts. Mobile profiles are browser emulation, not physical-device testing.

## Local WebKit prerequisite

The default WebKit macOS 26 binary crashed before opening a page on this host. The official macOS 15 build of the same WebKit revision (2370) passed in an isolated directory:

```sh
PLAYWRIGHT_BROWSERS_PATH=/tmp/md-playwright-compat \
PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=mac15-arm64 \
PLAYWRIGHT_DOWNLOAD_HOST=https://cdn.playwright.dev \
bunx playwright install webkit

PLAYWRIGHT_BROWSERS_PATH=/tmp/md-playwright-compat \
PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=mac15-arm64 \
bunx playwright test --project=mobile-webkit
```

The other projects ran with the normal browser installation:

```sh
bunx playwright test --project=chromium --project=firefox --project=mobile-chromium
```

CI uses the normal Linux browser builds. These results do not establish a production deployment or a remote CI result. Remote images in exported HTML still need network access; arbitrary JavaScript plugins and other chart languages are not installed.
