<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { Lesson } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import LessonRenderer from './LessonRenderer.svelte';
	import * as m from '$lib/paraglide/messages';

	let {
		lessons,
		progress,
		startIndex = 0,
		onExit
	} = $props<{
		lessons: Lesson[];
		progress: Record<string, any>;
		startIndex?: number;
		onExit?: () => void;
	}>();

	let currentLessonIndex = $state(startIndex);
	let currentLesson = $derived(lessons[currentLessonIndex]);

	// Optimistic UI state
	let localUpdates = $state<Record<string, any>>({});

	// Merge prop progress with local updates
	let mergedProgress = $derived({ ...progress, ...localUpdates });

	// Determine if current lesson is locked
	let isLocked = $derived.by(() => {
		if (currentLessonIndex === 0 && !currentLesson.requiredLessonId) return false;

		// Check required lesson if specified
		if (currentLesson.requiredLessonId) {
			const requiredProgress = mergedProgress[currentLesson.requiredLessonId];
			return !requiredProgress?.completed;
		}

		// Fallback: Check if previous lesson in the list is completed
		if (currentLessonIndex > 0) {
			const prevLesson = lessons[currentLessonIndex - 1];
			const prevProgress = mergedProgress[prevLesson.id];
			return !prevProgress?.completed;
		}

		return false;
	});

	async function handleLessonComplete(score: number) {
		// Optimistically update UI immediately
		localUpdates[currentLesson.id] = {
			completed: true,
			score,
			stars: score <= 33 ? 1 : score <= 66 ? 2 : 3, // Estimate stars
			completedAt: new Date().toISOString()
		};

		// Save progress using the new API endpoint
		const res = await fetch('/api/lessons/complete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				lessonId: currentLesson.id,
				score
			})
		});

		if (res.ok) {
			const data = await res.json();
			// Update with actual server response if needed, or just rely on invalidateAll
			if (data.progress) {
				localUpdates[currentLesson.id] = data.progress;
			}
			await invalidateAll(); // Refresh data to get updated progress
		} else {
			// Revert optimistic update on failure
			const { [currentLesson.id]: _, ...rest } = localUpdates;
			localUpdates = rest;
			console.error('Failed to save progress');
		}
	}

	function nextLesson() {
		if (currentLessonIndex < lessons.length - 1) {
			currentLessonIndex++;
		} else if (onExit) {
			onExit();
		}
	}

	function prevLesson() {
		if (currentLessonIndex > 0) {
			currentLessonIndex--;
		}
	}

	function handleBack() {
		if (onExit) {
			onExit();
		}
	}

	// Helper to get message safely
	function getMessage(key: string) {
		// @ts-ignore - Dynamic access to messages
		return m[key]?.() || key;
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<Button variant="outline" onclick={prevLesson} disabled={currentLessonIndex === 0}>
			Προηγούμενο
		</Button>
		<span class="text-sm font-medium text-slate-500">
			Μάθημα {currentLessonIndex + 1} από {lessons.length}
		</span>
		<Button
			onclick={nextLesson}
			disabled={currentLessonIndex === lessons.length - 1 && !onExit
				? true
				: !mergedProgress[currentLesson.id]?.completed}
		>
			{currentLessonIndex === lessons.length - 1 ? 'Λήξη' : 'Επόμενο'}
		</Button>
	</div>

	<Card>
		<CardContent>
			{#if isLocked}
				<div class="flex h-64 items-center justify-center rounded-md bg-slate-100 text-slate-500">
					<div class="text-center">
						<span class="text-4xl">🔒</span>
						<p class="mt-2">Ολοκλήρωσε το προηγούμενο μάθημα για να το ξεκλειδώσεις.</p>
					</div>
				</div>
			{:else}
				<!-- Use the new LessonRenderer component -->
				<LessonRenderer
					lesson={currentLesson}
					onComplete={handleLessonComplete}
					onBack={handleBack}
				/>
			{/if}
		</CardContent>
	</Card>

	{#if mergedProgress[currentLesson.id]?.completed}
		<div
			class="fixed right-0 bottom-0 left-0 z-50 flex animate-in items-center justify-between border-t border-green-200 bg-green-50 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] duration-500 slide-in-from-bottom-full"
		>
			<div class="flex items-center gap-4">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"
				>
					<span class="text-2xl">✓</span>
				</div>
				<div>
					<h3 class="text-lg font-bold text-green-800">{getMessage('lesson_completed')}</h3>
					{#if mergedProgress[currentLesson.id]?.score}
						<p class="text-sm text-green-700">
							{getMessage('score')}: {mergedProgress[currentLesson.id].score}
						</p>
					{/if}
				</div>
			</div>

			<div class="flex items-center gap-3">
				<Button
					variant="ghost"
					onclick={() => (localUpdates[currentLesson.id].completed = false)}
					class="text-green-700 hover:bg-green-100 hover:text-green-900"
				>
					{getMessage('back') || 'Close'}
				</Button>

				{#if currentLessonIndex < lessons.length - 1}
					<Button
						size="lg"
						onclick={nextLesson}
						class="gap-2 bg-green-600 text-white shadow-md hover:bg-green-700"
					>
						{getMessage('next_lesson') || 'Next Lesson'}
						<span class="text-xl">→</span>
					</Button>
				{:else}
					<Button
						size="lg"
						onclick={onExit}
						variant="outline"
						class="gap-2 border-green-200 bg-white text-green-700 hover:bg-green-50"
					>
						{getMessage('back_to_modules') || 'Back to Modules'}
					</Button>
				{/if}
			</div>
		</div>
	{/if}
</div>
