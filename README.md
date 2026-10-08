# 0x1d1e / The idle workbench

A standalone, statically generated landing page for [0x1d1e](https://github.com/0x1d1e). Six editorial sections connect three interactive studies: Kanade’s anchored island, Kinetix’s routing decisions and Merro’s approval/review lifecycle.

## Run

Use Node 22.12+ and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm build
pnpm preview
```

Deploy the contents of `build/` to a static host at the domain root. No server, credentials or runtime GitHub access required. Subpath deployment needs SvelteKit `kit.paths.base` configuration and matching anchor/link handling.

## Verify

```sh
pnpm check
pnpm lint
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
```

For an existing system browser, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its absolute path. Linux CI may need `pnpm exec playwright install --with-deps chromium`.

Playwright writes full-page captures to `test-results/` and an HTML report to `playwright-report/`. Browser coverage and viewport sizes live in `tests/site.spec.ts`.

## Content and limits

Project metadata and pinned public evidence live in `src/lib/content.ts`; invalid entries fail during prerendering. Before changing a claim or demonstration, read its linked upstream source. Update the source revision when behavior changes. Do not infer stability or maintenance from public availability.

All demonstrations are labeled illustrations, not embedded software. Kanade’s clock/track are fixed fixtures, Kinetix’s targets are fictional, and Merro runs no agents or Git operations. Kinetix’s documented reboot is presented as planned. The workbench process is editorial, not claimed organization infrastructure.

Keyboard, touch and reduced-motion controls are supported. With JavaScript disabled, descriptions, all repository entries and navigation remain available; demo controls and filtering require JavaScript. Fonts are self-hosted. Browser checks cover Chromium, not Firefox/WebKit or a manual screen-reader audit.
