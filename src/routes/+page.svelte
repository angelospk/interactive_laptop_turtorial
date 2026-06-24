<script lang="ts">
	import { gameState } from '$lib/gameStore.svelte';
	import { Button } from '$lib/components/ui/button';
	import LogoutButton from '$lib/components/LogoutButton.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { BookOpen, ArrowRight, Check } from '@lucide/svelte';
	import { reveal } from '$lib/actions/reveal';
	import { groupModulesByCategory } from '$lib/config/moduleOrganization';

	// Cast messages to any to avoid indexing errors until types are generated
	const messages = m as any;

	import { getModuleProgress } from '$lib/utils/progress';

	// Get progress from server
	let { data } = $props();

	function getProgress(moduleId: string) {
		return getModuleProgress(moduleId, data.moduleLessonIds, data.progress);
	}

	// Group the flat module list into themed categories for easier navigation.
	let groupedModules = $derived(groupModulesByCategory(data.modules ?? []));
</script>

<main class="relative min-h-[100dvh] overflow-hidden bg-background">
	<!-- Soft ambient field -->
	<div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute -top-40 left-1/4 h-[32rem] w-[32rem] rounded-full opacity-40 blur-3xl"
			style="background: radial-gradient(circle, oklch(0.88 0.07 264 / 0.5), transparent 70%);"
		></div>
	</div>

	<div class="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
		<!-- Header -->
		<header class="mb-12 flex flex-wrap items-center justify-between gap-3">
			<div class="flex flex-wrap items-center gap-2.5">
				<LogoutButton />
				<Button
					variant="outline"
					href="/library"
					class="h-11 gap-2 rounded-full px-5 text-base shadow-soft"
				>
					<BookOpen class="h-5 w-5 text-brand" strokeWidth={1.75} />
					Βιβλιοθήκη
				</Button>
			</div>
			<LanguageToggle />
		</header>

		<!-- Hero -->
		<section class="mb-14 max-w-3xl" data-reveal use:reveal>
			<span
				class="mb-5 inline-block rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase"
			>
				{#if data.user}Καλώς ήρθατε{:else}Ψηφιακές Δεξιότητες{/if}
			</span>
			<h1 class="text-4xl font-extrabold text-foreground sm:text-5xl md:text-[3.5rem] md:leading-[1.05]">
				{messages.app_title()}
			</h1>
			<p class="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">{messages.app_subtitle()}</p>
			{#if data.user}
				<p class="mt-3 text-base text-foreground/70">
					{messages.welcome_user({ displayName: data.user.displayName || data.user.username })}
				</p>
			{/if}
		</section>

		<!-- Module grid, grouped into themed categories -->
		{#snippet moduleCard(module: { id: string; titleKey: string; descriptionKey: string }, num: number)}
			{@const moduleProgress = getProgress(module.id)}
			{@const done = moduleProgress >= 100}
			<a
				href={`/modules/${module.id}`}
				data-reveal
				use:reveal={{ delay: 40 + (num % 4) * 50 }}
				class="group bezel-shell block shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-soft-lg focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none"
			>
				<div class="bezel-core flex h-full flex-col gap-5 p-6 sm:p-7">
					<div class="flex items-start justify-between gap-4">
						<div
							class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold {done
								? 'bg-emerald-500/15 text-emerald-600'
								: 'bg-brand/10 text-brand'}"
						>
							{#if done}
								<Check class="h-6 w-6" strokeWidth={2.5} />
							{:else}
								{num}
							{/if}
						</div>
						<span class="text-sm font-semibold tabular-nums text-muted-foreground">
							{moduleProgress}%
						</span>
					</div>

					<div class="flex-1">
						<h2 class="text-xl font-bold text-foreground sm:text-2xl">
							{messages[module.titleKey] ? messages[module.titleKey]() : module.id}
						</h2>
						<p class="mt-2 line-clamp-2 text-base text-muted-foreground">
							{messages[module.descriptionKey] ? messages[module.descriptionKey]() : ''}
						</p>
					</div>

					<!-- Progress rail -->
					<div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
						<div
							class="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] {done
								? 'bg-emerald-500'
								: 'bg-brand'}"
							style="width: {Math.max(moduleProgress, 2)}%"
						></div>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-base font-semibold text-foreground">{messages.start_module()}</span>
						<span
							class="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105"
						>
							<ArrowRight class="h-5 w-5" strokeWidth={2} />
						</span>
					</div>
				</div>
			</a>
		{/snippet}

		<div class="space-y-12">
			{#each groupedModules as group (group.category?.id)}
				<section data-reveal use:reveal>
					<div class="mb-5 flex items-baseline gap-3">
						<h2 class="text-sm font-semibold tracking-[0.14em] text-brand uppercase">
							{group.category?.title}
						</h2>
						<span class="h-px flex-1 bg-border"></span>
						<span class="text-xs font-medium tabular-nums text-muted-foreground">
							{group.modules.length}
						</span>
					</div>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
						{#each group.modules as module, mi (module.id)}
							{@render moduleCard(module, mi + 1)}
						{/each}
					</div>
				</section>
			{/each}
		</div>

		<div class="mt-12 text-center">
			<Button
				variant="ghost"
				onclick={() => gameState.reset()}
				class="text-sm text-muted-foreground hover:text-foreground"
			>
				{messages.progress_reset()}
			</Button>
		</div>
	</div>
</main>
