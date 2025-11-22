<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardDescription } from '$lib/components/ui/card';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import {
		Folder,
		FileText,
		Image as ImageIcon,
		Trash2,
		Edit,
		Copy,
		ClipboardPaste,
		ArrowLeft,
		Home,
		Scissors
	} from '@lucide/svelte';
	import LessonTemplate from '../LessonTemplate.svelte';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	const config = lesson.config as any;
	const action = config?.action || 'navigate';

	type ItemType = 'folder' | 'image' | 'text';
	type FileSystemItem = {
		id: string;
		name: string;
		type: ItemType;
		parentId: string | null;
	};

	let items = $state<FileSystemItem[]>([
		{ id: '1', name: 'Έγγραφα', type: 'folder', parentId: 'root' },
		{ id: '2', name: 'Εικόνες', type: 'folder', parentId: 'root' },
		{ id: '3', name: 'Λίστα Ψώνια.txt', type: 'text', parentId: 'root' },
		{ id: '4', name: 'Διακοπές.jpg', type: 'image', parentId: 'root' },
		{ id: '5', name: 'Συνταγή Κέικ.txt', type: 'text', parentId: '1' },
		{ id: '6', name: 'Γάτα.jpg', type: 'image', parentId: '2' }
	]);

	let currentFolderId = $state<string>('root');
	let clipboard = $state<{ id: string; action: 'copy' | 'cut' } | null>(null);
	let selectedItemId = $state<string | null>(null);
	let isRenaming = $state(false);
	let isCreatingFolder = $state(false);
	let newItemName = $state('');
	let completed = $state(false);

	let currentItems = $derived(items.filter((i) => i.parentId === currentFolderId));
	let currentPath = $derived(getPath(currentFolderId));

	function getPath(folderId: string): { id: string; name: string }[] {
		if (folderId === 'root') return [{ id: 'root', name: 'Υπολογιστής' }];
		const folder = items.find((i) => i.id === folderId);
		if (!folder) return [{ id: 'root', name: 'Υπολογιστής' }];
		if (folder.parentId === 'root') {
			return [
				{ id: 'root', name: 'Υπολογιστής' },
				{ id: folder.id, name: folder.name }
			];
		}
		return [
			{ id: 'root', name: '...' },
			{ id: folder.id, name: folder.name }
		];
	}

	function navigate(folderId: string) {
		currentFolderId = folderId;
		selectedItemId = null;

		if (action === 'navigate' && folderId === '1') {
			checkCompletion();
		}
	}

	function goUp() {
		if (currentFolderId === 'root') return;
		const folder = items.find((i) => i.id === currentFolderId);
		if (folder && folder.parentId) {
			navigate(folder.parentId);
		} else {
			navigate('root');
		}
	}

	function createFolder() {
		if (newItemName.trim()) {
			items.push({
				id: crypto.randomUUID(),
				name: newItemName,
				type: 'folder',
				parentId: currentFolderId
			});
			toast.success(`Ο φάκελος '${newItemName}' δημιουργήθηκε!`);

			if (action === 'create-folder' && newItemName === config?.targetName) {
				checkCompletion();
			}

			isCreatingFolder = false;
			newItemName = '';
		}
	}

	function deleteItem() {
		if (!selectedItemId) return;
		const item = items.find((i) => i.id === selectedItemId);
		if (item) {
			items = items.filter((i) => i.id !== selectedItemId && i.parentId !== selectedItemId);
			toast.info(`Το '${item.name}' διαγράφηκε.`);

			if (action === 'delete' && item.name === config?.targetFile) {
				checkCompletion();
			}

			selectedItemId = null;
		}
	}

	function renameItem() {
		if (!selectedItemId || !newItemName.trim()) return;
		const item = items.find((i) => i.id === selectedItemId);
		if (item) {
			const oldName = item.name;
			item.name = newItemName;
			toast.success('Μετονομασία επιτυχής!');

			if (action === 'rename' && oldName === config?.oldName && newItemName === config?.newName) {
				checkCompletion();
			}

			isRenaming = false;
			newItemName = '';
		}
	}

	function copyItem(cut = false) {
		if (!selectedItemId) return;
		clipboard = { id: selectedItemId, action: cut ? 'cut' : 'copy' };
		toast.info(cut ? 'Αποκοπή αρχείου.' : 'Αντιγραφή αρχείου.');

		if (action === (cut ? 'cut' : 'copy')) {
			const item = items.find((i) => i.id === selectedItemId);
			if (item && (!config?.targetFile || item.name === config.targetFile)) {
				// Completion will happen on paste
			}
		}
	}

	function pasteItem() {
		if (!clipboard) return;
		const clip = clipboard;
		const item = items.find((i) => i.id === clip.id);
		if (item) {
			if (clip.action === 'cut') {
				item.parentId = currentFolderId;
				toast.success('Μετακίνηση ολοκληρώθηκε!');

				if (action === 'cut' && item.name === config?.targetFile) {
					const targetFolder = items.find((f) => f.name === config?.targetFolder);
					if (targetFolder && currentFolderId === targetFolder.id) {
						checkCompletion();
					}
				}
			} else {
				items.push({
					...item,
					id: crypto.randomUUID(),
					parentId: currentFolderId,
					name: item.name + ' (Αντίγραφο)'
				});
				toast.success('Επικόλληση ολοκληρώθηκε!');
			}

			if (clipboard.action === 'cut') clipboard = null;
		}
	}

	function handleDragStart(e: DragEvent, id: string) {
		e.dataTransfer?.setData('text/plain', id);
		e.dataTransfer!.effectAllowed = 'move';
	}

	function handleDrop(e: DragEvent, targetFolderId: string) {
		e.preventDefault();
		const draggedId = e.dataTransfer?.getData('text/plain');
		if (draggedId && draggedId !== targetFolderId) {
			const item = items.find((i) => i.id === draggedId);
			if (item) {
				item.parentId = targetFolderId;
				toast.success(`Το '${item.name}' μετακινήθηκε.`);

				if (action === 'drag-drop') {
					checkCompletion();
				}
			}
		}
	}

	function checkCompletion() {
		if (!completed) {
			completed = true;
			toast.success('Μπράβο! Ολοκλήρωσες τη δραστηριότητα!');
			setTimeout(() => {
				onComplete(100);
			}, 1000);
		}
	}

	// Get instruction text
	const instructions = {
		navigate: 'Κάνε διπλό κλικ στο φάκελο "Έγγραφα" για να μπεις μέσα.',
		'create-folder': `Δημιούργησε έναν νέο φάκελο με όνομα "${config?.targetName || 'Εργασία'}".`,
		select: 'Κάνε κλικ σε ένα αρχείο για να το επιλέξεις.',
		copy: 'Κάνε δεξί κλικ σε ένα αρχείο και επίλεξε "Αντιγραφή".',
		cut: `Μετάφερε (Αποκοπή & Επικόλληση) το "${config?.targetFile || 'αρχείο'}" στον φάκελο "${config?.targetFolder || 'Έγγραφα'}".`,
		rename: `Μετονόμασε το "${config?.oldName || 'στοιχείο'}" σε "${config?.newName || 'νέο όνομα'}".`,
		delete: `Διέγραψε το αρχείο "${config?.targetFile || 'Διακοπές.jpg'}".`,
		'drag-drop': 'Σύρε ένα αρχείο μέσα σε έναν φάκελο.'
	};
</script>

<LessonTemplate {lesson} {onBack}>
	<Card>
		<CardHeader>
			<CardDescription>
				{instructions[action as keyof typeof instructions]}
			</CardDescription>
		</CardHeader>
		<CardContent>
			<!-- File Explorer UI -->
			<div
				class="flex h-[500px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl"
			>
				<!-- Address Bar -->
				<div class="flex items-center gap-2 border-b bg-slate-100 p-2">
					<Button variant="ghost" size="icon" onclick={goUp} disabled={currentFolderId === 'root'}>
						<ArrowLeft class="h-5 w-5" />
					</Button>
					<div class="flex flex-1 items-center gap-1 rounded border bg-white px-2 py-1 text-sm">
						<Home class="h-4 w-4 text-slate-500" />
						{#each currentPath as part, i}
							{#if i > 0}
								<span class="text-slate-400">/</span>
							{/if}
							<button class="hover:text-blue-600 hover:underline" onclick={() => navigate(part.id)}>
								{part.name}
							</button>
						{/each}
					</div>
				</div>

				<!-- Toolbar -->
				<div class="flex gap-2 border-b bg-slate-50 p-2">
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							isCreatingFolder = true;
							newItemName = '';
						}}
					>
						<Folder class="mr-2 h-4 w-4" /> Νέος Φάκελος
					</Button>
					<div class="h-8 w-px bg-slate-300"></div>
					<Button
						variant="ghost"
						size="icon"
						title="Αποκοπή"
						onclick={() => copyItem(true)}
						disabled={!selectedItemId}
					>
						<Scissors class="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						title="Αντιγραφή"
						onclick={() => copyItem(false)}
						disabled={!selectedItemId}
					>
						<Copy class="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						title="Επικόλληση"
						onclick={pasteItem}
						disabled={!clipboard}
					>
						<ClipboardPaste class="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						title="Μετονομασία"
						onclick={() => {
							if (selectedItemId) {
								isRenaming = true;
								const i = items.find((x) => x.id === selectedItemId);
								if (i) newItemName = i.name;
							}
						}}
						disabled={!selectedItemId}
					>
						<Edit class="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						title="Διαγραφή"
						class="text-red-600 hover:text-red-700"
						onclick={deleteItem}
						disabled={!selectedItemId}
					>
						<Trash2 class="h-4 w-4" />
					</Button>
				</div>

				<!-- Content Area -->
				<ContextMenu.Root>
					<ContextMenu.Trigger class="flex-1 p-4">
						<div
							class="grid h-full grid-cols-4 content-start gap-4"
							ondragover={(e) => e.preventDefault()}
							ondrop={(e) => handleDrop(e, currentFolderId)}
						>
							{#each currentItems as item (item.id)}
								<ContextMenu.Root>
									<ContextMenu.Trigger>
										<div
											class="group flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-transparent p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
											class:bg-blue-100={selectedItemId === item.id}
											class:border-blue-300={selectedItemId === item.id}
											onclick={(e) => {
												e.stopPropagation();
												selectedItemId = item.id;
											}}
											ondblclick={() => {
												if (item.type === 'folder') navigate(item.id);
											}}
											draggable="true"
											ondragstart={(e) => handleDragStart(e, item.id)}
											ondragover={(e) => {
												if (item.type === 'folder') e.preventDefault();
											}}
											ondrop={(e) => {
												if (item.type === 'folder') {
													e.stopPropagation();
													handleDrop(e, item.id);
												}
											}}
										>
											{#if item.type === 'folder'}
												<Folder class="h-12 w-12 fill-yellow-500 text-yellow-500" />
											{:else if item.type === 'image'}
												<ImageIcon class="h-12 w-12 text-purple-500" />
											{:else}
												<FileText class="h-12 w-12 text-blue-500" />
											{/if}
											<span
												class="line-clamp-2 text-center text-sm leading-tight break-all text-slate-700 group-hover:text-blue-700"
											>
												{item.name}
											</span>
										</div>
									</ContextMenu.Trigger>
									<ContextMenu.Content>
										<ContextMenu.Item
											onclick={() => {
												selectedItemId = item.id;
												if (item.type === 'folder') navigate(item.id);
											}}
										>
											<Folder class="mr-2 h-4 w-4" /> Άνοιγμα
										</ContextMenu.Item>
										<ContextMenu.Separator />
										<ContextMenu.Item
											onclick={() => {
												selectedItemId = item.id;
												copyItem(true);
											}}
										>
											<Scissors class="mr-2 h-4 w-4" /> Αποκοπή
										</ContextMenu.Item>
										<ContextMenu.Item
											onclick={() => {
												selectedItemId = item.id;
												copyItem(false);
											}}
										>
											<Copy class="mr-2 h-4 w-4" /> Αντιγραφή
										</ContextMenu.Item>
										<ContextMenu.Separator />
										<ContextMenu.Item
											onclick={() => {
												selectedItemId = item.id;
												isRenaming = true;
												newItemName = item.name;
											}}
										>
											<Edit class="mr-2 h-4 w-4" /> Μετονομασία
										</ContextMenu.Item>
										<ContextMenu.Item
											class="text-red-600"
											onclick={() => {
												selectedItemId = item.id;
												deleteItem();
											}}
										>
											<Trash2 class="mr-2 h-4 w-4" /> Διαγραφή
										</ContextMenu.Item>
									</ContextMenu.Content>
								</ContextMenu.Root>
							{/each}

							<!-- Empty State -->
							{#if currentItems.length === 0}
								<div
									class="col-span-4 flex flex-col items-center justify-center py-12 text-slate-400"
								>
									<Folder class="mb-4 h-16 w-16 opacity-20" />
									<p>Ο φάκελος είναι άδειος</p>
								</div>
							{/if}
						</div>
					</ContextMenu.Trigger>
					<ContextMenu.Content>
						<ContextMenu.Item
							onclick={() => {
								isCreatingFolder = true;
								newItemName = '';
							}}
						>
							<Folder class="mr-2 h-4 w-4" /> Νέος Φάκελος
						</ContextMenu.Item>
						<ContextMenu.Item onclick={pasteItem} disabled={!clipboard}>
							<ClipboardPaste class="mr-2 h-4 w-4" /> Επικόλληση
						</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Root>
			</div>
		</CardContent>
	</Card>

	<!-- Dialogs -->
	<Dialog.Root bind:open={isCreatingFolder}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Δημιουργία Φακέλου</Dialog.Title>
			</Dialog.Header>
			<Input
				bind:value={newItemName}
				placeholder="Όνομα φακέλου..."
				onkeydown={(e) => e.key === 'Enter' && createFolder()}
			/>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (isCreatingFolder = false)}>Άκυρο</Button>
				<Button onclick={createFolder}>Δημιουργία</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={isRenaming}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Μετονομασία</Dialog.Title>
			</Dialog.Header>
			<Input
				bind:value={newItemName}
				placeholder="Νέο όνομα..."
				onkeydown={(e) => e.key === 'Enter' && renameItem()}
			/>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (isRenaming = false)}>Άκυρο</Button>
				<Button onclick={renameItem}>Αποθήκευση</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</LessonTemplate>
