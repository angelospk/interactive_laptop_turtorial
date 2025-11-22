<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';

	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	function handleComplete() {
		onComplete(75); // Stub score
	}
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="stub-lesson">
		<h2>Double Click Lesson</h2>
		<p>This lesson type is not yet implemented.</p>
		<button onclick={handleComplete}>Complete (Stub)</button>
	</div>
</LessonTemplate>

<style>
	.stub-lesson {
		padding: 2rem;
		background: white;
		border-radius: 12px;
		text-align: center;
	}
	button {
		margin-top: 1rem;
		padding: 0.75rem 2rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
	}
</style>
