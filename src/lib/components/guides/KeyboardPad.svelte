<script lang="ts">
	/**
	 * The module2 guide's demo: a text box, like a chat line, and the keys the
	 * guide talks about. It reports "pad-focus" (cursor in the box), "pad-typed"
	 * (the text so far), "pad-enter" (Enter sends the line and empties the box)
	 * and "pad-cleared" (Backspace emptied it).
	 */
	import type { GuideEvent } from '$lib/guides';

	let { onEvent } = $props<{ onEvent: (event: GuideEvent) => void }>();

	let input = $state<HTMLInputElement>();
	let value = $state('');
	let focused = $state(false);
	let sent = $state<string[]>([]);

	const text = (v: string) => v.trim().normalize('NFC');
	// The last letter typed says which keyboard language is on.
	const language = $derived.by(() => {
		const last = [...value].reverse().find((c) => /\p{L}/u.test(c));
		if (!last) return null;
		return /\p{Script=Greek}/u.test(last) ? 'ΕΛ' : 'EN';
	});

	// Only a box the learner emptied counts as cleared, not one left with spaces.
	let hadText = false;
	function onInput() {
		const now = text(value);
		if (now) onEvent({ type: 'pad-typed', text: now });
		if (value === '' && hadText) onEvent({ type: 'pad-cleared' });
		hadText = value !== '';
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		const line = text(value);
		if (!line) return;
		sent = [...sent.slice(-2), line];
		value = '';
		hadText = false;
		onEvent({ type: 'pad-enter', text: line });
	}
</script>

<div class="keyboard-pad">
	<div class="sent" aria-live="polite">
		{#each sent as line, i (i)}
			<p class="bubble">{line}</p>
		{:else}
			<p class="empty">Ό,τι γράψετε και στείλετε με Enter, εμφανίζεται εδώ.</p>
		{/each}
	</div>

	<div data-guide="text-box" class="box-row">
		<input
			bind:this={input}
			bind:value
			type="text"
			class="box"
			class:needs-click={!focused}
			placeholder="Πατήστε εδώ και γράψτε…"
			aria-label="Κουτί κειμένου"
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
			oninput={onInput}
			onkeydown={onKeydown}
			onfocus={() => {
				focused = true;
				onEvent({ type: 'pad-focus' });
			}}
			onblur={() => (focused = false)}
		/>
		<span data-guide="language" class="language" title="Γλώσσα πληκτρολογίου">
			{language ?? 'ΕΛ / EN'}
		</span>
	</div>
	<p class="status">
		{#if focused}
			✓ Η γραμμή που αναβοσβήνει είναι ο κέρσορας. Ό,τι γράψετε μπαίνει εκεί.
		{:else}
			<button type="button" class="click-hint" onclick={() => input?.focus()}>
				👆 Πατήστε μέσα στο κουτί για να γράψετε
			</button>
		{/if}
	</p>

	<div class="keys" aria-label="Χρήσιμα πλήκτρα">
		<div data-guide="shift-key" class="key wide">⇧ Shift</div>
		<div data-guide="tonos-key" class="key">΄ ;</div>
		<div data-guide="at-key" class="key">@ 2</div>
		<div data-guide="backspace-key" class="key wide">⌫ Backspace</div>
		<div data-guide="enter-key" class="key wide enter">Enter ↵</div>
		<div data-guide="shortcuts" class="key-group">
			<span class="key">Ctrl</span> + <span class="key">C</span>
			<span class="key">Ctrl</span> + <span class="key">V</span>
		</div>
	</div>
</div>

<style>
	.keyboard-pad {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		height: 100%;
		overflow: auto;
		padding: 1rem;
		background: #f1f5f9;
	}

	.sent {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.4rem;
		min-height: 4rem;
		padding: 0.75rem;
		border-radius: 1rem;
		background: #fff;
	}

	.bubble {
		margin: 0;
		padding: 0.4rem 0.9rem;
		border-radius: 1rem;
		background: #4f46e5;
		color: #fff;
		font-size: 1.1rem;
	}

	.empty {
		align-self: center;
		margin: auto 0;
		color: #64748b;
	}

	.box-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.box {
		flex: 1;
		min-height: 3.75rem;
		padding: 0 1rem;
		border: 2px solid #94a3b8;
		border-radius: 0.75rem;
		background: #fff;
		font-size: 1.5rem;
	}

	.box:focus {
		border-color: #4f46e5;
		outline: 3px solid rgba(79, 70, 229, 0.3);
	}

	.box.needs-click {
		border-color: #f59e0b;
	}

	.language {
		min-width: 4.5rem;
		padding: 0.5rem 0.75rem;
		border: 2px solid #cbd5e1;
		border-radius: 0.5rem;
		background: #fff;
		font-weight: 700;
		text-align: center;
	}

	.status {
		min-height: 3rem;
		margin: 0;
		color: #166534;
		font-size: 1.05rem;
		text-align: center;
	}

	.click-hint {
		min-height: 3rem;
		padding: 0.4rem 1rem;
		border: 2px solid #f59e0b;
		border-radius: 0.75rem;
		background: #fffbeb;
		color: #78350f;
		font-weight: 700;
	}

	.keys {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.6rem;
	}

	.key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 3.25rem;
		min-height: 3.25rem;
		padding: 0 0.6rem;
		border: 1px solid #94a3b8;
		border-bottom-width: 4px;
		border-radius: 0.5rem;
		background: #fff;
		color: #0f172a;
		font-family: ui-monospace, monospace;
		font-size: 1.1rem;
		font-weight: 700;
	}

	.key.wide {
		min-width: 7rem;
	}

	.key.enter {
		background: #ecfdf5;
	}

	.key-group {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.25rem;
		font-weight: 700;
	}
</style>
