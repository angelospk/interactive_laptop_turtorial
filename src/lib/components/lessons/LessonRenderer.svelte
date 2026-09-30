<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import { lessonTypeRegistry } from './lessonTypeRegistry';

	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	const componentPromise = $derived(
		lessonTypeRegistry[lesson.lessonType]?.(lesson).catch((error: unknown) => {
			console.error('Lesson failed to open', lesson.lessonType, error);
			throw error;
		})
	);
</script>

<!-- Keyed by lesson.id: SvelteKit preserves this component across same-route
     param navigation, so without the key a lesson component would keep the
     previous lesson's local state (done/feedback/config snapshot) — codex review. -->
<!-- Calm, Greek, and with one way out. The technical cause goes to the console:
     on screen it only suggests the learner broke something. -->
{#snippet failed()}
	<div class="error-container" role="alert">
		<h2>Αυτό το μάθημα δεν άνοιξε</h2>
		<p>Δεν φταίτε εσείς. Δοκιμάστε ξανά αργότερα ή διαλέξτε ένα άλλο μάθημα.</p>
		<button onclick={onBack}>Πίσω στα μαθήματα</button>
	</div>
{/snippet}

{#key lesson.id}
	{#if componentPromise}
		{#await componentPromise}
			<div class="flex h-full items-center justify-center">
				<div
					class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
				></div>
			</div>
		{:then module}
			<module.default {lesson} {onComplete} {onBack} />
		{:catch}
			{@render failed()}
		{/await}
	{:else}
		{@render failed()}
	{/if}
{/key}

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		padding: 2rem;
		text-align: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 12px;
		color: white;
	}

	.error-container h2 {
		margin-bottom: 1rem;
		font-size: 2rem;
	}

	.error-container p {
		margin-bottom: 0.5rem;
		opacity: 0.9;
	}

	.error-container button {
		margin-top: 1.5rem;
		padding: 0.75rem 2rem;
		background: white;
		color: #667eea;
		border: none;
		border-radius: 6px;
		min-height: 48px;
		font-size: 1.125rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.error-container button:hover {
		transform: scale(1.05);
	}
</style>
