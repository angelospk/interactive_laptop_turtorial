<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Slider } from '$lib/components/ui/slider';
	import {
		Minus,
		Square,
		X,
		GripHorizontal,
		Wifi,
		Bluetooth,
		Volume2,
		Sun,
		Battery
	} from '@lucide/svelte';
	import LessonTemplate from '../LessonTemplate.svelte';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	const config = lesson.config as any;
	const action = config?.action || 'open';

	// Window state
	let windowState = $state({
		isOpen: false,
		isMinimized: false,
		isMaximized: false,
		x: 100,
		y: 50
	});

	let quickSettingsOpen = $state(false);
	let settings = $state({
		wifi: true,
		bluetooth: false,
		volume: [80],
		brightness: [100]
	});

	let completed = $state(false);
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };

	// Actions
	function openWindow() {
		if (action !== 'open' || completed) return;
		windowState.isOpen = true;
		windowState.isMinimized = false;
		completeLesson();
	}

	function minimize() {
		if (action !== 'minimize' || completed) return;
		if (windowState.isOpen && !windowState.isMinimized) {
			windowState.isMinimized = true;
			completeLesson();
		}
	}

	function restoreFromTaskbar() {
		if (action !== 'restore' || completed) return;
		if (windowState.isMinimized) {
			windowState.isMinimized = false;
			completeLesson();
		}
	}

	function toggleMaximize() {
		if (action !== 'maximize' || completed) return;
		if (windowState.isOpen && !windowState.isMinimized) {
			windowState.isMaximized = !windowState.isMaximized;
			completeLesson();
		}
	}

	function closeWindow() {
		if (action !== 'close' || completed) return;
		if (windowState.isOpen) {
			windowState.isOpen = false;
			completeLesson();
		}
	}

	function toggleQuickSettings() {
		quickSettingsOpen = !quickSettingsOpen;
	}

	$effect(() => {
		if (action === 'quick-settings' && !completed && settings.volume[0] === 50) {
			completeLesson();
		}
	});

	function completeLesson() {
		if (!completed) {
			completed = true;
			toast.success('Μπράβο! Ολοκλήρωσες τη δραστηριότητα!');
			setTimeout(() => {
				onComplete(100);
			}, 1000);
		}
	}

	// Dragging
	function startDrag(e: MouseEvent) {
		if (windowState.isMaximized) return;
		isDragging = true;
		dragOffset.x = e.clientX - windowState.x;
		dragOffset.y = e.clientY - windowState.y;
		window.addEventListener('mousemove', onDrag);
		window.addEventListener('mouseup', stopDrag);
	}

	function onDrag(e: MouseEvent) {
		if (!isDragging) return;
		windowState.x = e.clientX - dragOffset.x;
		windowState.y = e.clientY - dragOffset.y;
	}

	function stopDrag() {
		isDragging = false;
		window.removeEventListener('mousemove', onDrag);
		window.removeEventListener('mouseup', stopDrag);
	}

	// Get instruction text based on action
	const instructions = {
		open: 'Κάνε κλικ στο κουμπί "📝 Σημειωματάριο" στην μπάρα εργασιών για να ανοίξεις την εφαρμογή.',
		minimize: 'Κάνε κλικ στο κουμπί (-) στην πάνω δεξιά γωνία για να ελαχιστοποιήσεις το παράθυρο.',
		restore:
			'Κάνε κλικ ξανά στο "📝 Σημειωματάριο" στην μπάρα εργασιών για να επαναφέρεις το παράθυρο.',
		maximize: 'Κάνε κλικ στο κουμπί (☐) για να μεγιστοποιήσεις το παράθυρο.',
		close: 'Κάνε κλικ στο κουμπί (X) για να κλείσεις το παράθυρο.',
		'quick-settings': 'Άνοιξε τις Γρήγορες Ρυθμίσεις (κάτω δεξιά) και βάλε την ένταση στο 50%.'
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
			<!-- Desktop Simulation -->
			<div
				class="relative h-[500px] w-full overflow-hidden rounded-lg border-4 border-slate-800 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center shadow-2xl"
				onclick={() => {
					if (quickSettingsOpen) quickSettingsOpen = false;
				}}
			>
				<!-- The Window -->
				{#if windowState.isOpen && !windowState.isMinimized}
					<div
						class="absolute flex flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-100"
						style="left: {windowState.isMaximized
							? 0
							: windowState.x}px; top: {windowState.isMaximized
							? 0
							: windowState.y}px; width: {windowState.isMaximized
							? '100%'
							: '400px'}; height: {windowState.isMaximized ? '100%' : '300px'};"
						onclick={(e) => e.stopPropagation()}
					>
						<!-- Title Bar -->
						<div
							class="flex h-10 cursor-move items-center justify-between border-b bg-slate-100 px-2 select-none"
							onmousedown={startDrag}
							role="group"
						>
							<div class="flex items-center text-sm text-slate-600">
								<GripHorizontal class="mr-2 h-4 w-4" /> Σημειωματάριο
							</div>
							<div class="flex gap-1">
								<Button
									variant="ghost"
									size="icon"
									class="h-8 w-8 hover:bg-slate-200"
									onclick={minimize}
								>
									<Minus class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									class="h-8 w-8 hover:bg-slate-200"
									onclick={toggleMaximize}
								>
									<Square class="h-4 w-4" />
								</Button>
								<Button variant="destructive" size="icon" class="h-8 w-8" onclick={closeWindow}>
									<X class="h-4 w-4" />
								</Button>
							</div>
						</div>
						<!-- Content -->
						<div class="flex-1 p-4">
							<textarea
								class="h-full w-full resize-none border-none font-mono text-sm outline-none"
								placeholder="Γράψε εδώ τις σημειώσεις σου..."
							></textarea>
						</div>
					</div>
				{/if}

				<!-- Quick Settings Panel -->
				{#if quickSettingsOpen}
					<div
						class="absolute right-4 bottom-14 w-80 animate-in rounded-xl border border-slate-700 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur duration-200 slide-in-from-bottom-5 fade-in"
						onclick={(e) => e.stopPropagation()}
					>
						<div class="mb-6 grid grid-cols-2 gap-4">
							<button
								class="flex h-20 flex-col items-start justify-between rounded-lg p-3 transition-colors {settings.wifi
									? 'bg-blue-600 text-white'
									: 'bg-slate-700 text-slate-300'}"
								onclick={() => (settings.wifi = !settings.wifi)}
							>
								<Wifi class="h-6 w-6" />
								<span class="text-sm font-medium">Wi-Fi</span>
							</button>
							<button
								class="flex h-20 flex-col items-start justify-between rounded-lg p-3 transition-colors {settings.bluetooth
									? 'bg-blue-600 text-white'
									: 'bg-slate-700 text-slate-300'}"
								onclick={() => (settings.bluetooth = !settings.bluetooth)}
							>
								<Bluetooth class="h-6 w-6" />
								<span class="text-sm font-medium">Bluetooth</span>
							</button>
						</div>

						<div class="space-y-6">
							<div class="flex items-center gap-4">
								<Sun class="h-5 w-5 text-slate-400" />
								<Slider bind:value={settings.brightness} max={100} step={1} class="flex-1" />
							</div>
							<div class="flex items-center gap-4">
								<Volume2 class="h-5 w-5 text-slate-400" />
								<Slider bind:value={settings.volume} max={100} step={1} class="flex-1" />
								<span class="w-8 text-right text-sm text-slate-400">{settings.volume[0]}%</span>
							</div>
						</div>

						<div
							class="mt-6 flex items-center justify-between border-t border-slate-700 pt-4 text-xs text-slate-400"
						>
							<div class="flex items-center gap-2">
								<Battery class="h-4 w-4" />
								<span>85%</span>
							</div>
							<button class="hover:text-white">Όλες οι ρυθμίσεις</button>
						</div>
					</div>
				{/if}

				<!-- Taskbar -->
				<div
					class="absolute right-0 bottom-0 left-0 flex h-12 items-center justify-between bg-slate-900/90 px-4 backdrop-blur"
					onclick={(e) => e.stopPropagation()}
				>
					<!-- Start & Apps -->
					<div class="flex items-center gap-2">
						<Button
							variant="secondary"
							class="rounded-sm bg-blue-600 text-white hover:bg-blue-500"
							onclick={() => toast.info('Μενού Έναρξη')}
						>
							<div class="grid grid-cols-2 gap-[2px]">
								<div class="h-1.5 w-1.5 bg-white"></div>
								<div class="h-1.5 w-1.5 bg-white"></div>
								<div class="h-1.5 w-1.5 bg-white"></div>
								<div class="h-1.5 w-1.5 bg-white"></div>
							</div>
						</Button>

						<!-- Taskbar Item -->
						<div class="group relative">
							<Button
								variant="ghost"
								class="bg-slate-700 text-white hover:bg-slate-600"
								onclick={windowState.isMinimized ? restoreFromTaskbar : openWindow}
							>
								📝 Σημειωματάριο
							</Button>
							{#if windowState.isOpen}
								<div class="absolute bottom-0 h-1 w-full rounded-full bg-blue-400"></div>
							{/if}
						</div>
					</div>

					<!-- System Tray -->
					<div class="flex h-full items-center gap-2">
						<button
							class="flex h-full items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-slate-700"
							onclick={toggleQuickSettings}
						>
							<Wifi class="h-4 w-4 text-white" />
							<Volume2 class="h-4 w-4 text-white" />
							<Battery class="h-4 w-4 text-white" />
						</button>
						<div
							class="flex h-full cursor-default flex-col items-end justify-center rounded px-2 text-xs text-white hover:bg-slate-700"
						>
							<span
								>{new Date().toLocaleTimeString('el-GR', {
									hour: '2-digit',
									minute: '2-digit'
								})}</span
							>
							<span
								>{new Date().toLocaleDateString('el-GR', {
									day: '2-digit',
									month: '2-digit',
									year: 'numeric'
								})}</span
							>
						</div>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
</LessonTemplate>
