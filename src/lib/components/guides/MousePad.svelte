<script lang="ts">
	/**
	 * The module1 guide's demo: one spot per mouse skill. Each spot reports what
	 * the learner did, so the guide can wait for it ("pad-hover", "pad-click",
	 * "pad-double-click", "pad-right-click", "pad-drag-drop").
	 */
	import type { GuideEvent } from '$lib/guides';

	let { onEvent } = $props<{ onEvent: (event: GuideEvent) => void }>();

	let popped = $state(false);
	let clicks = $state(0);
	let opened = $state(false);
	let menuOpen = $state(false);
	let dropped = $state(false);

	// Drag with pointer events: works the same for a mouse, a touchpad and a finger.
	let bin = $state<HTMLElement>();
	let drag = $state<{ dx: number; dy: number; x0: number; y0: number } | null>(null);
	let overBin = $state(false);

	function startDrag(e: PointerEvent) {
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		drag = { dx: 0, dy: 0, x0: e.clientX, y0: e.clientY };
	}

	function moveDrag(e: PointerEvent) {
		if (!drag) return;
		drag = { ...drag, dx: e.clientX - drag.x0, dy: e.clientY - drag.y0 };
		overBin = inBin(e);
	}

	function endDrag(e: PointerEvent) {
		if (!drag) return;
		const hit = inBin(e);
		drag = null;
		overBin = false;
		if (hit) {
			dropped = true;
			onEvent({ type: 'pad-drag-drop' });
		}
	}

	function inBin(e: PointerEvent) {
		const r = bin?.getBoundingClientRect();
		return (
			!!r &&
			e.clientX >= r.left &&
			e.clientX <= r.right &&
			e.clientY >= r.top &&
			e.clientY <= r.bottom
		);
	}
</script>

<div class="mouse-pad">
	<section data-guide="hover" class="spot">
		<h3>Πέρασμα</h3>
		<div
			class="balloon"
			class:popped
			role="img"
			aria-label="Μπαλόνι"
			onpointerenter={() => {
				popped = true;
				onEvent({ type: 'pad-hover' });
			}}
		>
			{popped ? '💥' : '🎈'}
		</div>
		<p>Περάστε το βελάκι από πάνω</p>
	</section>

	<section data-guide="click" class="spot">
		<h3>Κλικ</h3>
		<button
			type="button"
			class="big-button"
			onclick={() => {
				clicks++;
				onEvent({ type: 'pad-click' });
			}}
		>
			Πατήστε με
		</button>
		<p>{clicks ? `Πατήσατε ${clicks} φορές` : 'Ένα πάτημα, αριστερό κουμπί'}</p>
	</section>

	<section data-guide="double-click" class="spot">
		<h3>Διπλό κλικ</h3>
		<button
			type="button"
			class="folder"
			ondblclick={() => {
				opened = true;
				onEvent({ type: 'pad-double-click' });
			}}
		>
			<span class="text-5xl" aria-hidden="true">{opened ? '📂' : '📁'}</span>
			<span>Φάκελος</span>
		</button>
		<p>{opened ? 'Άνοιξε!' : 'Δύο γρήγορα πατήματα'}</p>
	</section>

	<section data-guide="right-click" class="spot">
		<h3>Δεξί κλικ</h3>
		<div class="relative">
			<button
				type="button"
				class="card"
				oncontextmenu={(e) => {
					e.preventDefault();
					menuOpen = true;
					onEvent({ type: 'pad-right-click' });
				}}
				onclick={() => (menuOpen = false)}
			>
				📄 Έγγραφο
			</button>
			{#if menuOpen}
				<ul class="context-menu" role="menu">
					<li role="menuitem">Άνοιγμα</li>
					<li role="menuitem">Αντιγραφή</li>
					<li role="menuitem">Μετονομασία</li>
				</ul>
			{/if}
		</div>
		<p>Το δεξί κουμπί ανοίγει ένα μενού</p>
	</section>

	<section data-guide="drag" class="spot wide">
		<h3>Σύρσιμο</h3>
		<div class="drag-row">
			<!-- The file comes back after each drop: an early try never uses it up. -->
			<div
				data-testid="drag-file"
				class="drag-file"
				class:dragging={!!drag}
				role="img"
				aria-label="Αρχείο για σύρσιμο"
				style={drag ? `transform: translate(${drag.dx}px, ${drag.dy}px)` : ''}
				onpointerdown={startDrag}
				onpointermove={moveDrag}
				onpointerup={endDrag}
				onpointercancel={() => (drag = null)}
			>
				📄
			</div>
			<span class="text-3xl text-slate-400" aria-hidden="true">→</span>
			<div bind:this={bin} data-testid="drag-bin" class="drag-bin" class:over={overBin}>
				🗑️ {dropped ? 'Μπήκε!' : 'Κάδος'}
			</div>
		</div>
		<p>Πατήστε, κρατήστε πατημένο και μεταφέρετε</p>
	</section>
</div>

<style>
	.mouse-pad {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: 1rem;
		height: 100%;
		overflow: auto;
		padding: 1rem;
		background: #f1f5f9;
	}

	.spot {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 1rem;
		background: #fff;
		text-align: center;
	}

	.spot.wide {
		grid-column: 1 / -1;
	}

	.spot h3 {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 700;
		color: #1e293b;
	}

	.spot p {
		margin: 0;
		color: #475569;
		font-size: 1rem;
	}

	.balloon {
		font-size: 3.5rem;
		line-height: 1;
		cursor: pointer;
	}

	.big-button {
		min-height: 3.5rem;
		padding: 0.5rem 1.5rem;
		border-radius: 0.75rem;
		background: #4f46e5;
		color: #fff;
		font-size: 1.15rem;
		font-weight: 700;
	}

	.folder,
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 3.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.75rem;
		font-size: 1.05rem;
	}

	.card {
		border: 2px solid #cbd5e1;
		background: #f8fafc;
	}

	.context-menu {
		position: absolute;
		top: 100%;
		left: 50%;
		z-index: 10;
		min-width: 9rem;
		margin: 0.25rem 0 0;
		padding: 0.25rem;
		list-style: none;
		border: 1px solid #cbd5e1;
		border-radius: 0.5rem;
		background: #fff;
		box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
		text-align: left;
	}

	.context-menu li {
		padding: 0.4rem 0.75rem;
		border-radius: 0.35rem;
	}

	.drag-row {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.drag-file {
		font-size: 3rem;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}

	.drag-file.dragging {
		cursor: grabbing;
		position: relative;
		z-index: 5;
	}

	.drag-bin {
		min-width: 8rem;
		padding: 1rem;
		border: 3px dashed #94a3b8;
		border-radius: 1rem;
		font-size: 1.2rem;
	}

	.drag-bin.over {
		border-color: #16a34a;
		background: #f0fdf4;
	}
</style>
