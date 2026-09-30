<script lang="ts">
	// Static offline fallback, precached by the service worker and shown when a
	// navigation fails offline. The list below is read from that same cache in
	// the browser, so the page itself still needs nothing from the server.
	import { onMount } from 'svelte';
	import { offlinePages, titleFromHtml } from '$lib/offlineLessons';

	type Entry = { path: string; label: string };
	let entries = $state<Entry[]>([]);

	onMount(async () => {
		if (typeof caches === 'undefined') return;
		try {
			const urls: string[] = [];
			for (const name of await caches.keys()) {
				const cache = await caches.open(name);
				for (const request of await cache.keys()) urls.push(request.url);
			}
			const found: Entry[] = [];
			for (const page of offlinePages(urls, location.origin)) {
				const html = await (await caches.match(new URL(page.path, location.origin).href))?.text();
				const title = html ? titleFromHtml(html) : null;
				const kind = page.kind === 'lesson' ? 'Μάθημα' : 'Θεωρία';
				found.push({ path: page.path, label: title ? `${kind}: ${title}` : kind });
			}
			entries = found;
		} catch {
			// Storage unavailable: the retry button is still there.
		}
	});
</script>

<svelte:head>
	<title>Εκτός σύνδεσης — Ψηφιακά Βήματα</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="offline">
	<div class="card">
		<div class="icon" aria-hidden="true">📶</div>
		<h1>Είστε εκτός σύνδεσης</h1>
		<p>
			Δεν υπάρχει σύνδεση στο διαδίκτυο αυτή τη στιγμή. Τα μαθήματα που έχετε ήδη ανοίξει παραμένουν
			διαθέσιμα. Μόλις επανέλθει η σύνδεση, όλα θα δουλέψουν ξανά κανονικά.
		</p>
		<button type="button" onclick={() => location.reload()}>Δοκιμάστε ξανά</button>
		{#if entries.length}
			<h2>Ανοίγουν και χωρίς ίντερνετ</h2>
			<ul>
				{#each entries as entry (entry.path)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- paths come from the cache, not a route id -->
					<li><a href={entry.path}>{entry.label}</a></li>
				{/each}
			</ul>
		{/if}
	</div>
</main>

<style>
	.offline {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: var(--background, #ffffff);
		color: var(--foreground, #0f172a);
	}
	.card {
		max-width: 32rem;
		text-align: center;
	}
	.icon {
		font-size: 4rem;
		line-height: 1;
		margin-bottom: 1rem;
	}
	h1 {
		font-size: 1.75rem;
		font-weight: 800;
		margin: 0 0 0.75rem;
	}
	p {
		font-size: 1.15rem;
		line-height: 1.6;
		margin: 0 0 1.5rem;
	}
	button {
		font-size: 1.15rem;
		font-weight: 700;
		padding: 0.75rem 1.75rem;
		border: none;
		border-radius: 0.75rem;
		background: #2563eb;
		color: #ffffff;
		cursor: pointer;
	}
	button:hover {
		background: #1d4ed8;
	}
	h2 {
		font-size: 1.3rem;
		font-weight: 700;
		margin: 2rem 0 0.75rem;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.5rem;
		text-align: left;
	}
	a {
		display: flex;
		align-items: center;
		min-height: 48px;
		padding: 0.5rem 1rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.75rem;
		font-size: 1.15rem;
		color: #1d4ed8;
		text-decoration: underline;
	}
</style>
