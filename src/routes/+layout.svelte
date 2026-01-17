<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner';
	import { onMount } from 'svelte';
	import { setLocale, getLocale } from '$lib/paraglide/runtime';

	let { children } = $props();

	// Read saved locale preference on mount, default to Greek
	onMount(() => {
		const savedLocale = localStorage.getItem('preferred-locale');
		if (savedLocale === 'en' || savedLocale === 'el') {
			if (getLocale() !== savedLocale) {
				setLocale(savedLocale);
			}
		} else if (getLocale() !== 'el') {
			// Default to Greek for first-time visitors
			setLocale('el');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Toaster richColors position="top-right" expand={true} />
{@render children()}
