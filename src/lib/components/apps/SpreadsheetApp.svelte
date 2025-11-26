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
	let cellStyles = $state<Record<string, CellStyle>>({});
	let selectedCell = $state<string | null>(null);
	let formulaBar = $state('');

	// Grid configuration
	const rows = 20;
	const cols = 8;
	const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

	let currentStyle = $derived(
		selectedCell
			? cellStyles[selectedCell] || { bold: false, italic: false, underline: false, align: 'left' }
			: { bold: false, italic: false, underline: false, align: 'left' }
	);

	function selectCell(cellId: string) {
		selectedCell = cellId;
		formulaBar = cells[cellId] || '';
		onAction('select-cell', { cellId });
	}

	function updateCell(value: string) {
		if (selectedCell) {
			cells[selectedCell] = value;
			onAction('update-cell', { cellId: selectedCell, value });
		}
	}

	function handleFormula(cellId: string, formula: string) {
		const cleanFormula = formula.toUpperCase().replace('=', '');

		// Simple arithmetic mocking
		// =SUM(A1, B1)
		if (config.targetFormula && cleanFormula.includes(config.targetFormula)) {
			toast.success('Σωστός τύπος!');
			onAction('formula-success', { formula });
		} else if (cleanFormula.startsWith('SUM')) {
			// Simulate calculation
			toast.success('Ο τύπος SUM εφαρμόστηκε');
		} else if (cleanFormula.startsWith('AVERAGE')) {
			toast.success('Ο τύπος AVERAGE εφαρμόστηκε');
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && selectedCell) {
			// Check formula on Enter
			const value = cells[selectedCell];
			if (value && value.startsWith('=')) {
				handleFormula(selectedCell, value);
			}

			// Move down
			const col = selectedCell.charAt(0);
			const row = parseInt(selectedCell.substring(1));
			if (row < rows) {
				selectCell(`${col}${row + 1}`);
			}
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
		let newValue;

		if (value !== undefined) {
			newValue = value;
		} else {
			newValue = !current[prop];
		}

		cellStyles[selectedCell] = {
			...current,
			[prop]: newValue
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

		<!-- Formatting Buttons -->
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

		<!-- Alignment -->
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
						<td class="border bg-slate-100 text-center text-xs text-slate-500">{rowNum}</td>
						{#each colLabels as col}
							{@const cellId = `${col}${rowNum}`}
							{@const style = cellStyles[cellId]}
							<td
								class="border p-0 {selectedCell === cellId ? 'z-10 ring-2 ring-green-500' : ''}"
								onclick={() => selectCell(cellId)}
							>
								<input
									type="text"
									class="h-full w-full bg-transparent px-2 py-1 outline-none
                                    {style?.bold ? 'font-bold' : ''}
                                    {style?.italic ? 'italic' : ''}
                                    {style?.underline ? 'underline' : ''}
                                    {style?.align === 'center'
										? 'text-center'
										: style?.align === 'right'
											? 'text-right'
											: 'text-left'}
                                    "
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
