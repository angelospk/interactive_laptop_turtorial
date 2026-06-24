<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Lock, CheckCircle, Star } from '@lucide/svelte';
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
		'block w-full text-left transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100';
</script>

{#snippet cardBody()}
	<Card
		class="h-full overflow-hidden {progress?.completed
			? 'border-green-200 bg-green-50'
			: ''} {isLocked ? 'bg-slate-50' : ''}"
	>
		<CardHeader class="pb-2">
			<div class="flex items-start justify-between">
				<CardTitle class="text-lg">{getMessage(lesson.titleKey)}</CardTitle>
				{#if isLocked}
					<Lock class="h-5 w-5 text-slate-400" />
				{:else if progress?.completed}
					<CheckCircle class="h-5 w-5 text-green-600" />
				{/if}
			</div>
			<CardDescription class="line-clamp-2">{getMessage(lesson.descriptionKey)}</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					{#if lesson.lessonType === 'reading'}
						<Badge class="border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100">
							📖 Θεωρία
						</Badge>
					{/if}
					<Badge variant={isLocked ? 'outline' : 'secondary'} class="capitalize">
						{lesson.difficulty}
					</Badge>
				</div>

				{#if progress?.completed && progress.score}
					<div class="flex items-center gap-1 text-sm font-medium text-amber-600">
						<span>{progress.score}%</span>
						<Star class="h-3 w-3 fill-amber-600" />
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
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
