<script lang="ts">
	/**
	 * The health services for the health guide. `HealthApp` shows one screen at
	 * a time, so the guide's current target picks it: `health-sms`,
	 * `health-portal` or `health-appointments`. The target is the whole screen,
	 * so it stays visible while the learner clicks through it.
	 */
	import HealthApp from '$lib/components/apps/HealthApp.svelte';
	import type { HealthScreen, HealthSimConfig } from '$lib/lessons/healthSim';

	let { config, target, onEvent } = $props<{
		config: Record<string, unknown>;
		target?: string | null;
		onEvent: (action: string, data?: Record<string, unknown>) => void;
	}>();

	const SCREENS: HealthScreen[] = ['sms', 'portal', 'appointments'];

	let screen = $state<HealthScreen>('sms');
	$effect(() => {
		const next = SCREENS.find((s) => target === `health-${s}`);
		if (next) screen = next;
	});
</script>

{#key screen}
	<div class="h-full" data-guide={`health-${screen}`}>
		<HealthApp config={{ ...config, screen } as HealthSimConfig} onAction={onEvent} />
	</div>
{/key}
