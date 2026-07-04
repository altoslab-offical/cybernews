# CyberNews Codex Operating Rules

## Chrome QA Isolation

- All browser-facing QA for CyberNews must use Tommy's existing Google Chrome profile through the Codex Chrome extension only.
- Before any visible front-end QA, open or reuse a dedicated Chrome tab group named `CYBERNEWS QA` or a task-specific CyberNews QA group. Keep all test tabs inside that group.
- Do not run visible QA in Tommy's active personal tabs, detached/incognito windows, Safari, or cloud browsers. If the QA group cannot be created or found, stop and repair that route before continuing visible QA.
- Headless Playwright or command-line checks are allowed only as supplementary automation. Completion still requires visible front-end evidence from the dedicated Chrome QA group through the Chrome extension.
- When a URL includes an explicit `lang` parameter or the user is validating a locale, verify that cross-page navigation preserves that locale preference in the same Chrome QA group.
