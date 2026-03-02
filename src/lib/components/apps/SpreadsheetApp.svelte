<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Bold,
		Italic,
		Underline,
		AlignLeft,
		AlignCenter,
		AlignRight,
		Save,
		Calculator
	} from 'lucide-svelte';
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

	type CellStyle = {
		bold: boolean;
		italic: boolean;
		underline: boolean;
		align: 'left' | 'center' | 'right';
	};

	let cells = $state<Record<string, string>>(initialData);
	let formulas = $state<Record<string, string>>({});
	let cellStyles = $state<Record<string, CellStyle>>({});
	let selectedCell = $state<string | null>(null);
	let formulaBar = $state('');

	// Grid configuration
	const rows = 20;
	const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

	// Column widths (resizable)
	let colWidths = $state<Record<string, number>>(
		Object.fromEntries(colLabels.map((l) => [l, 120]))
	);

	let currentStyle = $derived(
		selectedCell
			? cellStyles[selectedCell] || { bold: false, italic: false, underline: false, align: 'left' }
			: { bold: false, italic: false, underline: false, align: 'left' }
	);

	// --- Column resize ---
	function startResize(col: string, e: MouseEvent) {
		e.preventDefault();
		const startX = e.clientX;
		const startW = colWidths[col];

		function onMove(e: MouseEvent) {
			colWidths[col] = Math.max(60, startW + e.clientX - startX);
		}
		function onUp() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		}
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}

	// --- Formula calculation ---
	function parseRange(range: string): string[] {
		const match = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
		if (!match) return [range];
		const [, sc, sr, ec, er] = match;
		const result: string[] = [];
		for (let c = sc.charCodeAt(0); c <= ec.charCodeAt(0); c++) {
			for (let r = parseInt(sr); r <= parseInt(er); r++) {
				result.push(`${String.fromCharCode(c)}${r}`);
			}
		}
		return result;
	}

	function getCellNums(ids: string[]): number[] {
		return ids.map((id) => parseFloat(cells[id] || '')).filter((n) => !isNaN(n));
	}

	function calcFormula(formula: string): string | null {
		const clean = formula.toUpperCase().replace(/\s/g, '').slice(1);
		const m = (fn: string) => clean.match(new RegExp(`^${fn}\\((.+)\\)$`));

		const sumM = m('SUM');
		if (sumM) {
			const nums = getCellNums(parseRange(sumM[1]));
			return String(nums.reduce((a, b) => a + b, 0));
		}
		const avgM = m('AVERAGE');
		if (avgM) {
			const nums = getCellNums(parseRange(avgM[1]));
			return nums.length ? String(nums.reduce((a, b) => a + b, 0) / nums.length) : '0';
		}
		const maxM = m('MAX');
		if (maxM) {
			const nums = getCellNums(parseRange(maxM[1]));
			return nums.length ? String(Math.max(...nums)) : '0';
		}
		const minM = m('MIN');
		if (minM) {
			const nums = getCellNums(parseRange(minM[1]));
			return nums.length ? String(Math.min(...nums)) : '0';
		}
		return null;
	}

	// --- Cell actions ---
	function selectCell(cellId: string) {
		selectedCell = cellId;
		formulaBar = formulas[cellId] || cells[cellId] || '';
		onAction('select-cell', { cellId });
	}

	function updateCell(value: string) {
		if (!selectedCell) return;
		cells[selectedCell] = value;
		if (!value.startsWith('=')) delete formulas[selectedCell];
		onAction('update-cell', { cellId: selectedCell, value });
	}

	function handleFormula(cellId: string, formula: string) {
		const cleanUpper = formula.toUpperCase().replace(/\s/g, '').slice(1);
		const result = calcFormula(formula);

		if (result !== null) {
			formulas[cellId] = formula;
			cells[cellId] = result;
		}

		if (config.targetFormula && cleanUpper.includes(config.targetFormula)) {
			toast.success('Σωστός τύπος! Αποτέλεσμα: ' + (result ?? ''));
			onAction('formula-success', { formula });
		} else if (result !== null) {
			toast.success(`Αποτέλεσμα: ${result}`);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && selectedCell) {
			const value = cells[selectedCell];
			if (value && value.startsWith('=')) {
				handleFormula(selectedCell, value);
			}
			// Move down
			const col = selectedCell.charAt(0);
			const row = parseInt(selectedCell.substring(1));
			if (row < rows) selectCell(`${col}${row + 1}`);
		}
	}

	function toggleStyle(prop: keyof CellStyle, value?: any) {
		if (!selectedCell) return;
		const current = cellStyles[selectedCell] || {
			bold: false,
			italic: false,
			underline: false,
			align: 'left'
		};
		cellStyles[selectedCell] = {
			...current,
			[prop]: value !== undefined ? value : !current[prop]
		};
		onAction('format-cell', { cellId: selectedCell, style: cellStyles[selectedCell] });
	}
</script>

<div class="flex h-full flex-col overflow-hidden bg-white">
	<!-- Toolbar -->
	<div class="flex items-center gap-2 border-b bg-slate-50 p-2">
		<Button variant="ghost" size="icon" onclick={() => toast.success('Αποθηκεύτηκε')}>
			<Save class="h-4 w-4" />
		</Button>
		<div class="h-6 w-px bg-slate-300"></div>

		<Button
			variant="ghost"
			size="icon"
			class={currentStyle.bold ? 'bg-slate-200' : ''}
			onclick={() => toggleStyle('bold')}
		>
			<Bold class="h-4 w-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class={currentStyle.italic ? 'bg-slate-200' : ''}
			onclick={() => toggleStyle('italic')}
		>
			<Italic class="h-4 w-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class={currentStyle.underline ? 'bg-slate-200' : ''}
			onclick={() => toggleStyle('underline')}
		>
			<Underline class="h-4 w-4" />
		</Button>

		<div class="h-6 w-px bg-slate-300"></div>

		<Button
			variant="ghost"
			size="icon"
			class={currentStyle.align === 'left' ? 'bg-slate-200' : ''}
			onclick={() => toggleStyle('align', 'left')}
		>
			<AlignLeft class="h-4 w-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class={currentStyle.align === 'center' ? 'bg-slate-200' : ''}
			onclick={() => toggleStyle('align', 'center')}
		>
			<AlignCenter class="h-4 w-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class={currentStyle.align === 'right' ? 'bg-slate-200' : ''}
			onclick={() => toggleStyle('align', 'right')}
		>
			<AlignRight class="h-4 w-4" />
		</Button>

		<div class="h-6 w-px bg-slate-300"></div>
		<Button variant="ghost" size="icon" title="Συναρτήσεις" onclick={() => (formulaBar = '=')}>
			<Calculator class="h-4 w-4" />
		</Button>
	</div>

	<!-- Formula Bar -->
	<div class="flex items-center gap-2 border-b p-2">
		<div class="w-10 text-center text-sm font-bold text-slate-500">{selectedCell || ''}</div>
		<div class="h-6 w-px bg-slate-300"></div>
		<span class="font-serif text-slate-400 italic">fx</span>
		<input
			type="text"
			class="flex-1 border-none text-sm outline-none"
			bind:value={formulaBar}
			oninput={(e) => updateCell(e.currentTarget.value)}
			onkeydown={(e) => {
				if (e.key === 'Enter') handleKeyDown(e);
			}}
			disabled={!selectedCell}
		/>
	</div>

	<!-- Grid -->
	<div class="flex-1 overflow-auto select-none">
		<table class="border-collapse text-sm" style="table-layout: fixed;">
			<thead>
				<tr>
					<th class="w-10 border bg-slate-100"></th>
					{#each colLabels as label}
						<th
							class="relative border bg-slate-100 px-2 py-1 font-normal text-slate-600 overflow-hidden"
							style="width: {colWidths[label]}px;"
						>
							{label}
							<!-- Resize handle -->
							<div
								class="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400"
								onmousedown={(e) => startResize(label, e)}
							></div>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each Array(rows) as _, r}
					{@const rowNum = r + 1}
					<tr>
						<td class="border bg-slate-100 text-center text-xs text-slate-500 w-10">{rowNum}</td>
						{#each colLabels as col}
							{@const cellId = `${col}${rowNum}`}
							{@const style = cellStyles[cellId]}
							{@const isSelected = selectedCell === cellId}
							{@const hasFormula = !!formulas[cellId]}
							<td
								class="border p-0 overflow-hidden {isSelected ? 'z-10 ring-2 ring-inset ring-green-500' : ''}"
								style="width: {colWidths[col]}px;"
								onclick={() => selectCell(cellId)}
							>
								{#if isSelected}
									<input
										type="text"
										class="h-full w-full bg-transparent px-2 py-1 outline-none
											{style?.bold ? 'font-bold' : ''}
											{style?.italic ? 'italic' : ''}
											{style?.underline ? 'underline' : ''}
											{style?.align === 'center' ? 'text-center' : style?.align === 'right' ? 'text-right' : 'text-left'}"
										value={formulas[cellId] || cells[cellId] || ''}
										oninput={(e) => {
											const v = e.currentTarget.value;
											cells[cellId] = v;
											formulaBar = v;
											if (!v.startsWith('=')) delete formulas[cellId];
											onAction('update-cell', { cellId, value: v });
										}}
										onfocus={() => selectCell(cellId)}
										onkeydown={handleKeyDown}
									/>
								{:else}
									<div
										class="px-2 py-1 truncate
											{style?.bold ? 'font-bold' : ''}
											{style?.italic ? 'italic' : ''}
											{style?.underline ? 'underline' : ''}
											{hasFormula ? 'text-right' : style?.align === 'center' ? 'text-center' : style?.align === 'right' ? 'text-right' : 'text-left'}"
									>
										{cells[cellId] || ''}
									</div>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
