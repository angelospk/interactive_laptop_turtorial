<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { X, HelpCircle } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	let {
		title,
		description,
		isOpen = false,
		onClose
	} = $props<{
		title: string;
		description: string;
		isOpen: boolean;
		onClose: () => void;
	}>();
</script>

{#if isOpen}
	<div
		class="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		transition:fade
	>
		<div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" transition:fly={{ y: 20 }}>
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-2 text-xl font-bold text-blue-600">
					<HelpCircle class="h-6 w-6" />
					<h2>Οδηγίες</h2>
				</div>
				<Button variant="ghost" size="icon" onclick={onClose}>
					<X class="h-5 w-5" />
				</Button>
			</div>

			<h3 class="mb-2 text-lg font-semibold text-slate-800">{title}</h3>
			<div class="prose prose-sm mb-6 text-slate-600">
				<p>{description}</p>
			</div>

			<div class="flex justify-end">
				<Button onclick={onClose} class="w-full sm:w-auto">Κατάλαβα!</Button>
			</div>
		</div>
	</div>
{/if}
