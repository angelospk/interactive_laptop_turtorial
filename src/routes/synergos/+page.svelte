<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import { ArrowLeft, Check, Printer, Sparkles } from '@lucide/svelte';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Laptop from '@lucide/svelte/icons/laptop';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import TabletSmartphone from '@lucide/svelte/icons/tablet-smartphone';
	import {
		groupModulesByCategory,
		getModuleCompletion,
		type ModuleDevice
	} from '$lib/config/moduleOrganization';

	// Cast messages to any — same pattern as the home page (keys are dynamic).
	const messages = m as any;

	let { data } = $props();

	const DEVICE_META: Record<ModuleDevice, { label: string; icon: typeof Monitor }> = {
		windows: { label: 'Windows υπολογιστής', icon: Monitor },
		mac: { label: 'Mac υπολογιστής', icon: Laptop },
		android: { label: 'Android κινητό', icon: Smartphone },
		iphone: { label: 'iPhone', icon: TabletSmartphone }
	};

	let preferredDevice = $derived((data.user?.preferredDevice ?? null) as ModuleDevice | null);
	let learnerName = $derived(data.user?.displayName || data.user?.username || '');
	let groupedModules = $derived(groupModulesByCategory(data.modules ?? []));
	let progress = $derived((data.progress ?? {}) as Record<string, { completed?: boolean }>);

	function getCompletion(moduleId: string) {
		return getModuleCompletion(moduleId, data.moduleLessonIds, progress);
	}

	function lessonTitle(titleKey: string, lessonKey: string) {
		return messages[titleKey] ? messages[titleKey]() : lessonKey;
	}

	/** First unfinished lesson of a module (by order), or null when all done. */
	function nextLesson(moduleId: string) {
		const lessons = data.moduleLessonMeta?.[moduleId] ?? [];
		return lessons.find((l) => !progress[l.id]?.completed) ?? null;
	}

	// Overall summary across every enabled lesson.
	let totals = $derived.by(() => {
		let total = 0;
		let completed = 0;
		for (const ids of Object.values(data.moduleLessonIds ?? {}) as string[][]) {
			total += ids.length;
			completed += ids.filter((id) => progress[id]?.completed).length;
		}
		return { total, completed };
	});
</script>

<svelte:head>
	<title>Ο συνεργάτης μου — Πρόοδος</title>
</svelte:head>

<main class="relative min-h-[100dvh] overflow-hidden bg-background">
	<div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
		<div
			class="absolute -top-40 left-1/4 h-[32rem] w-[32rem] rounded-full opacity-40 blur-3xl"
			style="background: radial-gradient(circle, oklch(0.88 0.07 264 / 0.5), transparent 70%);"
		></div>
	</div>

	<div class="relative mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-10">
		<!-- Header (hidden on paper) -->
		<header class="mb-10 flex flex-wrap items-center justify-between gap-3 print:hidden">
			<Button variant="outline" href="/" class="shadow-soft h-11 gap-2 rounded-full px-5 text-base">
				<ArrowLeft class="h-5 w-5" strokeWidth={1.75} />
				Πίσω στην αρχική
			</Button>
			<Button
				variant="outline"
				onclick={() => window.print()}
				class="shadow-soft h-11 gap-2 rounded-full px-5 text-base"
			>
				<Printer class="h-5 w-5 text-brand" strokeWidth={1.75} />
				Εκτύπωση
			</Button>
		</header>

		<!-- Greeting + summary -->
		<section class="mb-10">
			<span
				class="mb-4 inline-block rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase"
			>
				Για τον βοηθό
			</span>
			<h1 class="text-3xl font-extrabold text-foreground sm:text-4xl">
				Η πρόοδος {learnerName ? `του/της ${learnerName}` : 'του μαθητή'}
			</h1>
			<p class="mt-3 max-w-2xl text-lg text-muted-foreground">
				Αυτή η σελίδα δείχνει πού βρίσκεται στα μαθήματα και τι αξίζει να εξασκήσετε μαζί. Είναι
				μόνο για ανάγνωση — δεν αλλάζει τίποτα.
			</p>
			<div class="mt-5 flex flex-wrap items-center gap-3">
				<span
					class="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-base font-semibold text-foreground"
				>
					Έχει ολοκληρώσει {totals.completed} από {totals.total} μαθήματα
				</span>
				{#if preferredDevice}
					{@const dm = DEVICE_META[preferredDevice]}
					<span
						class="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-base font-medium text-muted-foreground"
					>
						<dm.icon class="h-5 w-5" strokeWidth={2} aria-hidden="true" />
						Μαθαίνει σε: {dm.label}
					</span>
				{/if}
			</div>
		</section>

		<!-- Per-category progress -->
		<div class="space-y-10">
			{#each groupedModules as group (group.category?.id)}
				<section class="break-inside-avoid">
					<div class="mb-4 flex items-baseline gap-3">
						<h2 class="text-sm font-semibold tracking-[0.14em] text-brand uppercase">
							{group.category?.title}
						</h2>
						<span class="h-px flex-1 bg-border"></span>
					</div>
					<div class="space-y-4">
						{#each group.modules as module (module.id)}
							{@const completion = getCompletion(module.id)}
							{@const next = nextLesson(module.id)}
							<div class="bezel-shell shadow-soft break-inside-avoid">
								<div class="bezel-core flex flex-col gap-4 p-5 sm:p-6">
									<div class="flex flex-wrap items-center justify-between gap-3">
										<h3 class="text-xl font-bold text-foreground">
											{messages[module.titleKey] ? messages[module.titleKey]() : module.id}
										</h3>
										<div class="flex items-center gap-3">
											{#if completion.hasBase}
												<span
													class="text-sm font-semibold {completion.baseComplete
														? 'text-emerald-600'
														: 'text-muted-foreground'}"
												>
													Βασική διαδρομή {completion.baseComplete ? '✓' : '…'}
												</span>
											{/if}
											<span class="text-base font-semibold text-muted-foreground tabular-nums">
												{completion.overallPercent}%
											</span>
										</div>
									</div>

									<!-- Progress rail -->
									<div class="h-3 w-full overflow-hidden rounded-full bg-secondary">
										<div
											class="h-full rounded-full {completion.allComplete || completion.baseComplete
												? 'bg-emerald-500'
												: 'bg-brand'}"
											style="width: {Math.max(completion.overallPercent, 2)}%"
										></div>
									</div>

									{#if completion.allComplete}
										<p class="flex items-center gap-2 text-base font-medium text-emerald-600">
											<Check class="h-5 w-5" strokeWidth={2.5} />
											Ολοκληρώθηκε όλη η ενότητα — μπράβο!
										</p>
									{:else if next}
										<p class="flex flex-wrap items-center gap-2 text-base text-foreground">
											<Sparkles class="h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
											<span class="font-semibold">Τι να εξασκήσετε μαζί:</span>
											<a
												href={`/modules/${module.id}/${encodeURIComponent(next.lessonKey)}`}
												class="font-medium text-brand underline underline-offset-4 hover:text-brand/80"
											>
												{lessonTitle(next.titleKey, next.lessonKey)}
											</a>
										</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>

		<p class="mt-12 text-center text-sm text-muted-foreground print:mt-6">
			Σελίδα βοηθού — μόνο για ανάγνωση. Η πρόοδος καταγράφεται μέσα από τα μαθήματα.
		</p>
	</div>
</main>

<style>
	@media print {
		main {
			background: white;
		}
	}
</style>
