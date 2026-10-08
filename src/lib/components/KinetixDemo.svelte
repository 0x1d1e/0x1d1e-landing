<script lang="ts">
	import { routeRequest, type RouteScenario } from '$lib/demo-state';
	let scenario = $state<RouteScenario>('available');
	let sent = $state(false);
	const result = $derived(routeRequest(scenario));
	function select(value: RouteScenario) {
		scenario = value;
		sent = false;
	}
	function reset() {
		scenario = 'available';
		sent = false;
	}
</script>

<div class="demo kinetix-demo">
	<div class="demo-topline"><span>02 / ROUTING STUDY</span><span>Priority + fallback</span></div>
	<div class="route-field">
		<svg class="route-lines" viewBox="0 0 900 300" preserveAspectRatio="none" aria-hidden="true">
			<path
				d="M 130 150 H 425 M 425 150 H 530 V 70 H 775 M 530 150 V 230 H 775"
				class="route-base"
			/>
			<path
				d="M 130 150 H 425 H 530 V 70 H 775"
				class:active={sent && result.target === 'A'}
				class:rejected={sent && result.fallback}
				class="route-primary"
			/>
			<path
				d="M 425 150 H 530 V 230 H 775"
				class:active={sent && result.target === 'B'}
				class="route-secondary"
			/>
			{#if sent}<circle
					cx="775"
					cy={result.target === 'A' ? 70 : 230}
					r="5"
					class="request-dot"
				/>{/if}
		</svg>
		<div class="route-node client">
			<span class="technical">REQUEST</span><strong>Client</strong><small>Compatible API</small>
		</div>
		<div class="route-node router">
			<span class="technical">VIRTUAL KEY → ROUTE</span><strong>Kinetix</strong><small
				>Operator-defined priority</small
			>
		</div>
		<div class="route-node target target-a" class:chosen={sent && result.target === 'A'}>
			<span class="technical">TARGET A / PRIMARY</span><strong
				>{scenario === 'unavailable' ? 'Unavailable' : 'Eligible'}</strong
			><small
				>{sent && result.target === 'A'
					? scenario === 'committed'
						? 'Committed · no retry'
						: 'Selected'
					: 'Configured provider'}</small
			>
		</div>
		<div class="route-node target target-b" class:chosen={sent && result.target === 'B'}>
			<span class="technical">TARGET B / FALLBACK</span><strong>Eligible</strong><small
				>{sent && result.target === 'B' ? 'Selected after fallback' : 'Configured provider'}</small
			>
		</div>
	</div>
	<div class="route-scenarios" role="group" aria-label="Routing scenario">
		<button aria-pressed={scenario === 'available'} onclick={() => select('available')}
			>Primary available</button
		>
		<button aria-pressed={scenario === 'unavailable'} onclick={() => select('unavailable')}
			>Primary unavailable</button
		>
		<button aria-pressed={scenario === 'committed'} onclick={() => select('committed')}
			>Response committed</button
		>
	</div>
	<div class="route-actions">
		<button class="action-button" onclick={() => (sent = true)}
			>{scenario === 'committed' ? 'Show late failure' : 'Route request'}
			<span aria-hidden="true">→</span></button
		><button class="reset" onclick={reset}>Reset <span aria-hidden="true">↺</span></button><span
			class="technical route-state"
			>{sent
				? result.fallback
					? 'FALLBACK → B'
					: scenario === 'committed'
						? 'COMMITTED / NO FALLBACK'
						: 'SELECTED → A'
				: 'READY / ILLUSTRATIVE'}</span
		>
	</div>
	<p class="demo-description" role="status">
		{sent ? result.message : 'Choose a scenario, then route a single illustrative request.'}
	</p>
	<p class="illustration-note">
		Conceptual Route. A and B are fictional operator-configured targets. No traffic or provider
		measurements.
	</p>
</div>
