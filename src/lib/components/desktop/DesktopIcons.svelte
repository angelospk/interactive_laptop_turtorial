<script lang="ts">
	import { Monitor, Trash2 } from 'lucide-svelte';
	import type { Icon as LucideIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';

	/**
	 * Shortcuts on the Windows wallpaper (left column, like a real PC):
	 * «Αυτός ο υπολογιστής», «Κάδος Ανακύκλωσης» and the apps the lesson
	 * exposes. One click selects, a double-click (or Enter) opens — the gesture
	 * a beginner is learning. Opening goes through the same `onOpen` as the
	 * taskbar and Start, so lesson goals see one `open-app` event either way.
	 */
	let {
		apps = [],
		onOpen,
		disabled = false
	} = $props<{
		apps: { id: string; name: string; icon: typeof LucideIcon }[];
		onOpen: (appId: string) => void;
		disabled?: boolean;
	}>();

	let selected = $state<string | null>(null);

	const systemIcons = [
		{ id: 'this-pc', name: 'Αυτός ο υπολογιστής', icon: Monitor, open: () => onOpen('explorer') },
		{
			id: 'recycle',
			name: 'Κάδος Ανακύκλωσης',
			icon: Trash2,
			open: () => toast.info('Ο Κάδος Ανακύκλωσης είναι άδειος. Εδώ πάνε τα αρχεία που διαγράφεις.')
		}
	];

	const entries = $derived([
		...systemIcons,
		...apps.map((a: { id: string; name: string; icon: typeof LucideIcon }) => ({
			id: a.id,
			name: a.name,
			icon: a.icon,
			open: () => onOpen(a.id)
		}))
	]);
</script>

<div
	class="absolute top-3 left-3 z-0 grid max-h-[calc(100%-4rem)] grid-flow-col grid-rows-[repeat(auto-fill,5.75rem)] gap-1 [font-family:Segoe_UI,system-ui,sans-serif]"
	role="group"
	aria-label="Εικονίδια επιφάνειας εργασίας"
	data-testid="desktop-icons"
>
	{#each entries as entry (entry.id)}
		<button
			type="button"
			{disabled}
			class={cn(
				'flex h-[5.5rem] w-[5.25rem] flex-col items-center gap-1 rounded-sm border border-transparent p-1.5 text-center transition-colors focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none',
				selected === entry.id ? 'border-white/40 bg-white/25' : 'hover:bg-white/15'
			)}
			onclick={(e) => {
				e.stopPropagation();
				selected = entry.id;
			}}
			ondblclick={(e) => {
				e.stopPropagation();
				entry.open();
			}}
			onkeydown={(e) => {
				if (e.key === 'Enter') entry.open();
			}}
			title={`${entry.name} — διπλό κλικ για άνοιγμα`}
			aria-label={`${entry.name} (διπλό κλικ για άνοιγμα)`}
		>
			<span class="flex h-10 w-10 items-center justify-center drop-shadow-md">
				<entry.icon class="h-9 w-9 text-white" strokeWidth={1.5} />
			</span>
			<span
				class="line-clamp-2 text-[11px] leading-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]"
			>
				{entry.name}
			</span>
		</button>
	{/each}
</div>
