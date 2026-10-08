import { chromium } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { once } from 'node:events';
import { mkdtemp, readFile, writeFile, mkdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { film } from '../motion/showreel.mjs';
import { soundtrack } from '../motion/soundtrack.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'static/film');
// Keep the staging file on the output filesystem so publication is an atomic rename.
await mkdir(output, { recursive: true });
const scratch = await mkdtemp(join(output, '.render-'));
let browser;
let encoder;
try {
	if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status !== 0) {
		throw new Error('ffmpeg is required on PATH to render the film.');
	}
	const fonts = [
		['Display', '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2'],
		['Mono', '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2']
	];
	const fontFaces = await Promise.all(
		fonts.map(async ([name, path]) => {
			const data = await readFile(join(root, 'node_modules', path));
			return `@font-face{font-family:${name};font-weight:300 700;src:url(data:font/woff2;base64,${data.toString('base64')})}`;
		})
	);
	browser = await chromium.launch({
		executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined
	});
	const page = await browser.newPage({
		viewport: { width: film.width, height: film.height },
		deviceScaleFactor: 1
	});
	await page.setContent(
		`<style>${fontFaces.join('')}body{margin:0;background:#101213}</style><canvas width="${film.width}" height="${film.height}"></canvas>`
	);
	const source = await readFile(join(root, 'motion/showreel.mjs'), 'utf8');
	await page.addScriptTag({
		type: 'module',
		content: `${source}\nwindow.renderFilm = t => renderFrame(document.querySelector('canvas').getContext('2d'), t);`
	});
	await page.waitForFunction(() => typeof window.renderFilm === 'function');
	await page.evaluate(async () => {
		await Promise.all([
			document.fonts.load('500 120px Display'),
			document.fonts.load('400 30px Mono')
		]);
		if (!document.fonts.check('500 120px Display') || !document.fonts.check('400 30px Mono'))
			throw new Error('Film fonts failed to load');
	});
	await writeFile(join(scratch, 'score.wav'), soundtrack(film.duration));
	encoder = spawn(
		'ffmpeg',
		[
			'-hide_banner',
			'-loglevel',
			'error',
			'-y',
			'-f',
			'image2pipe',
			'-framerate',
			String(film.fps),
			'-vcodec',
			'png',
			'-i',
			'pipe:0',
			'-i',
			join(scratch, 'score.wav'),
			'-t',
			String(film.duration),
			'-c:v',
			'libx264',
			'-preset',
			'slow',
			'-crf',
			'18',
			'-threads',
			'4',
			'-pix_fmt',
			'yuv420p',
			'-c:a',
			'aac',
			'-b:a',
			'192k',
			'-ar',
			'48000',
			'-af',
			'loudnorm=I=-16:TP=-1.5:LRA=9',
			'-movflags',
			'+faststart',
			'-metadata',
			'title=Idle, interrupted.',
			join(scratch, 'idle-interrupted.mp4')
		],
		{ stdio: ['pipe', 'ignore', 'pipe'] }
	);
	let stderr = '';
	encoder.stderr.on('data', (chunk) => {
		stderr = (stderr + chunk).slice(-8000);
	});
	const finished = new Promise((resolve, reject) => {
		encoder.once('error', reject);
		encoder.once('close', (code) =>
			code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${stderr}`))
		);
	});
	// Observe early encoder failures even while Chromium is drawing a frame.
	finished.catch(() => {});
	const frame = async (t) =>
		Buffer.from(
			await page.evaluate((time) => {
				window.renderFilm(time);
				return document.querySelector('canvas').toDataURL('image/png').split(',')[1];
			}, t),
			'base64'
		);
	for (let i = 0; i < film.fps * film.duration; i++) {
		if (!encoder.stdin.write(await frame(i / film.fps))) await once(encoder.stdin, 'drain');
		if (i % film.fps === 0) console.log(`Rendering ${i / film.fps}/${film.duration}s`);
	}
	encoder.stdin.end();
	await finished;
	await writeFile(join(scratch, 'idle-interrupted-poster.png'), await frame(14.5));
	await rename(
		join(scratch, 'idle-interrupted-poster.png'),
		join(output, 'idle-interrupted-poster.png')
	);
	await rename(join(scratch, 'idle-interrupted.mp4'), join(output, 'idle-interrupted.mp4'));
	console.log('Exported static/film/idle-interrupted.mp4 and poster (1080p / 60fps / stereo).');
} finally {
	if (encoder && encoder.exitCode === null) encoder.kill('SIGTERM');
	await browser?.close();
	await rm(scratch, { recursive: true, force: true });
}
