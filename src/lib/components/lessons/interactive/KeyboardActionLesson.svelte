<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';
	import { CheckCircle } from '@lucide/svelte';

	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	// Parse config
	const config = lesson.config as {
		action?: string;
		shortcuts?: string[];
		keys?: string[];
		repetitions?: number;
	};

	// State
	let currentStep = $state(0);
	let completed = $state(false);
	let lastPressed = $state('');
	let steps = $state<{ label: string; keys: string[]; completed: boolean }[]>([]);

	// Initialize steps based on config
	$effect(() => {
		if (steps.length > 0) return;

		if (config.action === 'language-switch') {
			const reps = config.repetitions || 3;
			for (let i = 0; i < reps; i++) {
				steps.push({
					label: 'Alt + Shift',
					keys: ['Alt', 'Shift'],
					completed: false
				});
			}
		} else if (config.shortcuts) {
			const shortcutMap: Record<string, { label: string; keys: string[] }> = {
				copy: { label: 'Ctrl + C', keys: ['Control', 'c'] },
				paste: { label: 'Ctrl + V', keys: ['Control', 'v'] },
				cut: { label: 'Ctrl + X', keys: ['Control', 'x'] },
				undo: { label: 'Ctrl + Z', keys: ['Control', 'z'] },
				redo: { label: 'Ctrl + Y', keys: ['Control', 'y'] }
			};

			config.shortcuts.forEach((s) => {
				if (shortcutMap[s]) {
					steps.push({ ...shortcutMap[s], completed: false });
				}
			});
		} else if (config.keys) {
			config.keys.forEach((k) => {
				steps.push({
					label: k,
					keys: [k],
					completed: false
				});
			});
		}
	});

	let currentTarget = $derived(steps[currentStep]);

	function handleKeydown(e: KeyboardEvent) {
		if (completed || !currentTarget) return;

		// Normalize keys
		const pressedKeys = new Set<string>();
		if (e.ctrlKey) pressedKeys.add('Control');
		if (e.altKey) pressedKeys.add('Alt');
		if (e.shiftKey) pressedKeys.add('Shift');
		if (e.metaKey) pressedKeys.add('Meta');

		// Add the main key if it's not a modifier
		if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
			pressedKeys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
		}

		// Update display
		lastPressed = Array.from(pressedKeys).join(' + ');

		// Check match
		const requiredKeys = currentTarget.keys.map((k) => k.toLowerCase());
		const allMatch = requiredKeys.every((k) => {
			if (k === 'control') return e.ctrlKey;
			if (k === 'alt') return e.altKey;
			if (k === 'shift') return e.shiftKey;
			return pressedKeys.has(k);
		});

		// For language switch (Alt+Shift), we need to be careful as it might not fire standard keydown in some browsers/OS
		// But usually it fires Alt then Shift
		if (config.action === 'language-switch') {
			// Special handling for Alt+Shift
			if (e.altKey && e.shiftKey) {
				completeStep();
			}
		} else if (allMatch) {
			e.preventDefault(); // Prevent browser action (like save or print)
			completeStep();
		}
	}

	function completeStep() {
		steps[currentStep].completed = true;
		toast.success(m.good_effort ? m.good_effort() : 'Good!');

		if (currentStep < steps.length - 1) {
			currentStep++;
			lastPressed = '';
		} else {
			completed = true;
			toast.success(m.perfect ? m.perfect() : 'Perfect!');
			setTimeout(() => {
				onComplete(100);
			}, 1500);
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="keyboard-lesson mx-auto max-w-3xl">
		<div
			class="instruction-card mb-8 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
		>
			<h3 class="mb-4 text-xl font-medium text-slate-900">
				{m.lesson_instructions ? m.lesson_instructions() : 'Instructions'}
			</h3>

			{#if !completed}
				<div class="current-task py-8">
					<p class="mb-4 text-lg text-slate-500">Press the following keys:</p>
					<div class="key-display mb-4 animate-pulse text-5xl font-bold text-primary">
						{currentTarget?.label}
					</div>
					{#if lastPressed}
						<div class="mt-4 text-sm text-slate-400">
							Detected: <span class="rounded bg-slate-100 px-2 py-1 font-mono">{lastPressed}</span>
						</div>
					{/if}
				</div>
			{:else}
				<div class="completion-message py-8 text-green-600">
					<CheckCircle class="mx-auto mb-4 h-16 w-16" />
					<h2 class="text-3xl font-bold">Lesson Completed!</h2>
				</div>
			{/if}
		</div>

		<div class="progress-steps grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each steps as step, i}
				<div
					class="step-item flex items-center justify-between rounded-lg border p-4 transition-all duration-300
					{step.completed
						? 'border-green-200 bg-green-50'
						: i === currentStep
							? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100'
							: 'border-slate-200 bg-slate-50 opacity-60'}"
				>
					<span
						class="font-mono text-lg font-bold {step.completed
							? 'text-green-700'
							: 'text-slate-700'}"
					>
						{step.label}
					</span>
					{#if step.completed}
						<CheckCircle class="h-6 w-6 text-green-500" />
					{/if}
				</div>
			{/each}
		</div>
	</div>
</LessonTemplate>

<style>
	.keyboard-lesson {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 60vh;
	}
</style>
