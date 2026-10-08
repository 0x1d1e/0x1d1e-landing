<script lang="ts">
	import { onMount } from 'svelte';
	import { organization, community, projects, featured, areas, principles } from '$lib/content';
	import KanadeDemo from '$lib/components/KanadeDemo.svelte';
	import KinetixDemo from '$lib/components/KinetixDemo.svelte';
	import MerroDemo from '$lib/components/MerroDemo.svelte';
	let progress = $state(0);
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
	onMount(() => {
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		let frame = 0;
		function update() {
			frame = 0;
			const distance = document.documentElement.scrollHeight - window.innerHeight;
			progress = preference.matches
				? 0
				: Math.min(1, Math.max(0, window.scrollY / Math.max(distance, 1)));
		}
		function schedule() {
			if (!frame) frame = requestAnimationFrame(update);
		}
		update();
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		preference.addEventListener('change', schedule);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			preference.removeEventListener('change', schedule);
		};
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
<div class="site-shell">
	<div class="workbench-rail" style={`--progress: ${progress}`} aria-hidden="true">
		<div class="rail-progress"></div>
		<span class="signal"></span><span class="rail-end"></span>
	</div>
	<header class="site-header">
		<a class="nav-wordmark" href="#identity" aria-label="0x1d1e home"
			>0x1d1e<span aria-hidden="true"> /</span></a
		>
		<nav aria-label="Main navigation">
			<a href="#experiments">Experiments</a><a href="#principles">Principles</a><a
				href={organization}>GitHub <span aria-hidden="true">↗</span></a
			>
		</nav>
	</header>
	<main id="main">
		<section class="hero" id="identity" aria-labelledby="identity-title">
			<div class="hero-meta technical">
				<span>INDEPENDENT SOFTWARE EXPERIMENTS</span><span>01 / IDLE CYCLES</span>
			</div>
			<h1 id="identity-title">0x1d1e<span class="wordmark-period" aria-hidden="true">.</span></h1>
			<div class="hero-bottom">
				<p class="hero-statement">software made<br />during idle cycles.</p>
				<div class="hero-introduction">
					<p>A loose group of people building software in the time between everything else.</p>
					<p class="hero-small">
						Infrastructure. Agents. Interfaces.<br />Whatever seems interesting next.
					</p>
					<a class="explore-link" href="#experiments"
						>Explore the experiments <span aria-hidden="true">↓</span></a
					>
				</div>
			</div>
			<div class="hero-foot technical">
				<span>SPARE TIME → WORKING SOFTWARE</span><span
					>SCROLL TO THE WORKBENCH <span aria-hidden="true">↓</span></span
				>
			</div>
		</section>

		<section class="section workbench" id="workbench" aria-labelledby="workbench-title">
			<div class="section-label technical">
				<span>02 / THE WORKBENCH</span><span>A FEW DIRECTIONS. NO FIXED DESTINATION.</span>
			</div>
			<div class="workbench-layout">
				<div class="workbench-intro">
					<h2 id="workbench-title">
						Loose interests.<br />Working<br /><span class="secondary">connections.</span>
					</h2>
					<p>Small experiments in software and systems. Built whenever there are spare cycles.</p>
					<span class="technical editorial-note">SELECT A DIRECTION → FIND AN EXPERIMENT</span>
				</div>
				<ul class="area-list">
					{#each areas as area, index (area.name)}<li>
							<a href={`#${area.project}`}
								><span class="area-index technical">0{index + 1}</span>
								<div>
									<h3>{area.name}</h3>
									<p>{area.description}</p>
									<span class="technical area-project">{area.annotation}</span>
								</div>
								<span class="area-arrow" aria-hidden="true">↗</span></a
							>
						</li>{/each}
				</ul>
			</div>
			<div class="process-strip" aria-label="Editorial experiment process">
				<span class="technical">AN EXPERIMENT, IN FIVE VERBS</span>
				<ol>
					<li>Be curious</li>
					<li>Build</li>
					<li>Run</li>
					<li>Verify</li>
					<li>Keep or discard</li>
				</ol>
				<p>An organizing idea. Not an internal pipeline.</p>
			</div>
		</section>

		<section class="section experiments" id="experiments" aria-labelledby="experiments-title">
			<div class="section-label technical">
				<span>03 / SELECTED EXPERIMENTS</span><span>PUBLIC CODE. OPEN QUESTIONS.</span>
			</div>
			<div class="experiments-intro">
				<h2 id="experiments-title">
					Less hypothetical.<br />More <span class="secondary">hands-on.</span>
				</h2>
				<p>Three things we built.<br />Three different ways to try an idea.</p>
			</div>
			{#each featured as project, index (project.slug)}
				<article
					class={`project project-${project.slug}`}
					id={project.slug}
					aria-labelledby={`${project.slug}-title`}
					tabindex="-1"
				>
					<div class="project-heading">
						<div>
							<span class="technical project-code">EXPERIMENT / 0{index + 1}</span>
							<h3 id={`${project.slug}-title`}>
								<a href={project.repository}>{project.name}<span aria-hidden="true">↗</span></a>
							</h3>
						</div>
						<div class="project-summary">
							<p>{project.summary}</p>
							<span class="technical"
								>{project.slug === 'kanade'
									? 'RUST / AMANE / NIRI'
									: project.slug === 'kinetix'
										? 'RUST / SELF-HOSTED / WASM PLUGINS'
										: 'PI / TMUX / GIT'}</span
							>
						</div>
					</div>
					{#if project.demo === 'island'}<KanadeDemo
						/>{:else if project.demo === 'routing'}<KinetixDemo />{:else}<MerroDemo />{/if}
					<div class="project-footer">
						<span class="technical">EXPERIMENTAL / CHECK THE REPOSITORY</span>
						<div>
							<a href={project.source}>Read the docs <span aria-hidden="true">↗</span></a><a
								href={project.repository}>View repository <span aria-hidden="true">↗</span></a
							>
						</div>
					</div>
					{#if project.slug === 'kinetix'}<p class="project-notice">
							Version reboot planned. Kinetix and its plugins document breaking contract changes. <a
								href={`${project.repository}/blob/5ef971f5777d40553dbd9b4fa98e767bb6356eb0/docs/reboot.md`}
								>Read the plan ↗</a
							>
						</p>{/if}
				</article>
			{/each}
		</section>

		<section
			class="section repository-index"
			id="repositories"
			aria-labelledby="repositories-title"
		>
			<div class="section-label technical">
				<span>04 / REPOSITORY INDEX</span><span>THE EXPERIMENTS & THEIR SATELLITES</span>
			</div>
			<div class="index-heading">
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
				{visibleProjects.length} REPOSITORIES / {filter.toUpperCase()}
			</p>
			<div class="catalogue">
				<div class="catalogue-header technical" aria-hidden="true">
					<span>PROJECT / REPOSITORY</span><span>WHAT IT IS</span><span>STATE</span><span>LINK</span
					>
				</div>
				<ul>
					{#each visibleProjects as project (project.slug)}<li class:satellite={!!project.parent}>
							<a href={project.repository}
								><span class="catalogue-name"
									>{#if project.parent}<span class="satellite-mark" aria-hidden="true">↳</span
										>{/if}{project.name}<small class="technical">{project.topics.join(' / ')}</small
									></span
								><span class="catalogue-summary">{project.summary}</span><span
									class="catalogue-status technical">{project.status}</span
								><span class="catalogue-arrow" aria-hidden="true">↗</span></a
							>
						</li>{/each}
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
				<span>05 / WHY WE BUILD</span><a href={community.source}>FROM THE ORGANIZATION PROFILE ↗</a>
			</div>
			<h2 id="principles-title">
				What if<br />we just<br /><span class="secondary">built it?</span>
			</h2>
			<div class="philosophy-bottom">
				<p class="philosophy-aside">
					Sometimes a useful tool.<br />Sometimes an answer to one question.<br /><span
						>Both are valid outcomes.</span
					>
				</p>
				<ol class="principle-list">
					{#each principles as principle, index (principle.title)}<li>
							<span class="technical">0{index + 1}</span>
							<div>
								<h3>{principle.title}</h3>
								<p>{principle.copy}</p>
							</div>
						</li>{/each}
				</ol>
			</div>
		</section>

		<section class="section open-end" id="open-end" aria-labelledby="closing-title">
			<div class="section-label technical">
				<span>06 / OPEN END</span><span>KEEP THE USEFUL PARTS.</span>
			</div>
			<div class="closing-layout">
				<h2 id="closing-title">Read the code.<br />Break it.<br />Keep the useful parts.</h2>
				<div class="closing-links">
					<a class="explore-link" href={organization}
						>Explore GitHub <span aria-hidden="true">↗</span></a
					><a href="#repositories">Browse projects <span aria-hidden="true">↑</span></a><a
						href={community.contributing}
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
