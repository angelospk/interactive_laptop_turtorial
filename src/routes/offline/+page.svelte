<script lang="ts">
	// Static offline fallback. Kept dependency-free and prerenderable so the
	// service worker can precache it and show it when a navigation fails offline.
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
</style>
