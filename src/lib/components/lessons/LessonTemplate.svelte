<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import * as m from '$lib/paraglide/messages.js';
	import type { Snippet } from 'svelte';
	import TutorialAssistant from '$lib/components/ui/TutorialAssistant.svelte';
	import { getAssistantContent } from '$lib/lessons/assistant';

	interface Props {
		lesson: Lesson;
		onBack: () => void;
		children: Snippet;
	}

	// eslint-disable-next-line svelte/no-unused-props -- onBack is still passed by every lesson; the breadcrumb replaced the back button
	let { lesson, children }: Props = $props();

	// Message functions are looked up by key computed at runtime
	const messages = m as unknown as Record<string, (() => string) | undefined>;

	// Get translated title and description
	const title = $derived(messages[lesson.titleKey]?.() || lesson.titleKey);
	const description = $derived(
		lesson.descriptionKey ? messages[lesson.descriptionKey]?.() || lesson.descriptionKey : ''
	);

	// Difficulty badge colors
	const difficultyColors: Record<string, string> = {
		beginner: '#10b981',
		intermediate: '#f59e0b',
		advanced: '#ef4444'
	};

	const difficultyColor = $derived(difficultyColors[lesson.difficulty] || '#6b7280');

	// Only what the assistant genuinely adds on top of what is already on screen.
	const assistantContent = $derived(getAssistantContent({ config: lesson.config, description }));

	// The lesson body is the page's scroller now, so it has to start at the top
	// when the learner moves to another lesson instead of inheriting the previous
	// lesson's scroll position.
	let contentEl = $state<HTMLElement | undefined>();

	$effect(() => {
		const id = lesson.id;
		if (contentEl && id) contentEl.scrollTop = 0;
	});
</script>

<div class="lesson-template">
	<!--
		Header. The "Πίσω" button that used to live here was the third control in a
		row saying the same thing (breadcrumb, page back button, this one) and cost
		a line of the lesson's own height. The breadcrumb above the lesson is the
		single way back now.

		Title and description are shown in the lesson bar over the lesson; here they
		stay only for screen readers, so the page keeps its h1 and the lesson keeps
		the height.
	-->
	<header class="lesson-header">
		<h1 class="lesson-title">{title}</h1>
		{#if description}
			<p class="lesson-description">{description}</p>
		{/if}

		<div class="lesson-meta">
			<span class="difficulty-badge" style="background-color: {difficultyColor}">
				{messages[`difficulty_${lesson.difficulty}`]?.() || lesson.difficulty}
			</span>
			<span class="lesson-type">
				{messages[`type_${lesson.lessonType.replace(/-/g, '_')}`]?.() || lesson.lessonType}
			</span>
		</div>
	</header>

	<!-- Lesson Content -->
	<div class="lesson-content" bind:this={contentEl}>
		{@render children()}
	</div>

	<TutorialAssistant title="Βοηθός" lessonId={lesson.id} instructions={assistantContent} />
</div>

<style>
	.lesson-template {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		overflow: hidden;
	}

	/* Visually hidden, still read out. */
	.lesson-header {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	.lesson-title {
		font-size: 1.375rem;
		font-weight: 700;
		color: white;
		margin: 0;
	}

	.lesson-description {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		flex: 1 1 16rem;
	}

	.lesson-meta {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		margin-inline-start: auto;
	}

	.difficulty-badge {
		display: inline-flex;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		color: white;
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: capitalize;
	}

	.lesson-type {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.85rem;
		text-transform: capitalize;
	}

	/* The lesson body is the only scroller: the page itself must not grow, or the
	   learner has to scroll to find the button that starts the lesson. */
	.lesson-content {
		flex: 1;
		min-block-size: 0;
		padding: 0.5rem;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
</style>
