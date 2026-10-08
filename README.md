# 0x1d1e / The idle workbench

A standalone, statically generated landing page for [0x1d1e](https://github.com/0x1d1e). A shared workbench introduces three independent experiments: Kanade’s anchored island, Kinetix’s routing decisions and Merro’s approval/review lifecycle.

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

## Motion film

The optional film is **Idle, interrupted.** Native playback, sound captions, a written description and an MP4 download work without JavaScript. No autoplay or loop; the workbench remains separate.

The exported MP4 and poster live in `static/film/`. To regenerate them, install ffmpeg and Chromium, then run:

```sh
pnpm render:film
```

`PLAYWRIGHT_CHROMIUM_EXECUTABLE` also applies here. Frame-addressable artwork lives in `motion/showreel.mjs`; `motion/soundtrack.mjs` synthesizes the original score without external samples. Export is deliberately separate from the site build so deployment does not require ffmpeg or a browser. After editing the artwork or score, rerender and check the captions and written description in `src/lib/components/Showreel.svelte` against the film. These are three illustrative acts, not connected products or recordings of working software.

## Content and limits

Project metadata and pinned public evidence live in `src/lib/content.ts`; invalid entries fail during prerendering. Before changing a claim or demonstration, read its linked upstream source. Update the source revision when behavior changes. Do not infer stability or maintenance from public availability.

All demonstrations are labeled illustrations, not embedded software. Kanade’s clock/track are fixed fixtures, Kinetix’s targets are fictional, and Merro runs no agents or Git operations. Kinetix’s documented reboot is presented as planned. The shared workbench is a presentation device, not an integrated platform.

Keyboard, touch and reduced-motion controls are supported. Switching studies preserves their state; study links can be bookmarked. With JavaScript disabled, all three static studies, descriptions, repository entries and navigation remain available; nonfunctional controls are hidden. Fonts are self-hosted. Browser checks cover Chromium, not Firefox/WebKit or a manual screen-reader audit.
