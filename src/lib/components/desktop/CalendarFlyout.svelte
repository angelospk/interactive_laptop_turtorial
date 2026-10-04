<script lang="ts">
	/**
	 * The flyout behind the taskbar clock: today's full date and a month
	 * calendar, like Windows 11. Display only — a lesson never asks for it,
	 * but a learner who clicks the clock (everyone does) should see what
	 * Windows shows there instead of nothing.
	 */
	let { now = new Date() } = $props<{ now?: Date }>();

	const WEEKDAYS = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ'];

	const year = $derived(now.getFullYear());
	const month = $derived(now.getMonth());
	const today = $derived(now.getDate());

	// Monday-first grid: leading blanks, then 1..n.
	const cells = $derived.by(() => {
		const first = new Date(year, month, 1).getDay(); // 0 = Sunday
		const lead = (first + 6) % 7;
		const days = new Date(year, month + 1, 0).getDate();
		const out: (number | null)[] = Array(lead).fill(null);
		for (let d = 1; d <= days; d++) out.push(d);
		while (out.length % 7) out.push(null);
		return out;
	});

	const monthLabel = $derived(now.toLocaleDateString('el-GR', { month: 'long', year: 'numeric' }));
	const fullDate = $derived(
		now.toLocaleDateString('el-GR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);
</script>

<!-- stops click from reaching the backdrop -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="absolute right-2 bottom-14 z-50 w-80 max-w-[calc(100%-1rem)] rounded-xl border border-white/10 bg-[#2b2b2b]/95 p-4 [font-family:Segoe_UI,system-ui,sans-serif] text-white shadow-2xl backdrop-blur-xl"
	role="dialog"
	aria-label="Ημερολόγιο"
	tabindex="-1"
	data-testid="calendar-flyout"
	onclick={(e) => e.stopPropagation()}
>
	<p class="text-2xl font-light tabular-nums">
		{now.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
	</p>
	<p class="mb-3 text-sm text-sky-300 capitalize">{fullDate}</p>

	<div class="mb-2 flex items-center justify-between text-sm font-semibold capitalize">
		<span>{monthLabel}</span>
	</div>
	<div class="grid grid-cols-7 gap-y-1 text-center text-xs">
		{#each WEEKDAYS as d (d)}
			<span class="py-1 text-slate-400">{d}</span>
		{/each}
		{#each cells as day, i (i)}
			<span
				class="mx-auto flex h-8 w-8 items-center justify-center rounded-full tabular-nums {day ===
				today
					? 'bg-sky-400 font-semibold text-slate-900'
					: 'text-slate-200'}"
				aria-current={day === today ? 'date' : undefined}
			>
				{day ?? ''}
			</span>
		{/each}
	</div>
</div>
