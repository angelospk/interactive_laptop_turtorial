<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { X, Minimize2, Maximize2, HelpCircle } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	let {
		instructions = 'Ακολουθήστε τις οδηγίες για να ολοκληρώσετε το μάθημα.',
		title = 'Βοηθός Εκμάθησης',
		visible = true,
		lessonId = ''
	} = $props<{
		instructions?: string | string[];
		title?: string;
		visible?: boolean;
		lessonId?: string;
	}>();

	// Global storage key - same for all lessons
	const storageKey = 'tutorial-assistant-minimized';

	let isMinimized = $state(false);
	let hasInitialized = $state(false);

	// Check localStorage on mount to determine initial state
	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			const wasMinimized = localStorage.getItem(storageKey) === 'true';
			isMinimized = wasMinimized;
		}
		hasInitialized = true;
	});

	function toggleMinimize() {
		isMinimized = !isMinimized;
		// Save state globally
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(storageKey, isMinimized.toString());
		}
	}
</script>

{#if visible}
	<div
		class="fixed right-4 bottom-4 z-50 transition-all duration-300 ease-in-out"
		class:w-80={!isMinimized}
		class:w-auto={isMinimized}
	>
		{#if isMinimized}
			<Button
				variant="default"
				size="icon"
				class="h-12 w-12 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700"
				onclick={toggleMinimize}
				title="Άνοιγμα Βοηθού"
			>
				<HelpCircle class="h-6 w-6 text-white" />
			</Button>
		{:else}
			<div transition:fly={{ y: 20, duration: 300 }}>
				<Card class="border-blue-200 bg-blue-50/95 shadow-xl backdrop-blur">
					<CardHeader class="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
						<CardTitle class="flex items-center gap-2 text-sm font-medium text-blue-800">
							<HelpCircle class="h-4 w-4" />
							{title}
						</CardTitle>
						<Button variant="ghost" size="icon" class="h-6 w-6" onclick={toggleMinimize}>
							<Minimize2 class="h-4 w-4 text-blue-600" />
						</Button>
					</CardHeader>
					<CardContent class="p-4 pt-0">
						{#if Array.isArray(instructions)}
							<ul class="list-inside list-decimal space-y-2 text-sm leading-relaxed text-slate-700">
								{#each instructions as step}
									<li>{step}</li>
								{/each}
							</ul>
						{:else}
							<p class="text-sm leading-relaxed text-slate-700">
								{instructions}
							</p>
						{/if}
					</CardContent>
				</Card>
			</div>
		{/if}
	</div>
{/if}
