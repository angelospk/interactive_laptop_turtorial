<script lang="ts">
	/**
	 * gov.gr for the gov guide. `GovGrApp` shows one screen at a time, so the
	 * guide's current target picks the screen: a skipped step or a reset still
	 * shows the screen the step talks about.
	 */
	import GovGrApp from '$lib/components/apps/GovGrApp.svelte';
	import type { GovSimConfig } from '$lib/lessons/govSim';

	let { config, target, onEvent } = $props<{
		config: Record<string, unknown>;
		target?: string | null;
		onEvent: (action: string, data?: Record<string, unknown>) => void;
	}>();

	type Screen = GovSimConfig['startScreen'];

	function screenFor(t: string | null | undefined): Screen | null {
		if (!t) return null;
		if (t === 'gov-login-button') return 'login';
		if (t.startsWith('gov-service-')) return 'services';
		if (t === 'gov-download') return 'certificate';
		if (t === 'gov-authorize') return 'authorize';
		return null; // e.g. the header: keep the screen we are on
	}

	let screen = $state<Screen>('login');
	$effect(() => {
		const next = screenFor(target);
		if (next) screen = next;
	});
</script>

{#key screen}
	<GovGrApp config={{ ...config, startScreen: screen } as GovSimConfig} {onEvent} />
{/key}
