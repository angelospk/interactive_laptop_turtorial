<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save, Calculator } from 'lucide-svelte';
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

    let currentStyle = $derived(selectedCell ? (cellStyles[selectedCell] || { bold: false, italic: false, underline: false, align: 'left' }) : { bold: false, italic: false, underline: false, align: 'left' });

    // --- FORMULA EVALUATION LOGIC ---

    function getCellValue(cellId: string): string {
        const value = cells[cellId];
        if (value && value.startsWith('=')) {
            try {
                return evaluateFormula(value.substring(1), cells);
            } catch (e) {
                return '#ERROR';
            }
        }
        return value || '';
    }

    function evaluateFormula(formula: string, data: Record<string, string>): string {
        // Upper case for consistency
        let expr = formula.toUpperCase().trim();

        // 1. Expand Ranges: SUM(A1:A3) -> SUM(A1,A2,A3)
        // Regex for A1:A3
        expr = expr.replace(/([A-Z]+[0-9]+):([A-Z]+[0-9]+)/g, (match, start, end) => {
            return expandRange(start, end).join(',');
        });

        // 2. Handle Functions
        // We will replace SUM(x,y,z) with (x+y+z) logic or use a math evaluator.
        // For simplicity and safety, we'll implement specific function parsers or regex replacements
        // before general evaluation, OR use a Function constructor with a restricted context.
        // Given the requirement, let's process functions first.

        // SUM(...)
        while(expr.includes('SUM(')) {
            expr = expr.replace(/SUM\(([^)]+)\)/g, (match, args) => {
                const values = args.split(',').map(arg => parseFloat(evaluateExpression(arg, data)));
                const sum = values.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
                return sum.toString();
            });
        }

        // AVERAGE(...)
        while(expr.includes('AVERAGE(')) {
            expr = expr.replace(/AVERAGE\(([^)]+)\)/g, (match, args) => {
                const values = args.split(',').map(arg => parseFloat(evaluateExpression(arg, data)));
                const validValues = values.filter(v => !isNaN(v));
                if (validValues.length === 0) return '0';
                const sum = validValues.reduce((a, b) => a + b, 0);
                return (sum / validValues.length).toString();
            });
        }

        // MAX(...)
        while(expr.includes('MAX(')) {
            expr = expr.replace(/MAX\(([^)]+)\)/g, (match, args) => {
                const values = args.split(',').map(arg => parseFloat(evaluateExpression(arg, data)));
                const validValues = values.filter(v => !isNaN(v));
                return validValues.length ? Math.max(...validValues).toString() : '0';
            });
        }

         // MIN(...)
         while(expr.includes('MIN(')) {
            expr = expr.replace(/MIN\(([^)]+)\)/g, (match, args) => {
                const values = args.split(',').map(arg => parseFloat(evaluateExpression(arg, data)));
                const validValues = values.filter(v => !isNaN(v));
                return validValues.length ? Math.min(...validValues).toString() : '0';
            });
        }

        // 3. Evaluate basic math
        return evaluateExpression(expr, data);
    }

    // Evaluate an expression that may contain cell references and math operators
    function evaluateExpression(expr: string, data: Record<string, string>): string {
        // Replace Cell References (A1) with their values
        // We use a regex to find standalone cell IDs (e.g. A1, B12)
        // We need to be careful not to infinite loop. Ideally we pass a visited set, but let's assume simple DAG.
        let parsedExpr = expr.replace(/[A-Z]+[0-9]+/g, (match) => {
            const val = data[match];
            if (val === undefined) return '0';
            if (val.startsWith('=')) {
                // Recursion! (Simple protection: don't go too deep or trust JS stack overflow)
                // In a robust app, we'd pass a 'visited' set.
                // Here we will just try to parse it. If it cycles, the browser stack will eventually error.
                // For this demo, let's assume no cycles.
                return evaluateFormula(val.substring(1), data);
            }
            return isNaN(parseFloat(val)) ? '0' : val;
        });

        // Safe evaluation of "500+200"
        try {
            // Sanitize to only allow numbers and operators
            if (!/^[0-9+\-*/().\s]+$/.test(parsedExpr)) {
                return '#VALUE';
            }
            // eslint-disable-next-line no-new-func
            return new Function('return ' + parsedExpr)().toString();
        } catch (e) {
            return '#ERR';
        }
    }

    function expandRange(start: string, end: string): string[] {
        const startCol = start.match(/[A-Z]+/)?.[0] || 'A';
        const startRow = parseInt(start.match(/[0-9]+/)?.[0] || '1');
        const endCol = end.match(/[A-Z]+/)?.[0] || 'A';
        const endRow = parseInt(end.match(/[0-9]+/)?.[0] || '1');

        const cellsInRange: string[] = [];
        const startColIdx = colLabels.indexOf(startCol);
        const endColIdx = colLabels.indexOf(endCol);

        const minCol = Math.min(startColIdx, endColIdx);
        const maxCol = Math.max(startColIdx, endColIdx);
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);

        for (let c = minCol; c <= maxCol; c++) {
            for (let r = minRow; r <= maxRow; r++) {
                cellsInRange.push(`${colLabels[c]}${r}`);
            }
        }
        return cellsInRange;
    }


	function selectCell(cellId: string) {
		selectedCell = cellId;
		formulaBar = cells[cellId] || '';
		onAction('select-cell', { cellId });
	}

	function updateCell(value: string) {
		if (selectedCell) {
			cells[selectedCell] = value;
            // Recalculate everything (svelte reactivity on 'cells' handles UI, but we need to notify lesson)
            const calculatedValue = value.startsWith('=') ? getCellValue(selectedCell) : value;

			onAction('update-cell', {
                cellId: selectedCell,
                value,
                calculatedValue
            });

            // Iterate over all OTHER cells to see if they need to update
            // This is O(N) where N is number of cells with content.
            // For a small grid (20x8), this is fast enough.
            Object.keys(cells).forEach(otherCellId => {
                if (otherCellId !== selectedCell) {
                    const val = cells[otherCellId];
                    if (val && val.startsWith('=')) {
                        // This is a formula cell. It MIGHT depend on the changed cell.
                        // We re-evaluate and emit an update event for it.
                        // Optimization: check if formula contains the cell ID?
                        // But ranges make that hard (SUM(A1:A5) contains A3 implicitly).
                        // So we just re-evaluate all formulas.
                        const newVal = getCellValue(otherCellId);
                        onAction('update-cell', {
                            cellId: otherCellId,
                            value: val,
                            calculatedValue: newVal
                        });
                    }
                }
            });

			// Check for formulas
			if (value.startsWith('=')) {
				handleFormula(selectedCell, value);
			}
		}
	}

	function handleFormula(cellId: string, formula: string) {
        // We notify generic formula entry
        // The Lesson logic can verify the exact formula or the result
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

    function toggleStyle(prop: keyof CellStyle, value?: any) {
        if(!selectedCell) return;

        const current = cellStyles[selectedCell] || { bold: false, italic: false, underline: false, align: 'left' };
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
        <Button variant="ghost" size="icon" title="Συναρτήσεις" onclick={() => formulaBar = '='}>
            <Calculator class="h-4 w-4" />
        </Button>
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
						<td class="border bg-slate-100 text-center text-slate-500 text-xs">{rowNum}</td>
						{#each colLabels as col}
							{@const cellId = `${col}${rowNum}`}
                            {@const style = cellStyles[cellId]}
                            {@const isSelected = selectedCell === cellId}
                            {@const displayValue = isSelected ? (cells[cellId] || '') : getCellValue(cellId)}
							<td
								class="border p-0 {isSelected ? 'ring-2 ring-green-500 z-10' : ''}"
								onclick={() => selectCell(cellId)}
							>
								<input
									type="text"
									class="h-full w-full px-2 py-1 outline-none bg-transparent
                                    {style?.bold ? 'font-bold' : ''}
                                    {style?.italic ? 'italic' : ''}
                                    {style?.underline ? 'underline' : ''}
                                    {style?.align === 'center' ? 'text-center' : style?.align === 'right' ? 'text-right' : 'text-left'}
                                    "
									value={displayValue}
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
