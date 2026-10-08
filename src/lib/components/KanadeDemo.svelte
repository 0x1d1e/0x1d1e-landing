<script lang="ts">
	import { islandStates, islandDescriptions, type IslandState } from '$lib/demo-state';
	let islandState = $state<IslandState>('Rest');
	let playing = $state(true);
	function reset() {
		islandState = 'Rest';
		playing = true;
	}
</script>

<div class="demo kanade-demo">
	<div class="demo-topline"><span>01 / INTERFACE STUDY</span><span>niri · Wayland</span></div>
	<div class="island-field">
		<div class="island-axis" aria-hidden="true"></div>
		<div
			class="island"
			class:compact={islandState === 'Compact'}
			class:peek={islandState === 'Peek'}
			class:expanded={islandState === 'Expanded'}
		>
			{#if islandState === 'Rest'}
				<span class="island-clock">23:48</span>
			{:else}
				<div class="island-content">
					<div class="record-symbol" aria-hidden="true"><span></span></div>
					<div class="track-copy">
						<strong>Idle study</strong>{#if islandState !== 'Compact'}<span
								>Illustrative track / no audio</span
							>{/if}
					</div>
					{#if islandState === 'Compact'}<span class="media-mark" aria-hidden="true">Ⅱ</span>{/if}
					{#if islandState === 'Expanded'}
						<div class="media-divider"></div>
						<div class="media-controls">
							<span>{playing ? 'Playing' : 'Paused'} <small>/ mock state</small></span><button
								class="media-toggle"
								aria-label={playing ? 'Pause illustrative track' : 'Play illustrative track'}
								onclick={() => (playing = !playing)}>{playing ? 'Ⅱ' : '▶'}</button
							>
						</div>
					{/if}
				</div>
			{/if}
		</div>
		<span class="field-annotation"
			><span aria-hidden="true">↑</span> ONE ANCHOR. DIFFERENT FORMS.</span
		>
		<span class="field-coordinate" aria-hidden="true">x: center<br />y: top</span>
	</div>
	<div class="demo-controls" role="group" aria-label="Kanade island state">
		{#each islandStates as item (item)}<button
				aria-pressed={islandState === item}
				onclick={() => (islandState = item)}>{item}</button
			>{/each}
		<button class="reset" onclick={reset}>Reset <span aria-hidden="true">↺</span></button>
	</div>
	<p class="demo-description" role="status">{islandDescriptions[islandState]}</p>
	<p class="illustration-note">
		Illustrative reconstruction. State buttons stand in for desktop events, hover and click.
	</p>
</div>
