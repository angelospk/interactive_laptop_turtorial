<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { gameState } from '$lib/gameStore.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	// Import all modules
	import Module1 from '$lib/components/modules/Module1.svelte';
	import Module2 from '$lib/components/modules/Module2.svelte';
	import Module3 from '$lib/components/modules/Module3.svelte';
	import Module4 from '$lib/components/modules/Module4.svelte';
	import Module5 from '$lib/components/modules/Module5.svelte';

	// Get module ID from URL
	let { data } = $props();
	const moduleId = $page.params.id || '';

	// Module mapping
	const moduleComponents: Record<string, any> = {
		module1: Module1,
		module2: Module2,
		module3: Module3,
		module4: Module4,
		module5: Module5
	};

	const ModuleComponent = moduleId ? moduleComponents[moduleId] : null;

	// Get progress for this module
	function getModuleProgress(): number {
		const lessonId = `${moduleId}-complete`;
		const progress = (data.progress as Record<string, any>)?.[lessonId];
		return progress?.score || 0;
	}
</script>

<div class="container mx-auto max-w-6xl py-8">
	<!-- Back Button -->
	<div class="mb-6">
		<Button variant="ghost" onclick={() => goto('/')}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			{m.back_to_modules?.() || 'Back to Modules'}
		</Button>
	</div>

	<!-- Module Content -->
	{#if ModuleComponent}
		{@const Component = ModuleComponent}
		<Component />
	{:else}
		<div class="py-12 text-center">
			<h1 class="text-2xl font-bold text-slate-700">Module Not Found</h1>
			<p class="mt-2 text-slate-500">The requested module does not exist.</p>
			<Button class="mt-6" onclick={() => goto('/')}>Go Home</Button>
		</div>
	{/if}
</div>
