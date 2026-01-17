<script lang="ts">
	import { gameState } from '$lib/gameStore.svelte';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Button } from '$lib/components/ui/button';
	import LogoutButton from '$lib/components/LogoutButton.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';

	// Cast messages to any to avoid indexing errors until types are generated
	const messages = m as any;

	import { getModuleProgress } from '$lib/utils/progress';

	// Get progress from server
	let { data } = $props();

	// Helper to use the utility with current data
	function getProgress(moduleId: string) {
		return getModuleProgress(moduleId, data.moduleLessonIds, data.progress);
	}
</script>

<main class="container mx-auto p-4 md:p-8">
	<!-- Header with Language Switcher and Logout -->
	<div class="mb-8 flex items-center justify-between">
		<div class="flex gap-4">
			<LogoutButton />
		</div>
		<LanguageToggle />
	</div>

	<div class="mb-12 text-center">
		<h1 class="mb-2 text-4xl font-bold">{messages.app_title()}</h1>
		<p class="text-lg text-slate-600">{messages.app_subtitle()}</p>
		{#if data.user}
			<p class="mt-2 text-sm text-slate-500">
				{messages.welcome_user({ displayName: data.user.displayName || data.user.username })}
			</p>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
		{#each data.modules as module (module.id)}
			{@const moduleProgress = getProgress(module.id)}
			<Card class="transition-shadow hover:shadow-lg">
				<CardHeader>
					<CardTitle
						>{messages[module.titleKey] ? messages[module.titleKey]() : module.id}</CardTitle
					>
					<CardDescription>
						{messages[module.descriptionKey] ? messages[module.descriptionKey]() : ''}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="mb-4">
						<p class="mb-1 text-sm font-medium">
							{messages.progress_label ? messages.progress_label() : 'Πρόοδος'}: {moduleProgress}%
						</p>
						<Progress value={moduleProgress} />
					</div>
					<Button class="w-full" href={`/modules/${module.id}`}>
						{messages.start_module()}
					</Button>
				</CardContent>
			</Card>
		{/each}
	</div>

	<div class="mt-8 text-center">
		<Button variant="secondary" onclick={() => gameState.reset()}>
			{messages.progress_reset()}
		</Button>
	</div>
</main>
