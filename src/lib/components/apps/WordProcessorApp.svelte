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
		List
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let {
		initialText = '',
		config = {},
		onAction
	} = $props<{
		initialText?: string;
		config?: any;
		onAction: (action: string, data?: any) => void;
	}>();

	let content = $state(initialText || (config.initialText as string) || '');
	let fontSize = $state('14');
	let isBulletActive = $state(false);

	const fontSizes = ['10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36'];

	function execCmd(command: string, value?: string) {
		document.execCommand(command, false, value);
		getEditor()?.focus();
	}

	function getEditor(): HTMLElement | null {
		return document.querySelector('[data-word-editor]');
	}

	function handleBold() {
		execCmd('bold');
		onAction('format-bold', {});
	}

	function handleItalic() {
		execCmd('italic');
		onAction('format-italic', {});
	}

	function handleUnderline() {
		execCmd('underline');
		onAction('format-underline', {});
	}

	function handleAlign(align: 'left' | 'center' | 'right') {
		const cmd = align === 'left' ? 'justifyLeft' : align === 'center' ? 'justifyCenter' : 'justifyRight';
		execCmd(cmd);
		onAction('format-align', { align });
	}

	function handleFontSize(size: string) {
		fontSize = size;
		// execCommand fontSize uses 1-7 scale; we use CSS instead
		const editor = getEditor();
		if (!editor) return;
		const sel = window.getSelection();
		if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
			document.execCommand('fontSize', false, '7');
			editor.querySelectorAll('font[size="7"]').forEach((el) => {
				(el as HTMLElement).removeAttribute('size');
				(el as HTMLElement).style.fontSize = `${size}px`;
			});
		} else {
			editor.style.fontSize = `${size}px`;
		}
		onAction('format-font-size', { size });
	}

	function handleBulletList() {
		execCmd('insertUnorderedList');
		isBulletActive = !isBulletActive;
		onAction('insert-bullet-list', {});
	}

	function handleSave() {
		toast.success('Το έγγραφο αποθηκεύτηκε!');
		onAction('save-document', {});
	}

	function handleInput(e: Event) {
		const editor = e.currentTarget as HTMLElement;
		const text = editor.innerText || '';
		onAction('update-text', { text });
	}
</script>

<div class="flex h-full flex-col overflow-hidden bg-white">
	<!-- Toolbar -->
	<div class="flex flex-wrap items-center gap-1 border-b bg-slate-50 p-2">
		<!-- Save -->
		<Button variant="ghost" size="icon" onclick={handleSave} title="Αποθήκευση">
			<Save class="h-4 w-4" />
		</Button>

		<div class="h-6 w-px bg-slate-300"></div>

		<!-- Font size -->
		<select
			class="h-7 rounded border border-slate-300 bg-white px-1 text-sm"
			value={fontSize}
			onchange={(e) => handleFontSize(e.currentTarget.value)}
		>
			{#each fontSizes as size}
				<option value={size}>{size}</option>
			{/each}
		</select>

		<div class="h-6 w-px bg-slate-300"></div>

		<!-- Formatting -->
		<Button variant="ghost" size="icon" onclick={handleBold} title="Έντονα (Bold)">
			<Bold class="h-4 w-4" />
		</Button>
		<Button variant="ghost" size="icon" onclick={handleItalic} title="Πλάγια (Italic)">
			<Italic class="h-4 w-4" />
		</Button>
		<Button variant="ghost" size="icon" onclick={handleUnderline} title="Υπογράμμιση (Underline)">
			<Underline class="h-4 w-4" />
		</Button>

		<div class="h-6 w-px bg-slate-300"></div>

		<!-- Alignment -->
		<Button variant="ghost" size="icon" onclick={() => handleAlign('left')} title="Αριστερά">
			<AlignLeft class="h-4 w-4" />
		</Button>
		<Button variant="ghost" size="icon" onclick={() => handleAlign('center')} title="Κέντρο">
			<AlignCenter class="h-4 w-4" />
		</Button>
		<Button variant="ghost" size="icon" onclick={() => handleAlign('right')} title="Δεξιά">
			<AlignRight class="h-4 w-4" />
		</Button>

		<div class="h-6 w-px bg-slate-300"></div>

		<!-- Bullet list -->
		<Button
			variant="ghost"
			size="icon"
			class={isBulletActive ? 'bg-slate-200' : ''}
			onclick={handleBulletList}
			title="Λίστα με κουκίδες"
		>
			<List class="h-4 w-4" />
		</Button>
	</div>

	<!-- Ruler (decorative) -->
	<div class="border-b bg-slate-100 px-4 py-0.5 text-xs text-slate-400 select-none">
		Επεξεργασία Κειμένου
	</div>

	<!-- Editor area -->
	<div class="flex flex-1 justify-center overflow-auto bg-slate-200 p-4">
		<div
			class="min-h-full w-full max-w-2xl rounded bg-white p-8 shadow-sm outline-none"
			style="font-size: {fontSize}px; min-height: 600px;"
			contenteditable="true"
			data-word-editor
			oninput={handleInput}
			role="textbox"
			aria-multiline="true"
			aria-label="Επεξεργαστής κειμένου"
		>
			{#if content && !content.includes('<')}
				{@html content.split('\n').map((line: string) => `<p>${line || '<br>'}</p>`).join('')}
			{/if}
		</div>
	</div>
</div>
