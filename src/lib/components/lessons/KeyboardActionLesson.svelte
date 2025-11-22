<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';

	let { lesson, onComplete } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
	}>();

	let config = $derived(
		(lesson.config as { action?: string; shortcuts?: string[]; keys?: string[] }) || {}
	);

	let completedKeys = $state(new Set<string>());

	// Reset state when lesson changes
	$effect(() => {
		// Access config to trigger reactivity
		const _ = config;
		completedKeys = new Set();
	});

	function handleKeyDown(e: KeyboardEvent) {
		// Special case for language switch (Alt+Shift)
		if (config.action === 'language-switch') {
			if ((e.altKey && e.shiftKey) || (e.metaKey && e.code === 'Space')) {
				toast.success('Language Switched!');
				onComplete(100);
				return;
			}
		}

		// Check for shortcuts like "Ctrl+C"
		if (config.shortcuts) {
			// Map "copy" to "Ctrl+C" or "Cmd+C"
			const shortcutMap: Record<string, string> = {
				copy: 'c',
				paste: 'v',
				cut: 'x',
				undo: 'z',
				redo: 'y'
			};

			config.shortcuts.forEach((s) => {
				const char = shortcutMap[s];
				if (char && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === char) {
					// Prevent default browser action for some shortcuts to avoid closing tab etc (though copy/paste is usually fine)
					e.preventDefault();
					if (!completedKeys.has(s)) {
						completedKeys.add(s);
						// Force update set
						completedKeys = new Set(completedKeys);
						toast.success(`Shortcut ${s} detected!`);
						checkCompletion();
					}
				}
			});
		}

		// Check for single keys like "F1"
		if (config.keys) {
			if (config.keys.includes(e.key)) {
				e.preventDefault(); // Prevent F1 help etc
				if (!completedKeys.has(e.key)) {
					completedKeys.add(e.key);
					// Force update set
					completedKeys = new Set(completedKeys);
					toast.success(`Key ${e.key} pressed!`);
					checkCompletion();
				}
			}
		}
	}

	function checkCompletion() {
		if (config.shortcuts && completedKeys.size === config.shortcuts.length) {
			onComplete(100);
		} else if (config.keys && completedKeys.size === config.keys.length) {
			onComplete(100);
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="flex flex-col items-center gap-6 rounded-md border border-slate-200 bg-slate-50 p-8">
	<div class="text-center">
		<p class="mb-4 text-lg font-medium text-slate-700">
			{#if config.action === 'language-switch'}
				Press Alt + Shift (or Win + Space) to switch language.
			{:else if config.shortcuts}
				Perform the following shortcuts:
			{:else if config.keys}
				Press the following keys:
			{/if}
		</p>
	</div>

	<div class="flex flex-wrap justify-center gap-4">
		{#if config.shortcuts}
			{#each config.shortcuts as s}
				<div
					class="rounded border-2 p-4 transition-colors duration-300"
					class:bg-green-100={completedKeys.has(s)}
					class:border-green-500={completedKeys.has(s)}
					class:bg-white={!completedKeys.has(s)}
					class:border-slate-300={!completedKeys.has(s)}
				>
					<span class="font-bold capitalize">{s}</span>
					{#if completedKeys.has(s)}
						<span class="ml-2 text-green-600">✓</span>
					{/if}
				</div>
			{/each}
		{:else if config.keys}
			{#each config.keys as k}
				<div
					class="min-w-[60px] rounded border-2 p-4 text-center transition-colors duration-300"
					class:bg-green-100={completedKeys.has(k)}
					class:border-green-500={completedKeys.has(k)}
					class:bg-white={!completedKeys.has(k)}
					class:border-slate-300={!completedKeys.has(k)}
				>
					<span class="font-bold">{k}</span>
				</div>
			{/each}
		{:else if config.action === 'language-switch'}
			<div class="rounded border border-slate-300 bg-white p-6 shadow-sm">
				<span class="text-4xl">🌐</span>
			</div>
		{/if}
	</div>
</div>
