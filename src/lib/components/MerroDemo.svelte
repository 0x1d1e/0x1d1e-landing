<script lang="ts">
	import { lifecycle, advanceLifecycle, rejectReview } from '$lib/demo-state';
	let step = $state(0);
	let round = $state(1);
	const current = $derived(lifecycle[step]);
	function reset() {
		step = 0;
		round = 1;
	}
	function reject() {
		step = rejectReview(step);
		round += 1;
	}
	const lanes = ['Objective / Main', 'Implementer', 'Independent reviewer', 'Result / delivery'];
</script>

<div class="demo merro-demo">
	<div class="demo-topline"><span>03 / LIFECYCLE STUDY</span><span>Pi + tmux + Git</span></div>
	<div class="merro-objective">
		<span class="technical">LOCAL OBJECTIVE</span>
		<p>Add keyboard navigation.</p>
		<span class="technical">ONE CHANGESET / NO GITHUB REQUIRED</span>
	</div>
	<ol class="lifecycle-lanes">
		{#each lanes as lane, index (lane)}
			<li class:current={current.lane === index} class:complete={current.lane > index}>
				<span class="lane-number">0{index + 1}</span>
				<h4>{lane}</h4>
				<span class="lane-state"
					>{current.lane === index
						? current.stage
						: current.lane > index
							? 'Passed'
							: 'Waiting'}</span
				>
				<span class="lane-indicator" aria-hidden="true"
					>{current.lane > index ? '✓' : current.lane === index ? '●' : '○'}</span
				>
			</li>
		{/each}
	</ol>
	<div class="lifecycle-detail" role="status">
		<span class="technical">{current.role} {round > 1 ? '/ fresh attempt ' + round : ''}</span>
		<p>{current.detail}</p>
	</div>
	<div class="demo-controls merro-controls">
		<button
			class="action-button"
			onclick={() => (step = advanceLifecycle(step))}
			disabled={step === lifecycle.length - 1}
			>{current.action}<span aria-hidden="true">→</span></button
		>
		{#if step === 3}<button onclick={reject}
				>Request changes <span aria-hidden="true">↶</span></button
			>{/if}
		<button class="reset" onclick={reset}>Reset <span aria-hidden="true">↺</span></button>
	</div>
	<p class="illustration-note">
		Illustrative local-delivery path. No agents run here. Rejection starts a fresh implementer, then
		a fresh reviewer.
	</p>
</div>
