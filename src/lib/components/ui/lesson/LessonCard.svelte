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
	import * as m from '$lib/paraglide/messages';

	let { lesson, progress, isLocked, onclick } = $props<{
		lesson: Lesson;
		progress: any;
		isLocked: boolean;
		onclick: () => void;
	}>();

	// Helper to get message safely
	function getMessage(key: string) {
		// @ts-ignore - Dynamic access to messages
		return m[key]?.() || key;
	}
</script>

<button
	class="w-full text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
	{onclick}
	disabled={isLocked}
>
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
				<Badge variant={isLocked ? 'outline' : 'secondary'} class="capitalize">
					{lesson.difficulty}
				</Badge>

				{#if progress?.completed && progress.score}
					<div class="flex items-center gap-1 text-sm font-medium text-amber-600">
						<span>{progress.score}%</span>
						<Star class="h-3 w-3 fill-amber-600" />
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
</button>
