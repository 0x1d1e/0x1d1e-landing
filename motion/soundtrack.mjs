// Original, procedurally synthesized stereo score. No samples or external music.
import { Buffer } from 'node:buffer';

export function soundtrack(duration = 15, sampleRate = 48000) {
	const frames = duration * sampleRate;
	const left = new Float64Array(frames);
	const right = new Float64Array(frames);
	let seed = 0x1d1e;
	const noise = () => {
		seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
		return seed / 2147483648 - 1;
	};
	function event(start, length, gain, pitch, type = 'tone', pan = 0) {
		let low = 0;
		for (let n = 0; n < length * sampleRate; n++) {
			const i = Math.round(start * sampleRate) + n;
			if (i >= frames) break;
			const t = n / sampleRate;
			const p = t / length;
			const attack = Math.min(1, t / (type === 'wash' ? 0.05 : 0.004));
			const envelope =
				attack * Math.exp(-p * (type === 'wash' ? 2.5 : 7)) * Math.min(1, (1 - p) * 12);
			let value;
			if (type === 'kick') {
				const phase = 2 * Math.PI * (pitch * t + 20 * (1 - Math.exp(-t * 30)));
				value = Math.sin(phase) * envelope;
			} else if (type === 'paper' || type === 'wash') {
				const raw = noise();
				low += (raw - low) * (type === 'paper' ? 0.35 : 0.06 + p * 0.3);
				value = (type === 'paper' ? raw - low : low) * envelope;
			} else if (type === 'metal') {
				value =
					(Math.sin(t * pitch * 2 * Math.PI) + 0.3 * Math.sin(t * pitch * 5.73 * Math.PI)) *
					envelope;
			} else {
				value =
					(Math.sin(t * pitch * 2 * Math.PI) + 0.15 * Math.sin(t * pitch * 4 * Math.PI)) * envelope;
			}
			left[i] += value * gain * Math.sqrt((1 - pan) / 2);
			right[i] += value * gain * Math.sqrt((1 + pan) / 2);
		}
	}
	// Near-silence, then the interruption. Shapes and sound share the same cut points.
	event(0.52, 0.045, 0.04, 1900, 'metal', -0.15);
	event(1.34, 0.18, 0.13, 330, 'tone');
	event(1.79, 0.21, 0.4, 0, 'wash');
	event(2, 0.5, 0.62, 65, 'kick');
	for (const [start, pitch, pan] of [
		[2.72, 330, -0.3],
		[3.45, 440, 0.3],
		[4.18, 220, 0]
	]) {
		event(start, 0.5, 0.23, pitch, 'tone', pan);
		event(start + 0.11, 0.32, 0.08, pitch * 1.5, 'tone', -pan);
	}
	event(4.2, 1.2, 0.14, 110);
	event(4.2, 1.2, 0.08, 165);
	event(5.48, 0.35, 0.25, 0, 'wash', -0.3);
	event(6, 0.35, 0.55, 55, 'kick');
	for (let i = 0; i < 12; i++) {
		event(
			6.25 + i * 0.25,
			0.11,
			i % 4 === 0 ? 0.12 : 0.055,
			i % 2 ? 660 : 330,
			'metal',
			i % 2 ? 0.45 : -0.45
		);
	}
	event(6.85, 0.16, 0.2, 440, 'metal', -0.5);
	event(7.24, 0.15, 0.2, 660, 'metal', 0.3);
	for (let i = 0; i < 3; i++) event(7.5 + i * 0.05, 0.045, 0.15, 147, 'metal', 0.5);
	event(7.92, 0.22, 0.28, 0, 'wash', -0.2);
	event(8.6, 0.5, 0.3, 220, 'tone', 0.4);
	event(8.6, 0.35, 0.32, 65, 'kick');
	event(9.7, 0.3, 0.35, 0, 'paper', -0.2);
	for (const [start, pan] of [
		[10.02, -0.65],
		[10.73, 0],
		[11.43, 0.65]
	]) {
		event(start, 0.18, 0.25, 0, 'paper', pan);
	}
	for (const [start, pitch, pan] of [
		[10.62, 330, -0.6],
		[11.34, 440, 0],
		[12.06, 550, 0.6],
		[12.4, 660, 0]
	]) {
		event(start, 0.14, 0.26, pitch, 'metal', pan);
		event(start, 0.12, 0.3, 80, 'kick', pan);
	}
	event(12.79, 0.21, 0.3, 0, 'wash');
	event(13, 0.65, 0.5, 55, 'kick');
	for (const [pitch, gain, pan] of [
		[110, 0.25, 0],
		[165, 0.13, -0.5],
		[220, 0.11, 0.5],
		[330, 0.07, 0]
	]) {
		event(13.08, 1.85, gain, pitch, 'tone', pan);
	}
	const wav = Buffer.alloc(44 + frames * 4);
	wav.write('RIFF');
	wav.writeUInt32LE(wav.length - 8, 4);
	wav.write('WAVEfmt ', 8);
	wav.writeUInt32LE(16, 16);
	wav.writeUInt16LE(1, 20);
	wav.writeUInt16LE(2, 22);
	wav.writeUInt32LE(sampleRate, 24);
	wav.writeUInt32LE(sampleRate * 4, 28);
	wav.writeUInt16LE(4, 32);
	wav.writeUInt16LE(16, 34);
	wav.write('data', 36);
	wav.writeUInt32LE(frames * 4, 40);
	for (let i = 0; i < frames; i++) {
		// Soft peak limiting and a final fade prevent clipping or an end-of-file click.
		const fade = Math.min(1, (frames - i) / (sampleRate * 0.1));
		wav.writeInt16LE(Math.round(Math.tanh(left[i]) * fade * 28000), 44 + i * 4);
		wav.writeInt16LE(Math.round(Math.tanh(right[i]) * fade * 28000), 46 + i * 4);
	}
	return wav;
}
