export const organization = 'https://github.com/0x1d1e';
export const community = {
	contributing: `${organization}/.github/blob/main/CONTRIBUTING.md`,
	security: `${organization}/.github/blob/main/SECURITY.md`,
	source: `${organization}/.github/blob/7213edcb9734b3fac433b4bdb33b5c1d43115f1e/profile/README.md`
};
export type Project = {
	name: string;
	slug: string;
	summary: string;
	repository: string;
	topics: string[];
	status: 'Experimental' | 'Prototype' | 'Supporting';
	source: string;
	demo?: 'island' | 'routing' | 'lifecycle';
	parent?: string;
};
const repo = (name: string) => `${organization}/${name}`;
export const projects: Project[] = [
	{
		name: 'Kanade',
		slug: 'kanade',
		summary: 'A top-center Dynamic Island for the niri Wayland compositor.',
		repository: repo('kanade'),
		topics: ['Linux desktop', 'Interfaces'],
		status: 'Experimental',
		demo: 'island',
		source: `${repo('kanade')}/blob/755ce859d4d7b6466f387bafed17e695e5c21058/README.md`
	},
	{
		name: 'kanade-prototype',
		slug: 'kanade-prototype',
		summary: 'A standalone, mocked interaction and motion study.',
		repository: repo('kanade-prototype'),
		topics: ['Interfaces'],
		status: 'Prototype',
		parent: 'kanade',
		source: `${repo('kanade-prototype')}/blob/c4535048b9f4106808941f805b721a19186c931a/README.md`
	},
	{
		name: 'kanade-lander',
		slug: 'kanade-lander',
		summary: 'The project landing page for Kanade.',
		repository: repo('kanade-lander'),
		topics: ['Interfaces'],
		status: 'Supporting',
		parent: 'kanade',
		source: `${repo('kanade-lander')}/tree/ef7be93218e88b55cc70a381e6be9256052664f6`
	},
	{
		name: 'Kinetix',
		slug: 'kinetix',
		summary: 'A self-hosted LLM gateway with executable Routes and fallback.',
		repository: repo('kinetix'),
		topics: ['AI infrastructure', 'Developer tooling'],
		status: 'Experimental',
		demo: 'routing',
		source: `${repo('kinetix')}/blob/5ef971f5777d40553dbd9b4fa98e767bb6356eb0/README.md`
	},
	{
		name: 'kinetix-plugins',
		slug: 'kinetix-plugins',
		summary: 'Plugins, guest SDK, catalogue and release tooling.',
		repository: repo('kinetix-plugins'),
		topics: ['AI infrastructure', 'Developer tooling'],
		status: 'Supporting',
		parent: 'kinetix',
		source: `${repo('kinetix-plugins')}/blob/5630b233a30bc4279d8ca76a19fe2284a6e2fc87/README.md`
	},
	{
		name: 'kinetix-frontend',
		slug: 'kinetix-frontend',
		summary: 'A standalone workbench for the Kinetix admin interface.',
		repository: repo('kinetix-frontend'),
		topics: ['Interfaces', 'AI infrastructure'],
		status: 'Prototype',
		parent: 'kinetix',
		source: `${repo('kinetix-frontend')}/blob/541249c653edd4c9e2b3e22157985bec28e925a2/README.md`
	},
	{
		name: 'Merro',
		slug: 'merro',
		summary: 'A Pi + tmux + Git project lead with independent review.',
		repository: repo('merro'),
		topics: ['Coding agents', 'Developer tooling'],
		status: 'Experimental',
		demo: 'lifecycle',
		source: `${repo('merro')}/blob/d019db27c88de2a96ff4d6f38b3b18a73b16f94a/README.md`
	}
];
export const featured = projects.filter((project) => project.demo);
export const areas = [
	{
		name: 'AI infrastructure',
		description: 'One endpoint. More than one way through.',
		project: 'kinetix',
		annotation: 'Kinetix / routing'
	},
	{
		name: 'Coding agents',
		description: 'Give the work a goal. Give the result a review.',
		project: 'merro',
		annotation: 'Merro / orchestration'
	},
	{
		name: 'Developer tooling',
		description: 'Tools for the tools we already use.',
		project: 'merro',
		annotation: 'Merro / Pi + tmux + Git'
	},
	{
		name: 'Linux desktop',
		description: 'A little surface for what is happening now.',
		project: 'kanade',
		annotation: 'Kanade / niri'
	},
	{
		name: 'Interfaces & systems',
		description: 'Find the shape by making it work.',
		project: 'kanade',
		annotation: 'Kanade / interaction'
	}
];
export const principles = [
	{
		title: 'Build first',
		copy: 'Working software teaches more than discussing hypothetical software.'
	},
	{ title: 'Verify things', copy: 'Source code, measurements and reproductions beat guesses.' },
	{
		title: 'Keep the useful parts',
		copy: 'An experiment can answer one question and stop there. That counts.'
	},
	{
		title: 'No fake stability',
		copy: 'Public does not mean production-ready. Check the repository.'
	},
	{
		title: 'No roadmap theater',
		copy: 'Projects move when someone wants to work on them. Intent is not a delivery date.'
	}
];
export function validateProjects(entries: Project[]) {
	const slugs = new Set<string>();
	for (const project of entries) {
		if (!project.name.trim() || !project.summary.trim() || !project.topics.length)
			throw new Error('Incomplete project content');
		if (!/^[a-z0-9-]+$/.test(project.slug) || slugs.has(project.slug))
			throw new Error('Invalid or duplicate project slug');
		slugs.add(project.slug);
		for (const link of [project.repository, project.source]) {
			const url = new URL(link);
			if (url.origin !== 'https://github.com' || !url.pathname.startsWith('/0x1d1e/'))
				throw new Error('Project source must be public organization GitHub');
		}
		if (!['Experimental', 'Prototype', 'Supporting'].includes(project.status))
			throw new Error('Invalid project status');
	}
	for (const project of entries)
		if (project.parent && !slugs.has(project.parent)) throw new Error('Unknown parent project');
	return entries;
}
validateProjects(projects);
