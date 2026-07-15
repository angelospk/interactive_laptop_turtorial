<script lang="ts">
	import { gameState } from '$lib/gameStore.svelte';
	import { Button } from '$lib/components/ui/button';
	import LogoutButton from '$lib/components/LogoutButton.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { BookOpen, ArrowRight, Check } from '@lucide/svelte';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Laptop from '@lucide/svelte/icons/laptop';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import TabletSmartphone from '@lucide/svelte/icons/tablet-smartphone';
	import { reveal } from '$lib/actions/reveal';
	import {
		groupModulesByCategory,
		getModuleDevices,
		modulesSpecificToDevice,
		getModuleCompletion,
		type ModuleDevice
	} from '$lib/config/moduleOrganization';
	import DeviceOnboarding from '$lib/components/DeviceOnboarding.svelte';

	// Cast messages to any to avoid indexing errors until types are generated
	const messages = m as any;

	// Get progress from server
	let { data } = $props();

	function getCompletion(moduleId: string) {
		return getModuleCompletion(moduleId, data.moduleLessonIds, data.progress);
	}

	// Group the flat module list into themed categories for easier navigation.
	let groupedModules = $derived(groupModulesByCategory(data.modules ?? []));

	// ── Device-aware prioritisation (ROADMAP Φάση 1) ──────────────────────────
	const DEVICE_META: Record<ModuleDevice, { label: string; icon: typeof Monitor }> = {
		windows: { label: 'Windows', icon: Monitor },
		mac: { label: 'Mac', icon: Laptop },
		android: { label: 'Android', icon: Smartphone },
		iphone: { label: 'iPhone', icon: TabletSmartphone }
	};

	let preferredDevice = $derived((data.user?.preferredDevice ?? null) as ModuleDevice | null);
	// Focused shortlist of modules made specifically for the user's device.
	let deviceModules = $derived(
		preferredDevice ? modulesSpecificToDevice(data.modules ?? [], preferredDevice) : []
	);

	let changeDeviceOpen = $state(false);
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
		{#snippet moduleCard(module: { id: string; titleKey: string; descriptionKey: string | null }, num: number)}
			{@const completion = getCompletion(module.id)}
			{@const moduleProgress = completion.overallPercent}
			{@const done = completion.allComplete}
			{@const baseDone = completion.baseComplete && !completion.allComplete}
			{@const deviceTags = getModuleDevices(module.id)}
			<a
				href={`/modules/${module.id}`}
				data-reveal
				use:reveal={{ delay: 40 + (num % 4) * 50 }}
				class="group bezel-shell block shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-soft-lg focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none"
			>
				<div class="bezel-core flex h-full flex-col gap-5 p-6 sm:p-7">
					<div class="flex items-start justify-between gap-4">
						<div
							class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold {done ||
							baseDone
								? 'bg-emerald-500/15 text-emerald-600'
								: 'bg-brand/10 text-brand'}"
						>
							{#if done || baseDone}
								<Check class="h-6 w-6" strokeWidth={2.5} />
							{:else}
								{num}
							{/if}
						</div>
						<!-- Base-path completion never demotes to a bare «X%» (codex plan review) -->
						{#if baseDone}
							<span class="text-right text-xs font-semibold text-emerald-600">
								<span class="block">Βασική διαδρομή ✓</span>
								{#if completion.extensionCompleted < completion.extensionTotal}
									<span class="block font-medium text-muted-foreground">
										+{completion.extensionCompleted}/{completion.extensionTotal} επιπλέον
									</span>
								{/if}
							</span>
						{:else}
							<span class="text-sm font-semibold tabular-nums text-muted-foreground">
								{moduleProgress}%
							</span>
						{/if}
					</div>

					<div class="flex-1">
						<h2 class="text-xl font-bold text-foreground sm:text-2xl">
							{messages[module.titleKey] ? messages[module.titleKey]() : module.id}
						</h2>
						<p class="mt-2 line-clamp-2 text-base text-muted-foreground">
							{module.descriptionKey && messages[module.descriptionKey]
							? messages[module.descriptionKey]()
							: ''}
						</p>
						{#if deviceTags}
							<div class="mt-3 flex flex-wrap gap-1.5">
								{#each deviceTags as tag (tag)}
									{@const meta = DEVICE_META[tag]}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground"
									>
										<meta.icon class="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
										{meta.label}
									</span>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Progress rail -->
					<div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
						<div
							class="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] {done ||
							baseDone
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

		<!-- "Για τη συσκευή σου" — device-aware prioritisation (not hiding, ROADMAP §1) -->
		{#if preferredDevice}
			{@const dm = DEVICE_META[preferredDevice]}
			<section class="mb-12" data-reveal use:reveal>
				<div class="mb-5 flex flex-wrap items-center gap-3">
					<h2 class="flex items-center gap-2 text-sm font-semibold tracking-[0.14em] text-brand uppercase">
						<dm.icon class="h-4 w-4" strokeWidth={2} aria-hidden="true" />
						Για τη συσκευή σου · {dm.label}
					</h2>
					<span class="h-px flex-1 bg-border"></span>
					<Button
						variant="ghost"
						onclick={() => (changeDeviceOpen = true)}
						class="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
					>
						Αλλαγή συσκευής
					</Button>
				</div>
				{#if deviceModules.length}
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
						{#each deviceModules as module, mi (module.id)}
							{@render moduleCard(module, mi + 1)}
						{/each}
					</div>
				{:else}
					<div class="rounded-2xl border border-dashed border-border bg-secondary/40 p-6 text-base text-muted-foreground">
						Τα ξεχωριστά μαθήματα για <strong>{dm.label}</strong> έρχονται σύντομα. Στο μεταξύ,
						όλα τα μαθήματα πιο κάτω ισχύουν και για τη δική σου συσκευή.
					</div>
				{/if}
			</section>
		{/if}

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

<!-- Change-device modal, opened from the "Για τη συσκευή σου" chip -->
{#if data.user}
	<DeviceOnboarding bind:open={changeDeviceOpen} currentDevice={preferredDevice} dismissable />
{/if}
