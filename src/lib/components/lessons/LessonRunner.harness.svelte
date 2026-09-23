<script lang="ts">
	// Test-only host that reproduces what the real route does: it hands
	// `LessonRunner` a `startIndex` that comes out of a `data` object SvelteKit
	// replaces wholesale on every `invalidateAll()`. Passing the number directly
	// from a test would not reproduce the bug, because an unchanged number never
	// invalidates the prop signal — in the app the *object* is new every time.
	import LessonRunner from './LessonRunner.svelte';

	let {
		lessons,
		progress = {},
		startIndex = 0,
		onLessonChange,
		...rest
	} = $props<{
		lessons: unknown[];
		progress?: Record<string, unknown>;
		startIndex?: number;
		onLessonChange?: (lessonKey: string) => void;
		[key: string]: unknown;
	}>();

	let data = $state({ startIndex });
	let navigation = $state(0);

	/** Simulate a load re-run: same route params, brand new data object. */
	export function reload(nextStartIndex = data.startIndex) {
		data = { startIndex: nextStartIndex };
	}

	/** Simulate a real navigation (a link, a typed URL): new params, and it counts. */
	export function navigate(nextStartIndex: number) {
		data = { startIndex: nextStartIndex };
		navigation++;
	}
</script>

<LessonRunner
	{lessons}
	{progress}
	startIndex={data.startIndex}
	{navigation}
	{onLessonChange}
	{...rest}
/>
