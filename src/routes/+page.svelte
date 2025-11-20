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
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import LogoutButton from '$lib/components/LogoutButton.svelte';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';

	// Cast messages to any to avoid indexing errors until types are generated
	const messages = m as any;

	// Get progress from server
	let { data } = $props();

	// Calculate module progress from lesson progress
	function getModuleProgress(moduleId: string): number {
		const lessonId = `${moduleId}-complete`;
		const progress = (data.progress as Record<string, any>)?.[lessonId];
		return progress?.score || 0;
	}

	type Module = {
		id: string;
		titleKey: string;
		descriptionKey: string;
	};

	const modules: Module[] = [
		{
			id: 'module1',
			titleKey: 'module1_title',
			descriptionKey: 'module1_description'
		},
		{
			id: 'module2',
			titleKey: 'module2_title',
			descriptionKey: 'module2_description'
		},
		{
			id: 'module3',
			titleKey: 'module3_title',
			descriptionKey: 'module3_description'
		},
		{
			id: 'module4',
			titleKey: 'module4_title',
			descriptionKey: 'module4_description'
		},
		{
			id: 'module5',
			titleKey: 'module5_title',
			descriptionKey: 'module5_description'
		}
	];
</script>

<main class="container mx-auto p-4 md:p-8">
	<!-- Header with Language Switcher and Logout -->
	<div class="mb-8 flex items-center justify-between">
		<div class="flex gap-4">
			<LogoutButton />
		</div>
		<LanguageSwitcher />
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
		{#each modules as module (module.id)}
			{@const moduleProgress = getModuleProgress(module.id)}
			<Card class="transition-shadow hover:shadow-lg">
				<CardHeader>
					<CardTitle>{messages[module.titleKey]()}</CardTitle>
					<CardDescription>{messages[module.descriptionKey]()}</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="mb-4">
						<p class="mb-1 text-sm font-medium">
							{messages.progress_label ? messages.progress_label() : 'Πρόοδος'}: {moduleProgress}%
						</p>
						<Progress value={moduleProgress} />
					</div>
					<Button class="w-full" onclick={() => goto(`/modules/${module.id}`)}>
						{messages.start_lesson()}
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
