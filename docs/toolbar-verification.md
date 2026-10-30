# Toolbar and themes — verification, 2026-10-31

Verified locally on macOS (Apple Silicon) against a production build. This report covers the toolbar refresh, GitHub Light/GitHub Dark/Nord themes, and the related responsive and keyboard fixes.

## Results

| Check | Final result |
| --- | --- |
| `bun run lint` | Passed, zero warnings |
| `bun run typecheck` | Passed |
| `bun run test` | 20 passed |
| `bun run build` | Passed |
| Desktop Chromium | 18 browser tests passed |
| Desktop Firefox | 18 browser tests passed |
| Mobile Chromium | 18 browser tests passed |
| Mobile WebKit | 18 browser tests passed using the compatibility build below |
| `git diff --check` | Passed |

The final browser runs passed all 72 cases. Earlier runs exposed a search-panel CSS specificity issue and a WebKit command-button focus regression; both were fixed before the final runs. No tests were disabled or skipped to obtain these results.

## Coverage

[Toolbar tests](../tests/e2e/toolbar.spec.ts) check:

- Control visibility and page overflow at 320, 390, 768, and 1280 pixels wide, including long filenames.
- Usable editor space with expanded Markdown settings at 320×568.
- Keyboard access to formatting controls inside the horizontal scroll area.
- Command-menu input and footer visibility on a short landscape screen.
- All seven fixed themes, saved preferences after reload, and the matching light/dark rendering mode.
- Consistent colors across the toolbar, editor, selects, search panel, and command menu.
- At least 4.5:1 text contrast for the Commands button in its tested state.
- Diagram rendering and transparent code-block text backgrounds in every fixed theme.

The [existing editor suite](../tests/e2e/editor.spec.ts) also verifies System theme changes, file operations, storage failures, native editing, undo, extension settings, templates, outline links, clipboard actions, export/print, Reading/Zen modes, and command-menu focus restoration. Desktop and mobile screenshots were inspected for the toolbar and new themes.

## Browser commands

```sh
npx playwright test --project=chromium --project=firefox --project=mobile-chromium

PLAYWRIGHT_BROWSERS_PATH=/tmp/md-playwright-compat \
PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=mac15-arm64 \
npx playwright test --project=mobile-webkit
```

WebKit uses the isolated official macOS 15 build of revision 2370 because the default macOS 26 binary crashes on this host. Setup details are in the [earlier verification report](verification.md#local-webkit-prerequisite). CI uses the standard Linux builds.

Mobile projects emulate device layouts; this is not physical-device testing. These checks establish local behavior, not a production deployment or a remote CI result. No dependencies changed, so the dependency audit was not repeated for this batch.
