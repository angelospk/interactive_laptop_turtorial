<script lang="ts">
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
	let isBoldActive = $state(false);
	let isItalicActive = $state(false);
	let isUnderlineActive = $state(false);
	let currentAlign = $state<'left' | 'center' | 'right'>('left');

	function countWords(text: string): number {
		return text.trim() ? text.trim().split(/\s+/).length : 0;
	}

	let wordCount = $state(countWords(initialText || (config.initialText as string) || ''));

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
		isBoldActive = !isBoldActive;
		onAction('format-bold', {});
	}

	function handleItalic() {
		execCmd('italic');
		isItalicActive = !isItalicActive;
		onAction('format-italic', {});
	}

	function handleUnderline() {
		execCmd('underline');
		isUnderlineActive = !isUnderlineActive;
		onAction('format-underline', {});
	}

	function handleAlign(align: 'left' | 'center' | 'right') {
		const cmd = align === 'left' ? 'justifyLeft' : align === 'center' ? 'justifyCenter' : 'justifyRight';
		execCmd(cmd);
		currentAlign = align;
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
		wordCount = countWords(text);
		onAction('update-text', { text });
	}

	// Prevent toolbar clicks from stealing the editor's text selection
	function keepSelection(e: MouseEvent) {
		e.preventDefault();
	}

	const ribbonBtn =
		'flex h-7 w-7 items-center justify-center rounded-sm text-slate-700 transition-colors hover:bg-[#d0d0ce]';
	const ribbonBtnActive = 'bg-[#cce4f7] text-[#2B579A] hover:bg-[#b8d9f2]';
</script>

<div class="flex h-full flex-col overflow-hidden bg-white">
	<!-- Title bar (decorative) -->
	<div class="flex items-center gap-2 bg-[#2B579A] px-3 py-1.5 select-none">
		<span
			class="flex h-5 w-5 items-center justify-center rounded-sm bg-white/15 font-serif text-sm font-bold text-white"
			aria-hidden="true">W</span
		>
		<!-- Quick Access: Save -->
		<button
			type="button"
			class="flex h-6 w-6 items-center justify-center rounded-sm text-white hover:bg-white/20"
			onclick={handleSave}
			title="Αποθήκευση"
			aria-label="Αποθήκευση"
		>
			<Save class="h-3.5 w-3.5" />
		</button>
		<span class="flex-1 text-center text-sm text-white">Έγγραφο1 - Word</span>
		<span class="w-11" aria-hidden="true"></span>
	</div>

	<!-- Tab row (visual only, except Κεντρική is the active tab) -->
	<div class="flex items-end gap-0.5 bg-[#2B579A] px-2 select-none">
		<span class="cursor-default px-3 py-1 text-xs text-white hover:bg-white/15">Αρχείο</span>
		<span class="rounded-t-sm bg-[#f3f2f1] px-3 py-1 text-xs font-medium text-[#2B579A]"
			>Κεντρική</span
		>
		<span class="cursor-default px-3 py-1 text-xs text-white hover:bg-white/15">Εισαγωγή</span>
	</div>

	<!-- Ribbon -->
	<div class="flex items-stretch gap-1 border-b border-[#d0d0ce] bg-[#f3f2f1] px-2 pt-1.5 pb-0.5">
		<!-- Group: Γραμματοσειρά -->
		<div class="flex flex-col">
			<div class="flex items-center gap-1 px-1 py-0.5">
				<select
					class="h-7 rounded-sm border border-[#c8c6c4] bg-white px-1 text-sm"
					value={fontSize}
					onchange={(e) => handleFontSize(e.currentTarget.value)}
					title="Μέγεθος γραμματοσειράς"
					aria-label="Μέγεθος γραμματοσειράς"
				>
					{#each fontSizes as size (size)}
						<option value={size}>{size}</option>
					{/each}
				</select>
				<button
					type="button"
					class={[ribbonBtn, isBoldActive && ribbonBtnActive]}
					onmousedown={keepSelection}
					onclick={handleBold}
					title="Έντονα (Bold)"
					aria-label="Έντονα (Bold)"
					aria-pressed={isBoldActive}
				>
					<Bold class="h-4 w-4" />
				</button>
				<button
					type="button"
					class={[ribbonBtn, isItalicActive && ribbonBtnActive]}
					onmousedown={keepSelection}
					onclick={handleItalic}
					title="Πλάγια (Italic)"
					aria-label="Πλάγια (Italic)"
					aria-pressed={isItalicActive}
				>
					<Italic class="h-4 w-4" />
				</button>
				<button
					type="button"
					class={[ribbonBtn, isUnderlineActive && ribbonBtnActive]}
					onmousedown={keepSelection}
					onclick={handleUnderline}
					title="Υπογράμμιση (Underline)"
					aria-label="Υπογράμμιση (Underline)"
					aria-pressed={isUnderlineActive}
				>
					<Underline class="h-4 w-4" />
				</button>
			</div>
			<div class="pb-0.5 text-center text-[10px] text-slate-500 select-none">Γραμματοσειρά</div>
		</div>

		<div class="my-1 w-px bg-[#d0d0ce]"></div>

		<!-- Group: Παράγραφος -->
		<div class="flex flex-col">
			<div class="flex items-center gap-1 px-1 py-0.5">
				<button
					type="button"
					class={[ribbonBtn, currentAlign === 'left' && ribbonBtnActive]}
					onmousedown={keepSelection}
					onclick={() => handleAlign('left')}
					title="Αριστερά"
					aria-label="Αριστερά"
					aria-pressed={currentAlign === 'left'}
				>
					<AlignLeft class="h-4 w-4" />
				</button>
				<button
					type="button"
					class={[ribbonBtn, currentAlign === 'center' && ribbonBtnActive]}
					onmousedown={keepSelection}
					onclick={() => handleAlign('center')}
					title="Κέντρο"
					aria-label="Κέντρο"
					aria-pressed={currentAlign === 'center'}
				>
					<AlignCenter class="h-4 w-4" />
				</button>
				<button
					type="button"
					class={[ribbonBtn, currentAlign === 'right' && ribbonBtnActive]}
					onmousedown={keepSelection}
					onclick={() => handleAlign('right')}
					title="Δεξιά"
					aria-label="Δεξιά"
					aria-pressed={currentAlign === 'right'}
				>
					<AlignRight class="h-4 w-4" />
				</button>
				<button
					type="button"
					class={[ribbonBtn, isBulletActive && ribbonBtnActive]}
					onmousedown={keepSelection}
					onclick={handleBulletList}
					title="Λίστα με κουκίδες"
					aria-label="Λίστα με κουκίδες"
					aria-pressed={isBulletActive}
				>
					<List class="h-4 w-4" />
				</button>
			</div>
			<div class="pb-0.5 text-center text-[10px] text-slate-500 select-none">Παράγραφος</div>
		</div>
	</div>

	<!-- Editor area -->
	<div class="flex flex-1 justify-center overflow-auto bg-[#e9e9e9] px-4 py-6">
		<div
			class="min-h-full w-full max-w-2xl bg-white px-16 py-14 shadow-md outline-none"
			style="font-size: {fontSize}px; min-height: 600px; aspect-ratio: 210 / 297; font-family: Calibri, 'Segoe UI', Candara, Arial, sans-serif;"
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

	<!-- Status bar (display only) -->
	<div
		class="flex items-center justify-between border-t border-[#d0d0ce] bg-[#f3f2f1] px-3 py-0.5 text-xs text-slate-600 select-none"
	>
		<span>Λέξεις: {wordCount}</span>
		<span>100%</span>
	</div>
</div>
