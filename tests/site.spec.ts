import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const chooseStudy = async (page: Page, name: string) => {
	const selector = page.getByRole('group', { name: 'Choose an experiment' }).getByRole('button', {
		name: new RegExp(name)
	});
	await selector.click();
	await expect(selector).toHaveAttribute('aria-pressed', 'true');
};

test('five sections, navigation and real discovery destinations', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/');
	await expect(page).toHaveTitle(/0x1d1e/);
	await expect(page.locator('main > section')).toHaveCount(5);
	for (const slug of ['kanade', 'kinetix', 'merro']) {
		await expect(page.locator(`#${slug}-title a`)).toHaveAttribute(
			'href',
			`https://github.com/0x1d1e/${slug}`
		);
	}
	await page.getByRole('link', { name: 'Browse projects', exact: true }).click();
	await expect(page).toHaveURL(/#experiments$/);
	await page.getByRole('link', { name: 'Explore Kinetix study' }).click();
	await expect(page).toHaveURL(/#study-kinetix$/);
	await expect(page.locator('#study-kinetix')).toBeFocused();
	await expect(page.locator('.kinetix-demo')).toBeVisible();
	for (const link of await page.locator('a[href^="#"]').all()) {
		const href = await link.getAttribute('href');
		if (!href) throw new Error('Missing anchor destination');
		expect(await page.locator(href).count()).toBe(1);
	}
	expect(errors).toEqual([]);
});

test('Kanade transforms in place and mock playback responds', async ({ page }) => {
	await page.goto('/');
	const demo = page.locator('.kanade-demo');
	const island = demo.locator('.island');
	const center = async () => {
		const box = await island.boundingBox();
		if (!box) throw new Error('Island is not visible');
		return box.x + box.width / 2;
	};
	const start = await center();
	for (const state of ['Compact', 'Peek', 'Expanded']) {
		await demo.getByRole('button', { name: state, exact: true }).click();
		await expect(demo.getByRole('button', { name: state, exact: true })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await expect.poll(center).toBeCloseTo(start, 0);
	}
	await demo.getByRole('button', { name: 'Pause illustrative track' }).click();
	await expect(demo.getByRole('button', { name: 'Play illustrative track' })).toBeVisible();
	await demo.getByRole('button', { name: /Reset/ }).click();
	await expect(demo.getByRole('status')).toHaveText('At rest, the island shows the clock.');
});

test('Kinetix selects, falls back and respects response commitment', async ({ page }) => {
	await page.goto('/');
	await chooseStudy(page, 'Kinetix');
	const demo = page.locator('.kinetix-demo');
	await demo.getByRole('button', { name: 'Route request' }).click();
	await expect(demo.locator('.target-a')).toHaveClass(/chosen/);
	await demo.getByRole('button', { name: 'Primary unavailable' }).click();
	await expect(demo.locator('.chosen')).toHaveCount(0);
	await demo.getByRole('button', { name: 'Route request' }).click();
	await expect(demo.locator('.target-b')).toHaveClass(/chosen/);
	await expect(demo.getByRole('status')).toContainText('before committing');
	await demo.getByRole('button', { name: 'Response committed' }).click();
	await demo.getByRole('button', { name: 'Show late failure' }).click();
	await expect(demo.locator('.target-a')).toHaveClass(/chosen/);
	await expect(demo.locator('.target-b')).not.toHaveClass(/chosen/);
	await expect(demo.getByRole('status')).toContainText('cannot switch');
	await demo.getByRole('button', { name: /Reset/ }).click();
	await expect(demo.locator('.chosen')).toHaveCount(0);
});

test('Merro approval gates, rejection, fresh review and local delivery', async ({ page }) => {
	await page.goto('/');
	await chooseStudy(page, 'Merro');
	const demo = page.locator('.merro-demo');
	await demo.getByRole('button', { name: 'Read the plan' }).click();
	await expect(demo.getByRole('status')).toContainText('Nothing starts until');
	await demo.getByRole('button', { name: 'Approve plan' }).click();
	await demo.getByRole('button', { name: 'Finish implementation' }).click();
	await demo.getByRole('button', { name: 'Request changes' }).click();
	await expect(demo.getByRole('status')).toContainText('fresh attempt 2');
	await demo.getByRole('button', { name: 'Finish implementation' }).click();
	await demo.getByRole('button', { name: 'Accept review' }).click();
	await expect(demo.getByRole('status')).toContainText('Approve before');
	await demo.getByRole('button', { name: 'Approve local delivery' }).click();
	await expect(demo.getByRole('button', { name: 'Delivered' })).toBeDisabled();
	await demo.getByRole('button', { name: /Reset/ }).click();
	await expect(demo.getByRole('button', { name: 'Read the plan' })).toBeEnabled();
});

test('index filters have a discovery purpose', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Coding agents', exact: true }).click();
	await expect(page.locator('.catalogue li')).toHaveCount(1);
	await expect(page.locator('.catalogue li')).toContainText('Merro');
	await page.getByRole('button', { name: 'Interfaces', exact: true }).click();
	await expect(page.locator('.catalogue li')).toHaveCount(4);
	await page.getByRole('button', { name: 'All', exact: true }).click();
	await expect(page.locator('.catalogue li')).toHaveCount(7);
});

test('keyboard controls, selector isolation and visible focus', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');
	await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.locator('main')).toBeFocused();
	const selectors = page.getByRole('group', { name: 'Choose an experiment' });
	const kinetix = selectors.getByRole('button', { name: /Kinetix/ });
	await kinetix.focus();
	await page.keyboard.press('Space');
	await expect(kinetix).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('#study-kanade')).toHaveAttribute('inert', '');
	await expect(page.locator('#study-kanade')).toHaveAttribute('aria-hidden', 'true');
	await expect(page.locator('.kanade-demo').getByRole('button', { name: 'Expanded' })).toHaveCount(
		0
	);
	await selectors.getByRole('button', { name: /Kanade/ }).focus();
	await page.keyboard.press('Enter');
	const expanded = page
		.locator('.kanade-demo')
		.getByRole('button', { name: 'Expanded', exact: true });
	await expanded.focus();
	await page.keyboard.press('Space');
	await expect(expanded).toHaveAttribute('aria-pressed', 'true');
	expect(await expanded.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
	await page.keyboard.press('Tab');
	await expect(page.locator('.kanade-demo').getByRole('button', { name: /Reset/ })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(
		page.locator('.kanade-demo').getByRole('button', { name: 'Rest', exact: true })
	).toHaveAttribute('aria-pressed', 'true');
});

test('the first-screen workbench preserves state and desktop height', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/');
	await page.evaluate(() => document.fonts.ready);
	await expect(page.locator('.kanade-demo')).toBeInViewport();
	await expect(
		page.locator('.kanade-demo').getByRole('button', { name: 'Expanded', exact: true })
	).toBeInViewport();
	const stage = await page.locator('.workbench-panels').boundingBox();
	if (!stage) throw new Error('Workbench stage is not visible');
	const { height } = stage;
	await page.locator('.kanade-demo').getByRole('button', { name: 'Expanded', exact: true }).click();
	await page
		.locator('.kanade-demo')
		.getByRole('button', { name: 'Pause illustrative track' })
		.click();
	await chooseStudy(page, 'Kinetix');
	await page.locator('.kinetix-demo').getByRole('button', { name: 'Primary unavailable' }).click();
	await page.locator('.kinetix-demo').getByRole('button', { name: 'Route request' }).click();
	await chooseStudy(page, 'Merro');
	await page.locator('.merro-demo').getByRole('button', { name: 'Read the plan' }).click();
	expect((await page.locator('.workbench-panels').boundingBox())?.height).toBeCloseTo(height, 0);
	await chooseStudy(page, 'Kanade');
	await expect(
		page.locator('.kanade-demo').getByRole('button', { name: 'Play illustrative track' })
	).toBeVisible();
	await chooseStudy(page, 'Kinetix');
	await expect(page.locator('.target-b')).toHaveClass(/chosen/);
	await chooseStudy(page, 'Merro');
	await expect(
		page.locator('.merro-demo').getByRole('button', { name: 'Approve plan' })
	).toBeVisible();
});

test('study bookmarks and browser history restore the selected experiment', async ({ page }) => {
	await page.goto('/#study-kinetix');
	await expect(page.locator('.kinetix-demo')).toBeVisible();
	await expect(
		page
			.getByRole('group', { name: 'Choose an experiment' })
			.getByRole('button', { name: /Kinetix/ })
	).toHaveAttribute('aria-pressed', 'true');
	await page.getByRole('link', { name: 'Explore Kanade study' }).click();
	await expect(page.locator('#study-kanade')).toBeFocused();
	await page.getByRole('link', { name: 'Explore Merro study' }).click();
	await expect(page.locator('#study-merro')).toBeFocused();
	await page.goBack();
	await expect(page).toHaveURL(/#study-kanade$/);
	await expect(page.locator('.kanade-demo')).toBeVisible();
	await expect(page.locator('#study-kanade')).toBeFocused();
	await page.reload();
	await expect(page.locator('.kanade-demo')).toBeVisible();
	await expect(page.locator('#study-kanade')).toBeFocused();
	await page.goForward();
	await expect(page.locator('.merro-demo')).toBeVisible();
	await expect(page.locator('#study-merro')).toBeFocused();
});

test('study links preserve opening a bookmark in a new tab', async ({ page, context }) => {
	await page.goto('/');
	const opened = context.waitForEvent('page', { timeout: 3000 });
	await page.getByRole('link', { name: 'Explore Kinetix study' }).click({ modifiers: ['Control'] });
	const bookmark = await opened;
	await expect(bookmark).toHaveURL(/#study-kinetix$/);
	await expect(bookmark.locator('.kinetix-demo')).toBeVisible();
	await expect(page).toHaveURL(/\/$/);
	await bookmark.close();
});

test('reduced motion preserves every interaction', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	await page.locator('.kanade-demo').getByRole('button', { name: 'Expanded', exact: true }).click();
	expect(
		await page.locator('.island').evaluate((el) => getComputedStyle(el).transitionDuration)
	).toBe('0s');
	await chooseStudy(page, 'Kinetix');
	await page.locator('.kinetix-demo').getByRole('button', { name: 'Primary unavailable' }).click();
	await page.locator('.kinetix-demo').getByRole('button', { name: 'Route request' }).click();
	await expect(page.locator('.target-b')).toHaveClass(/chosen/);
	await chooseStudy(page, 'Merro');
	await page.locator('.merro-demo').getByRole('button', { name: 'Read the plan' }).click();
	await expect(
		page.locator('.merro-demo').getByRole('button', { name: 'Approve plan' })
	).toBeEnabled();
	expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
		'auto'
	);
});

test('film is opt-in, captioned and plays once through native controls', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	const requests: string[] = [];
	page.on('request', (request) => {
		if (request.url().endsWith('/film/idle-interrupted.mp4')) requests.push(request.url());
	});
	await page.goto('/');
	await page.getByRole('link', { name: 'Watch the 15-second film' }).click();
	const video = page.locator('#showreel video');
	await expect(video).toHaveAttribute('controls', '');
	await expect(video).toHaveAttribute('preload', 'none');
	for (const attribute of ['autoplay', 'loop', 'muted'])
		expect(await video.getAttribute(attribute)).toBeNull();
	expect(await video.evaluate((el: globalThis.HTMLVideoElement) => el.paused)).toBe(true);
	expect(requests).toEqual([]);
	await video.focus();
	await page.keyboard.press('Space');
	await expect
		.poll(() => video.evaluate((el: globalThis.HTMLVideoElement) => el.currentTime))
		.toBeGreaterThan(0);
	expect(await video.evaluate((el: globalThis.HTMLVideoElement) => el.duration)).toBeCloseTo(15, 1);
	const track = video.locator('track');
	await track.evaluate((el: globalThis.HTMLTrackElement) => {
		el.track.mode = 'showing';
	});
	await expect
		.poll(() => track.evaluate((el: globalThis.HTMLTrackElement) => el.readyState))
		.toBe(2);
	expect(await track.evaluate((el: globalThis.HTMLTrackElement) => el.track.mode)).toBe('showing');
	const cues = await track.evaluate((el: globalThis.HTMLTrackElement) =>
		Array.from(el.track.cues ?? []).map((cue) => ({
			start: cue.startTime,
			end: cue.endTime,
			text: (cue as globalThis.VTTCue).text
		}))
	);
	expect(cues.length).toBeGreaterThan(0);
	// Film caption budget: at most 20 characters per second.
	for (const cue of cues)
		expect(
			cue.text.replace(/\s+/g, ' ').length / (cue.end - cue.start),
			`Cue at ${cue.start}s`
		).toBeLessThanOrEqual(20);
	await video.evaluate((el: globalThis.HTMLVideoElement) => {
		el.pause();
		el.currentTime = 12.5;
	});
	await expect
		.poll(() =>
			track.evaluate(
				(el: globalThis.HTMLTrackElement) =>
					(el.track.activeCues?.[0] as globalThis.VTTCue | undefined)?.text
			)
		)
		.toContain('Merro');
	await video.evaluate(async (el: globalThis.HTMLVideoElement) => {
		el.currentTime = 14.8;
		await el.play();
	});
	await expect.poll(() => video.evaluate((el: globalThis.HTMLVideoElement) => el.ended)).toBe(true);
	expect(await video.evaluate((el: globalThis.HTMLVideoElement) => el.paused)).toBe(true);
	const download = page.getByRole('link', { name: /Download MP4/ });
	await expect(download).toHaveAttribute('download', '');
	await expect(download).toHaveAttribute('href', '/film/idle-interrupted.mp4');
});

test('touch demos and compact navigation', async ({ browser }) => {
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		isMobile: true,
		hasTouch: true
	});
	const page = await context.newPage();
	await page.goto('http://127.0.0.1:4173');
	await page
		.getByRole('navigation', { name: 'Main navigation' })
		.getByRole('link', { name: 'Projects' })
		.tap();
	await expect(page).toHaveURL(/#experiments$/);
	await page.getByRole('link', { name: 'Explore Kanade study' }).tap();
	await page.locator('.kanade-demo').getByRole('button', { name: 'Peek', exact: true }).tap();
	await expect(page.locator('.island')).toHaveClass(/peek/);
	await chooseStudy(page, 'Kinetix');
	await page.locator('.kinetix-demo').getByRole('button', { name: 'Route request' }).tap();
	await expect(page.locator('.target-a')).toHaveClass(/chosen/);
	await chooseStudy(page, 'Merro');
	await page.locator('.merro-demo').getByRole('button', { name: 'Read the plan' }).tap();
	await expect(
		page.locator('.merro-demo').getByRole('button', { name: 'Approve plan' })
	).toBeVisible();
	await context.close();
});

test('static studies and links remain useful without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 390, height: 844 }
	});
	const page = await context.newPage();
	await page.goto('http://127.0.0.1:4173');
	await expect(page.locator('main > section')).toHaveCount(5);
	for (const slug of ['kanade', 'kinetix', 'merro'])
		await expect(page.locator(`#study-${slug}`)).toBeVisible();
	await expect(page.locator('.catalogue li')).toHaveCount(7);
	await expect(page.getByRole('button')).toHaveCount(0);
	await expect(page.locator('.static-note')).toBeVisible();
	await expect(page.locator('.static-note')).toContainText(
		'All three static studies are shown below.'
	);
	await page.getByRole('link', { name: 'Browse projects', exact: true }).click();
	await expect(page).toHaveURL(/#experiments$/);
	await page.getByRole('link', { name: 'Explore Merro study' }).click();
	await expect(page).toHaveURL(/#study-merro$/);
	await page.getByRole('link', { name: 'Watch the 15-second film' }).click();
	await expect(page.locator('#showreel video')).toHaveAttribute('controls', '');
	await page.getByText('Read film description', { exact: true }).click();
	await expect(page.locator('.film-description')).toHaveAttribute('open', '');
	await expect(page.locator('.film-description')).toContainText(
		'Separate approval permits local delivery'
	);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
	await context.close();
});

for (const width of [1440, 1024, 768, 390, 360, 320]) {
	test(`visual and accessibility inspection at ${width}px`, async ({ page }, testInfo) => {
		await page.setViewportSize({ width, height: width > 760 ? 900 : 844 });
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);
		const checkAccessibility = async () => {
			const result = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
				.analyze();
			expect(result.violations).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
				width
			);
		};
		await checkAccessibility();
		await page.screenshot({
			path: testInfo.outputPath(`idle-workbench-${width}.png`),
			fullPage: true
		});
		await page
			.locator('.kanade-demo')
			.getByRole('button', { name: 'Expanded', exact: true })
			.click();
		await checkAccessibility();
		await chooseStudy(page, 'Kinetix');
		await page
			.locator('.kinetix-demo')
			.getByRole('button', { name: 'Primary unavailable' })
			.click();
		await page.locator('.kinetix-demo').getByRole('button', { name: 'Route request' }).click();
		for (const label of await page.locator('.route-node strong').all()) {
			expect(await label.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
		}
		await checkAccessibility();
		await chooseStudy(page, 'Merro');
		await page.locator('.merro-demo').getByRole('button', { name: 'Read the plan' }).click();
		await checkAccessibility();
	});
}
