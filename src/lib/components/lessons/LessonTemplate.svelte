<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import type { Lesson } from '$lib/db/schema';
	import * as m from '$lib/paraglide/messages';
	import type { Snippet } from 'svelte';

	interface Props {
		lesson: Lesson;
		onBack: () => void;
		children: Snippet;
	}

	let { lesson, onBack, children }: Props = $props();

	// Get translated title and description
	const title = $derived((m as any)[lesson.titleKey]?.() || lesson.titleKey);
	const description = $derived(
		lesson.descriptionKey ? (m as any)[lesson.descriptionKey]?.() || lesson.descriptionKey : ''
	);

	// Difficulty badge colors
	const difficultyColors: Record<string, string> = {
		beginner: '#10b981',
		intermediate: '#f59e0b',
		advanced: '#ef4444'
	};

	const difficultyColor = $derived(difficultyColors[lesson.difficulty] || '#6b7280');
</script>

<div class="lesson-template">
	<!-- Header -->
	<header class="lesson-header">
		<button class="back-button" onclick={onBack}>
			<ArrowLeft size={20} />
			<span>{m.back()}</span>
		</button>

		<div class="lesson-info">
			<h1 class="lesson-title">{title}</h1>
			<p class="lesson-description">{description}</p>
		</div>

		<div class="lesson-meta">
			<span class="difficulty-badge" style="background-color: {difficultyColor}">
				{(m as any)[`difficulty_${lesson.difficulty}`]?.() || lesson.difficulty}
			</span>
			<span class="lesson-type">
				{(m as any)[`type_${lesson.lessonType.replace(/-/g, '_')}`]?.() || lesson.lessonType}
			</span>
		</div>
	</header>

	<!-- Lesson Content -->
	<div class="lesson-content">
		{@render children()}
	</div>
</div>

<style>
	.lesson-template {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 12px;
		overflow: hidden;
	}

	.lesson-header {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 6px;
		color: white;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 1rem;
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateX(-4px);
	}

	.lesson-info {
		margin-bottom: 1rem;
	}

	.lesson-title {
		font-size: 2rem;
		font-weight: 700;
		color: white;
		margin-bottom: 0.5rem;
	}

	.lesson-description {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
	}

	.lesson-meta {
		display: flex;
		gap: 1rem;
		align-items: center;
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

	.lesson-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}
</style>
