export const islandStates = ['Rest', 'Compact', 'Peek', 'Expanded'] as const;
export type IslandState = (typeof islandStates)[number];
export const islandDescriptions: Record<IslandState, string> = {
	Rest: 'At rest, the island shows the clock.',
	Compact: 'A playing track becomes a compact Activity.',
	Peek: 'Hovering an Activity reveals a little more context.',
	Expanded: 'A click opens the Media Surface. The island stays anchored.'
};
export type RouteScenario = 'available' | 'unavailable' | 'committed';
export function routeRequest(scenario: RouteScenario) {
	if (scenario === 'unavailable')
		return {
			target: 'B',
			fallback: true,
			message: 'Primary unavailable. Try the next eligible target before committing a response.'
		};
	if (scenario === 'committed')
		return {
			target: 'A',
			fallback: false,
			message: 'Response already committed. A later failure cannot switch to another target.'
		};
	return {
		target: 'A',
		fallback: false,
		message: 'Primary eligible. The configured priority Route selects target A.'
	};
}
export const lifecycle = [
	{
		stage: 'Objective',
		role: 'You → Main',
		detail: 'Add keyboard navigation to a local interface.',
		action: 'Read the plan',
		lane: 0
	},
	{
		stage: 'Plan approval',
		role: 'Main → You',
		detail: 'One local ChangeSet. Nothing starts until you approve the plan.',
		action: 'Approve plan',
		lane: 0
	},
	{
		stage: 'Implementation',
		role: 'Fresh implementer',
		detail: 'Implement, verify and commit in an isolated working copy.',
		action: 'Finish implementation',
		lane: 1
	},
	{
		stage: 'Independent review',
		role: 'Fresh reviewer',
		detail:
			'Review the diff, requirements and passing verification, without the implementer conversation.',
		action: 'Accept review',
		lane: 2
	},
	{
		stage: 'Delivery approval',
		role: 'Main → You',
		detail:
			'The reviewed local change is ready. Approve before fast-forwarding the canonical branch.',
		action: 'Approve local delivery',
		lane: 3
	},
	{
		stage: 'Done',
		role: 'Result',
		detail: 'The reviewed change is delivered. Local work does not require GitHub or a PR.',
		action: 'Delivered',
		lane: 3
	}
] as const;
export function advanceLifecycle(step: number) {
	return Math.min(step + 1, lifecycle.length - 1);
}
export function rejectReview(step: number) {
	return step === 3 ? 2 : step;
}
