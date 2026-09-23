<script lang="ts">
	import { tick } from 'svelte';
	import { HelpCircle, X } from 'lucide-svelte';

	let {
		instructions = null,
		title = 'Βοηθός',
		visible = true,
		lessonId = ''
	} = $props<{
		instructions?: string | string[] | null;
		title?: string;
		visible?: boolean;
		lessonId?: string;
	}>();

	// The assistant used to open itself the first time a learner reached a lesson.
	// With 218 lessons that is "every lesson", landing on top of the exercise with
	// a sentence the learner had just read. Help is now something you ask for.
	let isOpen = $state(false);
	let launcherEl = $state<HTMLButtonElement | undefined>();
	let closeEl = $state<HTMLButtonElement | undefined>();

	const steps = $derived(
		Array.isArray(instructions)
			? instructions.filter((s): s is string => typeof s === 'string' && s.trim() !== '')
			: []
	);
	const text = $derived(
		!Array.isArray(instructions) && typeof instructions === 'string' ? instructions.trim() : ''
	);
	const hasContent = $derived(steps.length > 0 || text !== '');

	const panelId = $derived(`tutorial-assistant-${lessonId || 'lesson'}`);

	// Moving to another lesson closes the panel: help asked for one exercise is
	// not help for the next one.
	let openForLessonId = lessonId;
	$effect(() => {
		const id = lessonId;
		if (id !== openForLessonId) {
			openForLessonId = id;
			isOpen = false;
		}
	});

	async function open() {
		isOpen = true;
		// Opening is always a deliberate press, so the keyboard should follow the
		// learner into the panel; Escape and the close button hand focus back.
		await tick();
		closeEl?.focus();
	}

	function close({ restoreFocus = true } = {}) {
		isOpen = false;
		if (restoreFocus) launcherEl?.focus();
	}

	// Escape is the reflex for "make this go away". In fullscreen the browser may
	// consume it to leave fullscreen first, which is why the visible close button
	// is not optional.
	$effect(() => {
		if (!isOpen) return;
		function onKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') close();
		}
		document.addEventListener('keydown', onKeydown);
		return () => document.removeEventListener('keydown', onKeydown);
	});
</script>

{#if visible && hasContent}
	<div class="assistant">
		{#if isOpen}
			<div class="panel" id={panelId} role="dialog" aria-label={title}>
				<div class="panel-head">
					<h2 class="panel-title">
						<HelpCircle class="h-5 w-5" aria-hidden="true" />
						{title}
					</h2>
					<button
						bind:this={closeEl}
						class="icon-button"
						onclick={() => close()}
						aria-label="Κλείσιμο βοηθού"
					>
						<X class="h-5 w-5" aria-hidden="true" />
					</button>
				</div>

				{#if steps.length > 0}
					<ol class="panel-steps">
						{#each steps as step, i (i)}
							<li>{step}</li>
						{/each}
					</ol>
				{:else}
					<p class="panel-text">{text}</p>
				{/if}
			</div>
		{/if}

		<button
			class="launcher"
			bind:this={launcherEl}
			onclick={() => (isOpen ? close({ restoreFocus: false }) : open())}
			aria-expanded={isOpen}
			aria-controls={panelId}
		>
			<HelpCircle class="h-6 w-6" aria-hidden="true" />
			<span>Βοήθεια</span>
		</button>
	</div>
{/if}

<style>
	.assistant {
		position: fixed;
		inset-block-end: 1rem;
		inset-inline-end: 1rem;
		z-index: 50;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
		max-inline-size: min(22rem, calc(100vw - 2rem));
	}

	.launcher {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-block-size: 48px;
		min-inline-size: 48px;
		padding-inline: 1rem;
		border: none;
		border-radius: 999px;
		background: #1d4ed8;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 8px 20px rgb(15 23 42 / 25%);
	}

	.launcher:hover {
		background: #1e40af;
	}

	.launcher:focus-visible {
		outline: 3px solid #f59e0b;
		outline-offset: 3px;
	}

	.panel {
		background: white;
		border: 2px solid #bfdbfe;
		border-radius: 0.75rem;
		box-shadow: 0 12px 32px rgb(15 23 42 / 25%);
		padding: 1rem;
		inline-size: min(22rem, calc(100vw - 2rem));
		animation: assistant-in 150ms ease-out;
	}

	.panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-block-end: 0.5rem;
	}

	.panel-title {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.0625rem;
		font-weight: 700;
		color: #1e3a8a;
		margin: 0;
	}

	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-block-size: 48px;
		min-inline-size: 48px;
		border: none;
		border-radius: 0.5rem;
		background: transparent;
		color: #1d4ed8;
		cursor: pointer;
	}

	.icon-button:hover {
		background: #eff6ff;
	}

	.icon-button:focus-visible {
		outline: 3px solid #f59e0b;
		outline-offset: 2px;
	}

	.panel-text,
	.panel-steps {
		font-size: 1rem;
		line-height: 1.6;
		color: #1f2937;
		margin: 0;
	}

	.panel-steps {
		padding-inline-start: 1.25rem;
		display: grid;
		gap: 0.5rem;
	}

	@keyframes assistant-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.panel {
			animation: none;
		}
	}
</style>
