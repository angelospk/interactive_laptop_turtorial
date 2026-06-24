<script lang="ts">
	import { Lock, CheckCircle2, Star, ArrowRight } from '@lucide/svelte';
	import type { Lesson } from '$lib/db/schema';
	import * as m from '$lib/paraglide/messages.js';

	let { lesson, progress, isLocked, onclick, href } = $props<{
		lesson: Lesson;
		progress: any;
		isLocked: boolean;
		onclick?: (e?: Event) => void;
		/** When provided (and not locked) the card renders as a real link for deep-linking. */
		href?: string;
	}>();

	// Helper to get message safely
	function getMessage(key: string) {
		// @ts-ignore - Dynamic access to messages
		return m[key]?.() || key;
	}

	// Shared visual style for both the link and the disabled-button variants.
	const wrapperClass =
		'bezel-shell group block w-full text-left shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-soft';
</script>

{#snippet cardBody()}
	<div
		class="bezel-core flex h-full flex-col gap-4 p-6 {progress?.completed
			? 'ring-1 ring-emerald-500/20'
			: ''}"
	>
		<div class="flex items-start justify-between gap-3">
			<h3 class="text-lg font-bold text-foreground">{getMessage(lesson.titleKey)}</h3>
			{#if isLocked}
				<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
					<Lock class="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
				</span>
			{:else if progress?.completed}
				<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
					<CheckCircle2 class="h-5 w-5 text-emerald-600" strokeWidth={2} />
				</span>
			{/if}
		</div>

		<p class="line-clamp-2 flex-1 text-base text-muted-foreground">
			{getMessage(lesson.descriptionKey)}
		</p>

		<div class="flex items-center justify-between gap-2">
			<div class="flex flex-wrap items-center gap-2">
				{#if lesson.lessonType === 'reading'}
					<span
						class="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand"
					>
						📖 Θεωρία
					</span>
				{/if}
				<span
					class="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground capitalize"
				>
					{lesson.difficulty}
				</span>
			</div>

			{#if progress?.completed && progress.score}
				<div class="flex items-center gap-1 text-sm font-semibold text-amber-500">
					<span class="tabular-nums">{progress.score}%</span>
					<Star class="h-3.5 w-3.5 fill-amber-500" strokeWidth={0} />
				</div>
			{:else if !isLocked}
				<span
					class="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105"
				>
					<ArrowRight class="h-4 w-4" strokeWidth={2} />
				</span>
			{/if}
		</div>
	</div>
{/snippet}

{#if href && !isLocked}
	<a {href} class={wrapperClass} onclick={(e) => onclick?.(e)} data-sveltekit-preload-data="hover">
		{@render cardBody()}
	</a>
{:else}
	<button class={wrapperClass} onclick={(e) => onclick?.(e)} disabled={isLocked}>
		{@render cardBody()}
	</button>
{/if}
