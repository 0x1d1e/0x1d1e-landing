import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('six sections, navigation and real discovery destinations', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/');
	await expect(page).toHaveTitle(/0x1d1e/);
	await expect(page.locator('main > section')).toHaveCount(6);
	for (const slug of ['kanade', 'kinetix', 'merro']) {
		await expect(page.locator(`#${slug}-title a`)).toHaveAttribute(
			'href',
			`https://github.com/0x1d1e/${slug}`
		);
	}
	await page.getByRole('link', { name: 'Explore the experiments' }).click();
	await expect(page).toHaveURL(/#experiments$/);
	await page
		.locator('.area-list')
		.getByRole('link', { name: /AI infrastructure.*Kinetix/ })
		.click();
	await expect(page).toHaveURL(/#kinetix$/);
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

test('keyboard controls and visible focus', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');
	await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
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

test('scroll trace is reversible, not timer-driven', async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => window.scrollTo({ top: 2500, behavior: 'instant' }));
	const progress = async () =>
		Number(
			await page
				.locator('.workbench-rail')
				.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--progress'))
		);
	await expect.poll(progress).toBeGreaterThan(0);
	const lower = await progress();
	await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
	await expect.poll(progress).toBeLessThan(lower);
});

test('reduced motion preserves every interaction', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	await page.locator('.kanade-demo').getByRole('button', { name: 'Expanded', exact: true }).click();
	expect(
		await page.locator('.island').evaluate((el) => getComputedStyle(el).transitionDuration)
	).toBe('0s');
	await page.locator('.kinetix-demo').getByRole('button', { name: 'Primary unavailable' }).click();
	await page.locator('.kinetix-demo').getByRole('button', { name: 'Route request' }).click();
	await expect(page.locator('.target-b')).toHaveClass(/chosen/);
	expect(
		await page
			.locator('.workbench-rail')
			.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--progress'))
	).toBe('0');
	expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
		'auto'
	);
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
		.getByRole('link', { name: 'Experiments' })
		.tap();
	await expect(page).toHaveURL(/#experiments$/);
	await page.locator('.kanade-demo').getByRole('button', { name: 'Peek', exact: true }).tap();
	await expect(page.locator('.island')).toHaveClass(/peek/);
	await page.locator('.kinetix-demo').getByRole('button', { name: 'Route request' }).tap();
	await expect(page.locator('.target-a')).toHaveClass(/chosen/);
	await page.locator('.merro-demo').getByRole('button', { name: 'Read the plan' }).tap();
	await expect(
		page.locator('.merro-demo').getByRole('button', { name: 'Approve plan' })
	).toBeVisible();
	await context.close();
});

test('static content and links remain useful without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('http://127.0.0.1:4173');
	await expect(page.locator('main > section')).toHaveCount(6);
	await expect(page.getByRole('heading', { name: 'Kanade' })).toBeVisible();
	await expect(page.locator('.catalogue li')).toHaveCount(7);
	await page.getByRole('link', { name: 'Explore the experiments' }).click();
	await expect(page).toHaveURL(/#experiments$/);
	await context.close();
});

for (const width of [1440, 1024, 390, 360]) {
	test(`visual and accessibility inspection at ${width}px`, async ({ page }, testInfo) => {
		await page.setViewportSize({ width, height: width > 760 ? 900 : 844 });
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			width
		);
		await page.screenshot({
			path: testInfo.outputPath(`idle-workbench-${width}.png`),
			fullPage: true
		});
		const result = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
			.analyze();
		expect(result.violations).toEqual([]);
		await page
			.locator('.kanade-demo')
			.getByRole('button', { name: 'Expanded', exact: true })
			.click();
		await page
			.locator('.kinetix-demo')
			.getByRole('button', { name: 'Primary unavailable' })
			.click();
		await page.locator('.kinetix-demo').getByRole('button', { name: 'Route request' }).click();
		const active = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
			.analyze();
		expect(active.violations).toEqual([]);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			width
		);
	});
}
