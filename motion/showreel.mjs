// Deterministic, frame-addressable artwork. The film is illustrative, not product footage.
export const film = { width: 1920, height: 1080, fps: 60, duration: 15 };
const ink = '#101213';
const paper = '#e9e9e0';
const lime = '#c5f277';
const rust = '#ee9c78';
const clamp = (p) => Math.max(0, Math.min(1, p));
const at = (t, start, duration) => clamp((t - start) / duration);
const ease = (p) => 1 - (1 - clamp(p)) ** 3;
const spring = (p) => (p >= 1 ? 1 : 1 - Math.exp(-7 * p) * Math.cos(12 * p));
const mix = (a, b, p) => a + (b - a) * p;

function text(c, value, x, y, size, options = {}) {
	const { color = paper, mono = false, align = 'left', alpha = 1, outline = false } = options;
	c.save();
	c.globalAlpha *= clamp(alpha);
	c.font = `${mono ? 400 : 500} ${size}px ${mono ? 'Mono' : 'Display'}`;
	c.letterSpacing = `${mono ? size * 0.04 : -size * 0.045}px`;
	c.textAlign = align;
	c.fillStyle = c.strokeStyle = color;
	c.lineWidth = 1.5;
	if (outline) c.strokeText(value, x, y);
	else c.fillText(value, x, y);
	c.restore();
}

function word(c, value, x, y, size, progress, color = paper) {
	c.save();
	c.font = `500 ${size}px Display`;
	c.letterSpacing = '0px';
	c.beginPath();
	c.rect(x - 30, y - size, 1900, size * 1.2);
	c.clip();
	for (let i = 0; i < value.length; i++) {
		const p = ease(clamp((progress - i * 0.035) / 0.65));
		c.save();
		c.translate(x, y + (1 - p) * size * 1.2);
		c.rotate((1 - p) * 0.12);
		text(c, value[i], 0, 0, size, { color, alpha: p });
		c.restore();
		x += c.measureText(value[i]).width - size * 0.045;
	}
	c.restore();
}

function box(c, x, y, w, h, radius, fill, stroke) {
	c.beginPath();
	c.roundRect(x, y, w, h, radius);
	if (fill) {
		c.fillStyle = fill;
		c.fill();
	}
	if (stroke) {
		c.strokeStyle = stroke;
		c.lineWidth = 2;
		c.stroke();
	}
}

function line(c, points, color, width = 2, progress = 1) {
	const lengths = points
		.slice(1)
		.map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
	let remaining = lengths.reduce((a, b) => a + b, 0) * clamp(progress);
	c.beginPath();
	c.moveTo(...points[0]);
	for (let i = 0; i < lengths.length; i++) {
		const p = Math.min(1, remaining / lengths[i]);
		c.lineTo(mix(points[i][0], points[i + 1][0], p), mix(points[i][1], points[i + 1][1], p));
		remaining -= lengths[i];
		if (remaining <= 0) break;
	}
	c.lineJoin = 'round';
	c.lineCap = 'round';
	c.strokeStyle = color;
	c.lineWidth = width;
	c.stroke();
}

function circle(c, x, y, radius, color, fill = false) {
	c.beginPath();
	c.arc(x, y, radius, 0, Math.PI * 2);
	c.fillStyle = c.strokeStyle = color;
	c.lineWidth = 2;
	if (fill) c.fill();
	else c.stroke();
}

function registration(c, name, number, light = false) {
	const color = light ? ink : paper;
	text(c, name, 100, 90, 25, { mono: true, color });
	text(c, `${number} / 03`, 1820, 90, 25, { mono: true, color, align: 'right' });
	line(
		c,
		[
			[100, 116],
			[1820, 116]
		],
		light ? '#bfc0b6' : '#35383a'
	);
}

function intro(c, t) {
	const departure = ease(at(t, 1.35, 0.65));
	const radius = mix(80, 620, departure);
	circle(c, 960, 540, radius, '#393d3c');
	for (let i = 0; i < 60; i++) {
		const angle = (i * Math.PI) / 30;
		const r = radius + 20;
		const length = i % 5 === 0 ? 18 : 6;
		line(
			c,
			[
				[960 + Math.sin(angle) * r, 540 - Math.cos(angle) * r],
				[960 + Math.sin(angle) * (r + length), 540 - Math.cos(angle) * (r + length)]
			],
			i === Math.floor(t * 30) ? lime : '#434846',
			2
		);
	}
	text(c, '23:48', 960, 553, 36, { mono: true, align: 'center', alpha: 1 - departure });
	text(c, '0x1d1e / a motion study', 100, 90, 23, { mono: true, alpha: 0.7 });
	text(c, 'IDLE', 960, 975, 275, { align: 'center', outline: true, alpha: 0.14 * (1 - departure) });
	word(c, 'interrupted.', 295, 650, 200, at(t, 1.32, 0.6), lime);
	text(c, 'THREE INDEPENDENT EXPERIMENTS', 100, 1020, 20, { mono: true, alpha: 0.6 });
	// One continuous wipe, not a strobe. It becomes the light Kanade field.
	c.fillStyle = paper;
	c.fillRect(0, 1080 * (1 - ease(at(t, 1.79, 0.21))), 1920, 1080);
}

function kanade(c, t) {
	c.fillStyle = paper;
	c.fillRect(0, 0, 1920, 1080);
	registration(c, 'KANADE / NIRI', '01', true);
	const compact = spring(at(t, 2.72, 0.6));
	const peek = spring(at(t, 3.45, 0.55));
	const expanded = spring(at(t, 4.18, 0.7));
	const collapse = ease(at(t, 5.48, 0.52));
	const width = mix(230 + 250 * compact + 170 * peek + 350 * expanded, 1720, collapse);
	const height = mix(82 + 20 * compact + 116 * peek + 226 * expanded, 10, collapse);
	const x = 960 - width / 2;
	const y = mix(290, 520, collapse);
	const fade = 1 - collapse;
	text(c, 'Kanade', 960, 800 + 350 * ease(at(t, 2.75, 0.55)), 245, {
		align: 'center',
		color: ink,
		alpha: 1 - at(t, 3.0, 0.2)
	});
	word(
		c,
		expanded > 0.2 ? 'many forms.' : 'one anchor.',
		100,
		915,
		180,
		at(t, expanded > 0.2 ? 4.22 : 2.95, 0.5),
		ink
	);
	text(c, 'TOP-CENTER / REST → ACTIVITY → SURFACE', 100, 1010, 23, {
		mono: true,
		color: ink,
		alpha: fade
	});
	// The center and top edge stay fixed through all three island shapes.
	line(
		c,
		[
			[960, 140],
			[960, 264]
		],
		'#a4a99b',
		2,
		fade
	);
	circle(c, 960, 264, 5, ink, true);
	c.save();
	c.shadowColor = '#10121335';
	c.shadowBlur = 65;
	c.shadowOffsetY = 34;
	box(c, x, y, width, height, Math.min(44, height / 2), ink);
	c.restore();
	c.save();
	c.beginPath();
	c.roundRect(x, y, width, height, Math.min(44, height / 2));
	c.clip();
	text(c, '23:48', mix(960, x + 120, clamp(compact)), y + 55, 30, {
		mono: true,
		align: 'center',
		alpha: fade
	});
	const content = clamp(compact) * fade;
	text(c, 'Idle study', x + 245, y + 55, 32, { alpha: content });
	for (let i = 0; i < 5; i++) {
		const h = (16 + Math.sin(t * 9 + i * 1.4) * 10) * fade;
		box(c, x + 202 + i * 7, y + 41 - h / 2, 3, h, 2, lime);
	}
	text(c, 'An activity. Not a permanent bar.', x + 42, y + 145, 27, {
		alpha: clamp(peek) * (1 - clamp(expanded)) * fade
	});
	const alpha = clamp(expanded) * fade;
	c.globalAlpha *= alpha;
	const recordX = x + 154,
		recordY = y + 258;
	c.save();
	c.translate(recordX, recordY);
	c.rotate(t * 0.7);
	const gradient = c.createLinearGradient(-105, -105, 105, 105);
	gradient.addColorStop(0, '#d4f393');
	gradient.addColorStop(0.48, '#709456');
	gradient.addColorStop(1, '#c5f277');
	circle(c, 0, 0, 104, gradient, true);
	for (let r = 36; r < 98; r += 9) circle(c, 0, 0, r, '#10121330');
	circle(c, 0, 0, 25, ink, true);
	circle(c, 0, 0, 5, paper, true);
	line(
		c,
		[
			[-74, -74],
			[74, 74]
		],
		'#e7ffbb',
		2
	);
	c.restore();
	text(c, 'A little room', x + 305, y + 218, 56);
	text(c, 'for what is happening.', x + 305, y + 273, 34, { color: '#b9beb3' });
	line(
		c,
		[
			[x + 305, y + 319],
			[x + width - 58, y + 319]
		],
		'#494f45',
		3
	);
	line(
		c,
		[
			[x + 305, y + 319],
			[x + 405 + (t - 4.2) * 65, y + 319]
		],
		lime,
		3
	);
	text(c, 'ILLUSTRATIVE MEDIA SURFACE', x + 305, y + 366, 19, { mono: true, color: '#b9beb3' });
	c.restore();
	if (collapse > 0) {
		c.fillStyle = ink;
		c.fillRect(0, 1080 * (1 - ease(at(t, 5.84, 0.16))), 1920, 1080);
	}
}

function node(c, x, y, w, title, subtitle, active, color = lime) {
	c.save();
	if (active) {
		c.shadowColor = `${color}22`;
		c.shadowBlur = 45;
	}
	box(c, x, y, w, 160, 12, active ? '#20291b' : '#181c1c', active ? color : '#4a514d');
	c.restore();
	text(c, title, x + 28, y + 65, 44, { color: active ? color : paper });
	text(c, subtitle, x + 28, y + 117, 20, { mono: true, color: active ? color : '#9aa29b' });
}

function kinetix(c, t) {
	registration(c, 'KINETIX / ROUTING STUDY', '02');
	const reveal = ease(at(t, 6.05, 0.7));
	const rejected = at(t, 7.5, 0.16);
	const fallback = ease(at(t, 7.92, 0.68));
	c.save();
	c.globalAlpha = 0.4;
	for (let x = 100; x <= 1820; x += 80)
		line(
			c,
			[
				[x, 150],
				[x, 815]
			],
			'#252c28',
			1
		);
	for (let y = 175; y <= 815; y += 80)
		line(
			c,
			[
				[100, y],
				[1820, y]
			],
			'#252c28',
			1
		);
	c.restore();
	text(c, 'Kinetix', mix(340, 100, reveal), mix(720, 255, reveal), mix(320, 105, reveal), {
		alpha: at(t, 6, 0.2)
	});
	c.save();
	c.globalAlpha *= reveal;
	c.translate(960, 490);
	c.scale(mix(1.15, 1, reveal), mix(1.15, 1, reveal));
	c.rotate((1 - reveal) * -0.045);
	c.translate(-960, -490);
	const incoming = [
		[380, 465],
		[690, 465]
	];
	const primary = [
		[1010, 465],
		[1210, 465],
		[1210, 355],
		[1450, 355]
	];
	const secondary = [
		[1010, 465],
		[1150, 465],
		[1150, 645],
		[1450, 645]
	];
	line(c, incoming, '#4a514d', 3);
	line(c, primary, '#4a514d', 3);
	line(c, secondary, '#4a514d', 3);
	line(c, incoming, lime, 5, ease(at(t, 6.85, 0.42)));
	line(c, primary, rejected ? rust : lime, 5, ease(at(t, 7.24, 0.25)));
	line(c, secondary, lime, 5, fallback);
	text(c, '01', 1290, 330, 24, { mono: true, color: rejected ? rust : '#9aa29b' });
	text(c, '02', 1250, 620, 24, { mono: true, color: fallback ? lime : '#9aa29b' });
	node(c, 100, 385, 280, 'Client', 'ONE REQUEST', t >= 6.85);
	node(c, 690, 385, 320, 'Route', 'PRIORITY + FALLBACK', t >= 7.25);
	node(
		c,
		1450,
		275,
		370,
		'Target A',
		rejected ? 'UNAVAILABLE' : 'FIRST CHOICE',
		rejected > 0,
		rust
	);
	node(c, 1450, 565, 370, 'Target B', fallback > 0.99 ? 'SELECTED' : 'ELIGIBLE', fallback > 0.99);
	if (rejected) {
		c.save();
		c.globalAlpha *= rejected;
		line(
			c,
			[
				[1371, 340],
				[1399, 370]
			],
			rust,
			4
		);
		line(
			c,
			[
				[1399, 340],
				[1371, 370]
			],
			rust,
			4
		);
		c.restore();
	}
	text(c, 'BEFORE RESPONSE COMMIT', 1010, 780, 23, {
		mono: true,
		color: lime,
		alpha: fallback,
		align: 'center'
	});
	c.restore();
	word(
		c,
		t < 8.15 ? 'choose a way.' : 'find another.',
		100,
		947,
		163,
		at(t, t < 8.15 ? 6.45 : 8.15, 0.55)
	);
	text(c, 'CONCEPTUAL ROUTE / FICTIONAL TARGETS', 100, 1020, 20, { mono: true, color: '#9aa29b' });
	for (let i = 0; i < 3; i++) {
		const exit = ease(at(t, 9.7 + i * 0.045, 0.21));
		c.fillStyle = paper;
		c.fillRect(i * 640, 1080 * (1 - exit), 642, 1080);
	}
}

function stamp(c, label, x, y, progress) {
	if (progress <= 0) return;
	c.save();
	c.translate(x, y);
	c.rotate(-0.07);
	const scale = mix(1.5, 1, spring(progress));
	c.scale(scale, scale);
	c.globalAlpha *= clamp(progress * 5);
	box(c, -165, -35, 330, 70, 3, '#c5f277', ink);
	text(c, label, 0, 9, 22, { mono: true, color: ink, align: 'center' });
	c.restore();
}

function merro(c, t) {
	c.fillStyle = paper;
	c.fillRect(0, 0, 1920, 1080);
	registration(c, 'MERRO / LOCAL CHANGE', '03', true);
	word(c, 'Merro', 100, 274, 155, at(t, 10, 0.4), ink);
	const stages = [
		{
			title: 'Plan',
			micro: '01 / USER APPROVAL',
			start: 10.02,
			done: 10.62,
			label: 'PLAN APPROVED'
		},
		{
			title: 'Build',
			micro: '02 / IMPLEMENT + VERIFY',
			start: 10.73,
			done: 11.34,
			label: 'CHECKS PASSED'
		},
		{
			title: 'Review',
			micro: '03 / INDEPENDENT REVIEW',
			start: 11.43,
			done: 12.06,
			label: 'REVIEW ACCEPTED'
		}
	];
	stages.forEach((stage, i) => {
		const enter = spring(at(t, stage.start, 0.52));
		c.save();
		c.translate(112 + i * 576, 340 + (1 - enter) * 350);
		c.rotate((1 - enter) * (i % 2 ? -0.12 : 0.1));
		c.globalAlpha *= clamp(enter);
		c.shadowColor = '#10121325';
		c.shadowBlur = 35;
		c.shadowOffsetY = 22;
		box(c, 0, 0, 542, 410, 5, ink);
		c.shadowBlur = 0;
		c.shadowOffsetY = 0;
		text(c, stage.micro, 30, 50, 19, { mono: true, color: '#b9beb3' });
		text(c, stage.title, 30, 150, 86);
		if (i === 0) {
			text(c, 'One local change.', 30, 216, 30);
			for (let row = 0; row < 3; row++)
				line(
					c,
					[
						[30, 248 + row * 24],
						[405 - row * 70, 248 + row * 24]
					],
					'#424a40',
					6
				);
		} else if (i === 1) {
			for (let row = 0; row < 5; row++) {
				const p = ease(at(t, 10.93 + row * 0.045, 0.16));
				text(c, '+', 30, 212 + row * 21, 22, { mono: true, color: lime, alpha: p });
				line(
					c,
					[
						[60, 205 + row * 21],
						[60 + (row % 2 ? 270 : 345) * p, 205 + row * 21]
					],
					'#7d9469',
					5
				);
			}
		} else {
			text(c, 'Fresh eyes.', 30, 216, 34, { color: lime });
			text(c, 'Separate from the builder.', 30, 259, 27, { color: '#b9beb3' });
		}
		stamp(c, stage.label, 271, 351, at(t, stage.done, 0.25));
		c.restore();
	});
	const delivery = ease(at(t, 12.4, 0.22));
	if (delivery) {
		box(c, 570, 806 + (1 - delivery) * 75, 780, 80, 4, ink);
		text(c, 'SEPARATE APPROVAL → LOCAL DELIVERY', 960, 857 + (1 - delivery) * 75, 24, {
			mono: true,
			align: 'center',
			color: lime,
			alpha: delivery
		});
	}
	text(c, 'Build. Review. Approve.', 100, 997, 82, { color: ink });
	text(c, 'ILLUSTRATIVE WORKFLOW', 1820, 1015, 18, { mono: true, color: ink, align: 'right' });
	// Fold the three independent review sheets into the final identity.
	const fold = ease(at(t, 12.79, 0.21));
	c.fillStyle = ink;
	c.fillRect(0, 0, 1920 * fold, 1080);
}

function outro(c, t) {
	text(c, 'IDLE, INTERRUPTED.', 100, 90, 25, { mono: true });
	text(c, '15 SECONDS / 0x1d1e', 1820, 90, 25, { mono: true, align: 'right' });
	line(
		c,
		[
			[100, 116],
			[1820, 116]
		],
		'#35383a'
	);
	const p = spring(at(t, 13, 0.65));
	c.save();
	c.translate(960, 575);
	c.scale(mix(0.86, 1, p), mix(1.2, 1, p));
	c.translate(-960, -575);
	word(c, '0x1d1e', 360, 665, 385, at(t, 13, 0.48));
	c.restore();
	const sub = ease(at(t, 13.35, 0.45));
	text(c, 'software made during idle cycles.', 960, 775 + 45 * (1 - sub), 51, {
		align: 'center',
		alpha: sub
	});
	line(
		c,
		[
			[740, 832],
			[1180, 832]
		],
		lime,
		5,
		sub
	);
	text(c, 'KANADE', 100, 1015, 24, { mono: true, alpha: sub });
	text(c, 'KINETIX', 960, 1015, 24, { mono: true, align: 'center', alpha: sub });
	text(c, 'MERRO', 1820, 1015, 24, { mono: true, align: 'right', alpha: sub });
}

export function renderFrame(c, time) {
	const t = Math.max(0, Math.min(film.duration, time));
	c.reset();
	c.fillStyle = ink;
	c.fillRect(0, 0, film.width, film.height);
	if (t < 2) intro(c, t);
	else if (t < 6) kanade(c, t);
	else if (t < 10) kinetix(c, t);
	else if (t < 13) merro(c, t);
	else outro(c, t);
	// Sparse fixed registration flecks, not a noisy texture that fights the codec.
	c.save();
	c.globalAlpha = 0.025;
	for (let i = 0; i < 190; i++) {
		c.fillStyle = i % 2 ? '#ffffff' : '#000000';
		c.fillRect((i * 113) % 1920, (i * 197) % 1080, 2, 2);
	}
	c.restore();
}
