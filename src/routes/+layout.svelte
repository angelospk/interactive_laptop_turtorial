<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner';
	import { onMount } from 'svelte';
	import { setLocale, getLocale } from '$lib/paraglide/runtime';

	let { children } = $props();

	// Force Greek locale on client-side mount
	onMount(() => {
		const current = getLocale();
		if (current !== 'el') {
			console.log('Forcing Greek locale on client');
			setLocale('el');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Toaster richColors position="top-right" />
{@render children()}
