<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let {
		initialData = {},
		config = {},
		onAction
	} = $props<{
		initialData?: Record<string, string>;
		config?: any;
		onAction: (action: string, data?: any) => void;
	}>();

	let cells = $state<Record<string, string>>(initialData);
	let selectedCell = $state<string | null>(null);
	let formulaBar = $state('');

	// Grid configuration
	const rows = 15;
	const cols = 8;
	const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

	function selectCell(cellId: string) {
		selectedCell = cellId;
		formulaBar = cells[cellId] || '';
		onAction('select-cell', { cellId });
	}

	function updateCell(value: string) {
		if (selectedCell) {
			cells[selectedCell] = value;
			onAction('update-cell', { cellId: selectedCell, value });

			// Check for basic formulas (simplified)
			if (value.startsWith('=')) {
				handleFormula(selectedCell, value);
			}
		}
	}

	function handleFormula(cellId: string, formula: string) {
		// Very basic sum example: =SUM(A1,A2) or =A1+A2
		// For this simulation, we might just trigger a success if they type the correct formula
		if (config.targetFormula && formula.toUpperCase().includes(config.targetFormula)) {
			toast.success('Σωστός τύπος!');
			onAction('formula-success', { formula });
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && selectedCell) {
			// Move down
			const col = selectedCell.charAt(0);
			const row = parseInt(selectedCell.substring(1));
			if (row < rows) {
				selectCell(`${col}${row + 1}`);
			}
		}
	}
</script>

<div class="flex h-full flex-col overflow-hidden bg-white">
	<!-- Toolbar -->
	<div class="flex items-center gap-2 border-b bg-slate-50 p-2">
		<Button variant="ghost" size="icon" onclick={() => toast.success('Αποθηκεύτηκε')}>
			<Save class="h-4 w-4" />
		</Button>
		<div class="h-6 w-px bg-slate-300"></div>
		<Button variant="ghost" size="icon"><Bold class="h-4 w-4" /></Button>
		<Button variant="ghost" size="icon"><Italic class="h-4 w-4" /></Button>
		<Button variant="ghost" size="icon"><Underline class="h-4 w-4" /></Button>
		<div class="h-6 w-px bg-slate-300"></div>
		<Button variant="ghost" size="icon"><AlignLeft class="h-4 w-4" /></Button>
		<Button variant="ghost" size="icon"><AlignCenter class="h-4 w-4" /></Button>
		<Button variant="ghost" size="icon"><AlignRight class="h-4 w-4" /></Button>
	</div>

	<!-- Formula Bar -->
	<div class="flex items-center gap-2 border-b p-2">
		<div class="w-10 text-center text-sm font-bold text-slate-500">{selectedCell || ''}</div>
		<div class="h-6 w-px bg-slate-300"></div>
		<span class="font-serif italic text-slate-400">fx</span>
		<input
			type="text"
			class="flex-1 border-none outline-none text-sm"
			bind:value={formulaBar}
			oninput={(e) => updateCell(e.currentTarget.value)}
			onkeydown={(e) => { if(e.key === 'Enter') handleKeyDown(e) }}
			disabled={!selectedCell}
		/>
	</div>

	<!-- Grid -->
	<div class="flex-1 overflow-auto">
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr>
					<th class="w-10 border bg-slate-100"></th>
					{#each colLabels as label}
						<th class="min-w-[80px] border bg-slate-100 px-2 py-1 font-normal text-slate-600">
							{label}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each Array(rows) as _, r}
					{@const rowNum = r + 1}
					<tr>
						<td class="border bg-slate-100 text-center text-slate-500">{rowNum}</td>
						{#each colLabels as col}
							{@const cellId = `${col}${rowNum}`}
							<td
								class="border p-0 {selectedCell === cellId ? 'ring-2 ring-green-500 z-10' : ''}"
								onclick={() => selectCell(cellId)}
							>
								<input
									type="text"
									class="h-full w-full px-2 py-1 outline-none"
									value={cells[cellId] || ''}
									oninput={(e) => {
										selectedCell = cellId;
										updateCell(e.currentTarget.value);
									}}
									onfocus={() => selectCell(cellId)}
									onkeydown={handleKeyDown}
								/>
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
