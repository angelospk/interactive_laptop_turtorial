<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	import { CheckCircle } from '@lucide/svelte';
	import { page } from '$app/state';
	import { matchesStep, shortcutSteps } from '$lib/lessons/shortcuts';

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

	// The learner told us which device they are learning during onboarding, and it
	// travels in the session, so it is available during SSR too — no flash of
	// Windows shortcuts before hydration.
	const device = $derived(
		(page.data?.user?.preferredDevice ?? null) as import('$lib/lessons/shortcuts').LearnerDevice
	);

	// State
	let currentStep = $state(0);
	let completed = $state(false);
	let lastPressed = $state('');
	let completedSteps = $state<boolean[]>([]);
	let completionTimer: number | null = null;

	// Steps follow the chosen device, so they are derived, not pushed once into
	// state: the labels would otherwise be frozen at whatever the first render
	// guessed. Completion is tracked alongside, by index.
	const baseSteps = $derived.by<
		{ label: string; keys: string[]; macKeys?: string[]; description?: string }[]
	>(() => {
		if (config.action === 'language-switch') {
			const reps = config.repetitions || 3;
			// Alt+Shift is the Windows chord; a Mac switches language with
			// Control+Space, so the step comes from the shared action table.
			const [step] = shortcutSteps(['language-switch'], device);
			return Array.from({ length: reps }, () => ({
				label: step.label,
				keys: step.keys,
				macKeys: step.macKeys
			}));
		}
		if (config.shortcuts) return shortcutSteps(config.shortcuts, device);
		if (config.keys) return config.keys.map((k) => ({ label: k, keys: [k] }));
		return [];
	});

	const steps = $derived(
		baseSteps.map((step, i) => ({ ...step, completed: completedSteps[i] === true }))
	);

	let currentTarget = $derived(steps[currentStep]);

	// Detect if F-keys are present to show Mac warning
	let showMacWarning = $derived(config.keys?.some((k) => k.startsWith('F')));

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

		// The Windows chord (Alt+Shift) may arrive as two separate presses, so
		// accept it as soon as both are held; other platforms use a normal chord.
		if (config.action === 'language-switch') {
			const wantsAltShift =
				currentTarget.keys.includes('alt') && currentTarget.keys.includes('shift');
			if ((wantsAltShift && e.altKey && e.shiftKey) || matchesStep(e, currentTarget, device)) {
				completeStep();
			}
			return;
		}

		if (matchesStep(e, currentTarget, device)) {
			e.preventDefault(); // Prevent browser action (like save or print)
			completeStep();
		}
	}

	function completeStep() {
		completedSteps[currentStep] = true;
		toast.success(m.good_effort ? m.good_effort() : 'Good!');

		if (currentStep < steps.length - 1) {
			currentStep++;
			lastPressed = '';
		} else {
			completed = true;
			toast.success(m.perfect ? m.perfect() : 'Perfect!');
			completionTimer = window.setTimeout(() => {
				completionTimer = null;
				onComplete(100);
			}, 1500);
		}
	}

	onMount(() => {
		return () => {
			// A result that lands after the learner has moved on belongs to nobody.
			if (completionTimer !== null) clearTimeout(completionTimer);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

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
					<p class="mb-4 text-lg text-slate-500">Πάτησε τα εξής πλήκτρα:</p>
					<div class="key-display mb-2 animate-pulse text-5xl font-bold text-primary">
						{currentTarget?.label}
					</div>
					{#if (currentTarget as any)?.description}
						<div class="mb-4 text-xl font-medium text-slate-600">
							{(currentTarget as any).description}
						</div>
					{/if}

					{#if showMacWarning}
						<div
							class="mx-auto mt-4 max-w-md rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800"
						>
							<span class="font-bold">Σε Mac:</span> ίσως χρειαστεί να κρατάς πατημένο το
							<span class="rounded bg-yellow-100 px-1 font-mono">Fn</span> όσο πατάς τα F-πλήκτρα (π.χ.
							Fn + F1).
						</div>
					{/if}

					{#if lastPressed}
						<div class="mt-4 text-sm text-slate-400">
							Πάτησες: <span class="rounded bg-slate-100 px-2 py-1 font-mono">{lastPressed}</span>
						</div>
					{/if}
				</div>
			{:else}
				<div class="completion-message py-8 text-green-600">
					<CheckCircle class="mx-auto mb-4 h-16 w-16" />
					<h2 class="text-3xl font-bold">{m.lesson_complete?.() || 'Ολοκληρώθηκε'}!</h2>
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
