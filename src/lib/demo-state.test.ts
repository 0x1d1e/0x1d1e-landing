import { describe, expect, it } from 'vitest';
import {
	islandStates,
	islandDescriptions,
	routeRequest,
	lifecycle,
	advanceLifecycle,
	rejectReview
} from './demo-state';
describe('island study', () => {
	it('explains every state', () => {
		expect(islandStates).toEqual(['Rest', 'Compact', 'Peek', 'Expanded']);
		for (const state of islandStates) expect(islandDescriptions[state]).toBeTruthy();
	});
});
describe('routing boundary', () => {
	it('selects the primary when eligible', () =>
		expect(routeRequest('available')).toMatchObject({ target: 'A', fallback: false }));
	it('falls back before commitment', () =>
		expect(routeRequest('unavailable')).toMatchObject({ target: 'B', fallback: true }));
	it('never retries after commitment', () =>
		expect(routeRequest('committed')).toMatchObject({ target: 'A', fallback: false }));
});
describe('local lifecycle', () => {
	it('requires plan and delivery approval', () => {
		expect(lifecycle[1].action).toBe('Approve plan');
		expect(lifecycle[4].action).toBe('Approve local delivery');
	});
	it('advances exactly one stage and stops at done', () => {
		for (let i = 0; i < lifecycle.length; i++) expect(advanceLifecycle(i)).toBe(Math.min(i + 1, 5));
	});
	it('rejection returns only a reviewing task to implementation', () => {
		expect(rejectReview(3)).toBe(2);
		for (const stage of [0, 1, 2, 4, 5]) expect(rejectReview(stage)).toBe(stage);
	});
});
