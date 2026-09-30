<script lang="ts">
	import { onMount } from 'svelte';
	import { isLargeText, setLargeText } from '$lib/textSize';

	// Read after mount: the server cannot know, and app.html has already applied it.
	let large = $state(false);
	onMount(() => {
		large = isLargeText();
	});

	function toggle() {
		large = !large;
		setLargeText(large);
	}
</script>

<button
	type="button"
	onclick={toggle}
	aria-pressed={large}
	class="shadow-soft inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-base font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-4 focus-visible:ring-brand/20 focus-visible:outline-none aria-pressed:border-brand aria-pressed:bg-brand/10"
>
	<span aria-hidden="true" class="font-bold">A<span class="text-lg">A</span></span>
	Μεγαλύτερα γράμματα
</button>
