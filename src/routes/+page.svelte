<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { organization, community, projects, featured, principles } from '$lib/content';
	import KanadeDemo from '$lib/components/KanadeDemo.svelte';
	import KinetixDemo from '$lib/components/KinetixDemo.svelte';
	import MerroDemo from '$lib/components/MerroDemo.svelte';
	import Showreel from '$lib/components/Showreel.svelte';

	let enhanced = $state(false);
	let selected = $state(featured[0].slug);
	let filter = $state('All');
	const topics = [
		'All',
		'AI infrastructure',
		'Coding agents',
		'Linux desktop',
		'Interfaces',
		'Developer tooling'
	];
	const visibleProjects = $derived(
		projects.filter((project) => filter === 'All' || project.topics.includes(filter))
	);

	async function followStudyHash() {
		const project = featured.find((project) => window.location.hash === `#study-${project.slug}`);
		if (!project) return;
		selected = project.slug;
		await tick();
		const panel = document.getElementById(`study-${project.slug}`);
		panel?.focus({ preventScroll: true });
		panel?.scrollIntoView({ block: 'start' });
	}

	async function exploreStudy(event: globalThis.MouseEvent, slug: string) {
		if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
			return;
		event.preventDefault();
		selected = slug;
		await tick();
		window.location.hash = `study-${slug}`;
		const panel = document.getElementById(`study-${slug}`);
		panel?.focus({ preventScroll: true });
		panel?.scrollIntoView({ block: 'start' });
	}

	onMount(() => {
		enhanced = true;
		void followStudyHash();
		window.addEventListener('hashchange', followStudyHash);
		return () => window.removeEventListener('hashchange', followStudyHash);
	});
</script>

<svelte:head>
	<title>0x1d1e · software made during idle cycles.</title>
	<meta
		name="description"
		content="An experimental software collective. Explore Kanade, Kinetix and Merro: interfaces, LLM infrastructure and coding agents, built during idle cycles."
	/>
	<meta property="og:title" content="0x1d1e / The idle workbench" />
	<meta
		property="og:description"
		content="Software made during idle cycles. Small experiments in infrastructure, agents and interfaces."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell" class:enhanced>
	<header class="site-header">
		<a class="nav-wordmark" href="#identity" aria-label="0x1d1e home"
			>0x1d1e<span aria-hidden="true"> /</span></a
		>
		<nav aria-label="Main navigation">
			<a href="#experiments">Projects</a>
			<a href="#principles">About</a>
			<a href={organization}>GitHub <span aria-hidden="true">↗</span></a>
		</nav>
	</header>
	<main id="main" tabindex="-1">
		<section class="hero" id="identity" aria-labelledby="identity-title">
			<div class="hero-introduction">
				<p class="technical eyebrow">Independent software experiments</p>
				<h1 id="identity-title">
					software made<br />during <span class="secondary">idle cycles.</span>
				</h1>
				<p class="hero-copy">
					A loose group building infrastructure, agents and interfaces in the time between
					everything else.
				</p>
				<a class="explore-link" href="#experiments"
					>Browse projects <span aria-hidden="true">↓</span></a
				>
				<a class="film-link" href="#showreel"
					>Watch the 15-second film <span aria-hidden="true">↗</span></a
				>
				<p class="hero-note technical">
					Public code. Open questions.<br />Experimental unless stated otherwise.
				</p>
			</div>

			<div class="workbench" id="workbench" aria-labelledby="workbench-title">
				<div class="workbench-heading">
					<h2 class="technical" id="workbench-title">The workbench</h2>
					<span class="technical">Three experiments / one surface</span>
				</div>
				<div class="study-selectors" role="group" aria-label="Choose an experiment">
					{#each featured as project, index (project.slug)}
						<button
							aria-pressed={selected === project.slug}
							aria-controls={`study-${project.slug}`}
							onclick={() => (selected = project.slug)}
						>
							<span class="selector-index technical">0{index + 1}</span>
							<span><strong>{project.name}</strong><small>{project.study.label}</small></span>
						</button>
					{/each}
				</div>
				<p class="workbench-disclaimer technical">Illustrative studies / not running software</p>
				<noscript
					><p class="static-note">
						All three static studies are shown below. Enable JavaScript to change states and filter
						repositories.
					</p></noscript
				>
				<div class="workbench-panels">
					{#each featured as project (project.slug)}
						<article
							class="study-panel"
							class:inactive={enhanced && selected !== project.slug}
							id={`study-${project.slug}`}
							aria-labelledby={`${project.slug}-study-title`}
							aria-hidden={enhanced && selected !== project.slug ? 'true' : undefined}
							inert={enhanced && selected !== project.slug}
							tabindex="-1"
						>
							<div class="study-heading">
								<h3 id={`${project.slug}-study-title`}>{project.name}</h3>
								<p>{project.summary}</p>
							</div>
							{#if project.demo === 'island'}<KanadeDemo
								/>{:else if project.demo === 'routing'}<KinetixDemo />{:else}<MerroDemo />{/if}
							<div class="study-footer">
								<span class="technical">{project.status} / {project.study.stack}</span>
								<a href={project.repository}
									>{project.name} repository <span aria-hidden="true">↗</span></a
								>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<Showreel />

		<section class="section experiments" id="experiments" aria-labelledby="experiments-title">
			<div class="section-label technical">
				<span>01 / Selected experiments</span><span>Different questions. Working answers.</span>
			</div>
			<div class="section-intro">
				<h2 id="experiments-title">Three things<br />on the bench.</h2>
				<p>Separate projects, not one platform.<br />Follow the idea that interests you.</p>
			</div>
			{#each featured as project, index (project.slug)}
				<article class="project-note" id={project.slug} aria-labelledby={`${project.slug}-title`}>
					<div class="note-name">
						<span class="technical">Experiment / 0{index + 1}</span>
						<h3 id={`${project.slug}-title`}>
							<a href={project.repository}>{project.name}<span aria-hidden="true">↗</span></a>
						</h3>
						<p class="technical">{project.study.stack}</p>
					</div>
					<div class="note-content">
						<p class="note-idea">{project.study.idea}</p>
						<p class="note-boundary">{project.study.boundary}</p>
						{#if project.slug === 'kinetix'}
							<p class="project-notice">
								Version reboot planned, with breaking contract changes. <a
									href={`${project.repository}/blob/5ef971f5777d40553dbd9b4fa98e767bb6356eb0/docs/reboot.md`}
									>Read the plan ↗</a
								>
							</p>
						{/if}
						<div class="note-actions">
							<a
								class="study-link"
								href={`#study-${project.slug}`}
								onclick={(event) => exploreStudy(event, project.slug)}
								>Explore {project.name} study <span aria-hidden="true">↑</span></a
							>
							<a href={project.source}>Read the docs <span aria-hidden="true">↗</span></a>
						</div>
					</div>
				</article>
			{/each}
		</section>

		<section
			class="section repository-index"
			id="repositories"
			aria-labelledby="repositories-title"
		>
			<div class="section-label technical">
				<span>02 / Repository index</span><span>The experiments & their satellites</span>
			</div>
			<div class="section-intro">
				<h2 id="repositories-title">There’s more<br />on the bench.</h2>
				<p>
					Primary projects, prototypes and the tools around them. Public code is not a stability
					guarantee.
				</p>
			</div>
			<div class="index-filters" role="group" aria-label="Filter repositories by topic">
				{#each topics as topic (topic)}<button
						aria-pressed={filter === topic}
						onclick={() => (filter = topic)}>{topic}</button
					>{/each}
			</div>
			<p class="filter-status technical" role="status">
				{visibleProjects.length} repositories / {filter}
			</p>
			<div class="catalogue">
				<div class="catalogue-header technical" aria-hidden="true">
					<span>Project / repository</span><span>What it is</span><span>State</span><span>Link</span
					>
				</div>
				<ul>
					{#each visibleProjects as project (project.slug)}
						<li class:satellite={!!project.parent}>
							<a href={project.repository}>
								<span class="catalogue-name"
									>{#if project.parent}<span class="satellite-mark" aria-hidden="true">↳</span
										>{/if}{project.name}<small class="technical">{project.topics.join(' / ')}</small
									></span
								>
								<span class="catalogue-summary">{project.summary}</span>
								<span class="catalogue-status technical">{project.status}</span>
								<span class="catalogue-arrow" aria-hidden="true">↗</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
			<p class="index-note">
				A selected public index, not a complete inventory. <a
					href={`${organization}?tab=repositories`}>All repositories on GitHub ↗</a
				>
			</p>
		</section>

		<section class="section philosophy" id="principles" aria-labelledby="principles-title">
			<div class="section-label technical">
				<span>03 / Why we build</span><a href={community.source}>Organization profile ↗</a>
			</div>
			<div class="philosophy-layout">
				<div>
					<h2 id="principles-title">
						What if we<br /><span class="secondary">just built it?</span>
					</h2>
					<p class="philosophy-aside">
						Sometimes a useful tool. Sometimes a prototype that answers one question. Both are valid
						outcomes.
					</p>
				</div>
				<ol class="principle-list">
					{#each principles as principle, index (principle.title)}
						<li>
							<span class="technical">0{index + 1}</span>
							<div>
								<h3>{principle.title}</h3>
								<p>{principle.copy}</p>
							</div>
						</li>
					{/each}
				</ol>
			</div>
		</section>

		<section class="section open-end" aria-labelledby="closing-title">
			<div class="section-label technical">
				<span>04 / Open end</span><span>No fixed destination</span>
			</div>
			<div class="closing-layout">
				<h2 id="closing-title">Keep the<br />useful parts.</h2>
				<div class="closing-links">
					<a class="explore-link" href={organization}
						>Explore GitHub <span aria-hidden="true">↗</span></a
					>
					<a href="#repositories">Browse all projects <span aria-hidden="true">↑</span></a>
					<a href={community.contributing}
						>Contributing guidelines <span aria-hidden="true">↗</span></a
					>
				</div>
			</div>
			<div class="closing-wordmark" aria-hidden="true">0x1d1e<span>.</span></div>
			<footer class="site-footer">
				<span>software made during idle cycles.</span><a href={community.security}
					>Security policy ↗</a
				><a href="#identity">Back to the start ↑</a>
			</footer>
		</section>
	</main>
</div>
