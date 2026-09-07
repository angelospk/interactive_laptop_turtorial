<script lang="ts">
	// «Για τον βοηθό μου» — the page a relative opens, once, on a phone, standing
	// next to the learner.
	//
	// It used to lead with reporting: a greeting, a completion count, a device
	// summary, then eleven module cards each with a percentage, a bar, a
	// "βασική διαδρομή ✓/…" marker and its own suggested lesson. That is a page
	// that makes the helper choose, when the helper has thirty seconds and one
	// question: what do I do with them right now.
	//
	// So: one activity, one instruction, one button. The whole progress report
	// is still here, folded away under it, for whoever actually wants it.

	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import { ArrowLeft, Check, Printer } from '@lucide/svelte';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Laptop from '@lucide/svelte/icons/laptop';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import TabletSmartphone from '@lucide/svelte/icons/tablet-smartphone';
	import {
		groupModulesByCategory,
		getModuleCompletion,
		type ModuleDevice
	} from '$lib/config/moduleOrganization';
	import { countProgress, pickTogetherActivity } from '$lib/together';

	const messages = m as any;

	let { data } = $props();

	const DEVICE_META: Record<ModuleDevice, { label: string; icon: typeof Monitor }> = {
		windows: { label: 'Windows υπολογιστή', icon: Monitor },
		mac: { label: 'Mac υπολογιστή', icon: Laptop },
		android: { label: 'Android κινητό', icon: Smartphone },
		iphone: { label: 'iPhone', icon: TabletSmartphone }
	};

	let preferredDevice = $derived((data.user?.preferredDevice ?? null) as ModuleDevice | null);
	let learnerName = $derived(data.user?.displayName || data.user?.username || '');
	let groupedModules = $derived(groupModulesByCategory(data.modules ?? []));
	let progress = $derived((data.progress ?? {}) as Record<string, { completed?: boolean }>);
	let lessonsByModule = $derived(data.moduleLessonMeta ?? {});

	let totals = $derived(countProgress(lessonsByModule, progress));

	let activity = $derived(
		pickTogetherActivity(
			(data.modules ?? []).map((mod: { id: string }) => mod.id),
			lessonsByModule,
			progress,
			preferredDevice
		)
	);

	function lessonTitle(titleKey: string, lessonKey: string) {
		return messages[titleKey] ? messages[titleKey]() : lessonKey;
	}

	function getCompletion(moduleId: string) {
		return getModuleCompletion(moduleId, data.moduleLessonIds, progress);
	}

	let showAll = $state(false);
</script>

<svelte:head>
	<title>Για τον βοηθό μου</title>
</svelte:head>

<main class="min-h-[100dvh] bg-background">
	<div class="mx-auto max-w-2xl px-4 py-6 sm:px-6 md:py-10">
		<header class="mb-8 print:hidden">
			<Button variant="outline" href="/" class="shadow-soft h-12 gap-2 rounded-full px-5 text-base">
				<ArrowLeft class="h-5 w-5" strokeWidth={1.75} />
				Πίσω στην αρχική
			</Button>
		</header>

		<h1 class="text-3xl font-extrabold text-foreground sm:text-4xl">Για τον βοηθό μου</h1>
		<p class="mt-3 text-lg text-muted-foreground">
			{#if learnerName}
				Αυτή η σελίδα είναι για όποιον κάθεται δίπλα {learnerName ? `στον/στην ${learnerName}` : ''}.
			{:else}
				Αυτή η σελίδα είναι για όποιον κάθεται δίπλα στον μαθητή.
			{/if}
			Δεν αλλάζει τίποτα, μόνο δείχνει.
		</p>

		<!-- The answer to the only question a helper actually arrives with. -->
		{#if activity}
			<section class="mt-8 rounded-3xl border-2 border-brand/25 bg-brand/[0.05] p-6 sm:p-8">
				<h2 class="text-2xl font-bold text-foreground sm:text-3xl">Τι να κάνετε μαζί τώρα</h2>

				<p class="mt-4 text-xl font-semibold text-foreground sm:text-2xl">
					{lessonTitle(activity.lesson.titleKey, activity.lesson.lessonKey)}
				</p>
				<p class="mt-1 text-base text-muted-foreground">
					{#if activity.isReview}
						Τα έχει τελειώσει όλα. Αυτό αξίζει να το ξανακάνετε μαζί.
					{:else if preferredDevice}
						Στο {DEVICE_META[preferredDevice].label} · περίπου 5 λεπτά
					{:else}
						Περίπου 5 λεπτά
					{/if}
				</p>

				<!-- One coaching sentence. The commonest failure of a helper is doing
				     it for them, and it costs nothing to say so here. -->
				<p class="mt-5 text-base text-foreground/85">
					Αφήστε τον/την να κάνει τα βήματα. Βοηθήστε μόνο όταν κολλήσει, και με λόγια πριν με το
					χέρι.
				</p>

				<Button
					href={`/modules/${activity.moduleId}/${encodeURIComponent(activity.lesson.lessonKey)}`}
					class="shadow-soft mt-6 h-14 w-full justify-center rounded-2xl text-lg print:hidden"
					data-testid="together-open"
				>
					Δείτε τα βήματα
				</Button>
			</section>
		{/if}

		<!-- One sentence of reporting, not a dashboard. -->
		<p class="mt-8 text-lg text-foreground">
			Έχει ολοκληρώσει <strong>{totals.completed}</strong> από {totals.total} μαθήματα.
		</p>

		<div class="mt-4 flex flex-wrap gap-3 print:hidden">
			<Button
				variant="outline"
				onclick={() => (showAll = !showAll)}
				aria-expanded={showAll}
				class="h-12 rounded-full px-5 text-base"
				data-testid="toggle-all-progress"
			>
				{showAll ? 'Κλείσιμο' : 'Όλη η πρόοδος'}
			</Button>
			{#if showAll}
				<Button
					variant="outline"
					onclick={() => window.print()}
					class="h-12 gap-2 rounded-full px-5 text-base"
				>
					<Printer class="h-5 w-5" strokeWidth={1.75} />
					Εκτύπωση
				</Button>
			{/if}
		</div>

		<!-- Everything the old page led with, now behind a button. Printing opens
		     it too, so a printed page is still the full report. -->
		<div class="mt-8 space-y-10 {showAll ? '' : 'hidden print:block'}">
			{#each groupedModules as group (group.category?.id)}
				<section class="break-inside-avoid">
					<h2 class="mb-4 text-xl font-bold text-foreground sm:text-2xl">
						{group.category?.title}
					</h2>
					<div class="space-y-3">
						{#each group.modules as module (module.id)}
							{@const completion = getCompletion(module.id)}
							<div
								class="break-inside-avoid rounded-2xl border border-border p-4 sm:p-5"
							>
								<div class="flex flex-wrap items-baseline justify-between gap-2">
									<h3 class="text-lg font-semibold text-foreground">
										{messages[module.titleKey] ? messages[module.titleKey]() : module.id}
									</h3>
									<span class="text-base font-semibold text-muted-foreground tabular-nums">
										{completion.overallPercent}%
									</span>
								</div>
								<div class="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
									<div
										class="h-full rounded-full {completion.allComplete || completion.baseComplete
											? 'bg-emerald-500'
											: 'bg-brand'}"
										style="width: {Math.max(completion.overallPercent, 2)}%"
									></div>
								</div>
								{#if completion.allComplete}
									<p class="mt-3 flex items-center gap-2 text-base text-emerald-600">
										<Check class="h-5 w-5 shrink-0" strokeWidth={2.5} />
										Ολοκληρώθηκε
									</p>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</div>
</main>

<style>
	@media print {
		main {
			background: white;
		}
	}
</style>
