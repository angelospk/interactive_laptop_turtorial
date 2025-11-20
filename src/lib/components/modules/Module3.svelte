<script lang="ts">
	import { gameState } from '$lib/gameStore.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import { toast } from 'svelte-sonner';
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
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';

	// Exercise state
	let currentStep = $state(0);
	let completedSteps = $state<boolean[]>([false, false, false, false, false, false]);

	let windowState = $state({
		isOpen: false,
		isMaximized: false,
		isMinimized: false,
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

	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };

	// Track exercise completion
	function markStepComplete(step: number) {
		if (!completedSteps[step]) {
			completedSteps[step] = true;
			const progress = ((step + 1) / 6) * 100;
			gameState.updateProgress('module3', progress);

			if (step < 5) {
				currentStep = step + 1;
				toast.success(`Βήμα ${step + 1} ολοκληρώθηκε! Συνέχισε στο επόμενο.`);
			} else {
				toast.success('🎉 Συγχαρητήρια! Ολοκλήρωσες όλες τις ασκήσεις του Module 3!');
			}
		}
	}

	// Window Actions
	function openWindow() {
		if (currentStep === 0) {
			windowState.isOpen = true;
			windowState.isMinimized = false;
			toast.info('Άνοιξες την εφαρμογή!');
			markStepComplete(0);
		}
	}

	function minimize() {
		if (currentStep === 1 && windowState.isOpen) {
			windowState.isMinimized = true;
			toast('Ελαχιστοποίηση: Κοίτα κάτω στην μπάρα!');
			markStepComplete(1);
		}
	}

	function restoreFromTaskbar() {
		if (windowState.isMinimized) {
			windowState.isMinimized = false;
			if (currentStep === 2) {
				toast.success('Επαναφορά από τη μπάρα εργασιών!');
				markStepComplete(2);
			}
		}
	}

	function toggleMaximize() {
		if (currentStep === 3 && windowState.isOpen && !windowState.isMinimized) {
			windowState.isMaximized = !windowState.isMaximized;
			const action = windowState.isMaximized ? 'μεγιστοποιήθηκε' : 'επανέφερε το μέγεθος';
			toast.success(`Το παράθυρο ${action}!`);
			markStepComplete(3);
		}
	}

	function closeWindow() {
		if (currentStep === 4 && windowState.isOpen) {
			windowState.isOpen = false;
			toast('Το παράθυρο έκλεισε.');
			markStepComplete(4);
		}
	}

	function toggleQuickSettings() {
		quickSettingsOpen = !quickSettingsOpen;
	}

	$effect(() => {
		if (currentStep === 5 && settings.volume[0] === 50) {
			markStepComplete(5);
		}
	});

	// Dragging Logic
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

	// Instructions for each step
	const steps = [
		{
			title: 'Βήμα 1: Άνοιγμα Εφαρμογής',
			description:
				'Κάνε κλικ στο κουμπί "📝 Σημειωματάριο" στην μπάρα εργασιών κάτω για να ανοίξεις την εφαρμογή.'
		},
		{
			title: 'Βήμα 2: Ελαχιστοποίηση',
			description:
				'Κάνε κλικ στο κουμπί με τη γραμμή (-) στην πάνω δεξιά γωνία του παραθύρου για να το ελαχιστοποιήσεις.'
		},
		{
			title: 'Βήμα 3: Επαναφορά από Taskbar',
			description:
				'Κάνε κλικ ξανά στο "📝 Σημειωματάριο" στην μπάρα εργασιών για να επαναφέρεις το παράθυρο.'
		},
		{
			title: 'Βήμα 4: Μεγιστοποίηση',
			description:
				'Κάνε κλικ στο κουμπί με το τετράγωνο (☐) για να μεγιστοποιήσεις το παράθυρο σε πλήρη οθόνη.'
		},
		{
			title: 'Βήμα 5: Κλείσιμο',
			description: 'Κάνε κλικ στο κουμπί με το X (κόκκινο) για να κλείσεις την εφαρμογή.'
		},
		{
			title: 'Βήμα 6: Ρυθμίσεις',
			description:
				'Άνοιξε τις Γρήγορες Ρυθμίσεις (κάτω δεξιά, εικονίδια Wifi/Ήχου) και βάλε την ένταση στο 50%.'
		}
	];
</script>

<div class="space-y-6">
	<!-- Instructions Card -->
	<Card>
		<CardHeader>
			<CardTitle>Μάθημα 3: Διαχείριση Παραθύρων & Ρυθμίσεις</CardTitle>
			<CardDescription>
				Μάθε πώς να διαχειρίζεσαι παράθυρα και τις βασικές ρυθμίσεις του υπολογιστή.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<!-- Progress Indicator -->
				<div class="rounded-lg bg-slate-100 p-4">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm font-medium">Πρόοδος</span>
						<span class="text-sm text-slate-600"
							>{completedSteps.filter(Boolean).length}/6 ολοκληρώθηκαν</span
						>
					</div>
					<div class="h-2 w-full overflow-hidden rounded-full bg-slate-200">
						<div
							class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
							style="width: {(completedSteps.filter(Boolean).length / 6) * 100}%"
						></div>
					</div>
				</div>

				<!-- Current Step Instructions -->
				<div class="rounded-lg border-2 border-blue-500 bg-blue-50 p-6">
					<div class="mb-2 flex items-center gap-2">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white"
						>
							{currentStep + 1}
						</div>
						<h3 class="text-lg font-bold text-blue-900">{steps[currentStep].title}</h3>
					</div>
					<p class="text-slate-700">{steps[currentStep].description}</p>

					{#if currentStep === 0}
						<div class="mt-3 text-sm text-slate-600">
							💡 <strong>Συμβουλή:</strong> Η μπάρα εργασιών βρίσκεται στο κάτω μέρος της οθόνης.
						</div>
					{:else if currentStep === 5}
						<div class="mt-3 text-sm text-slate-600">
							💡 <strong>Συμβουλή:</strong> Κάνε κλικ στην περιοχή με το Wifi και το Ηχείο κάτω δεξιά.
							Σύρε τη μπάρα του ήχου στη μέση.
						</div>
					{/if}
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Desktop Simulation -->
	<div
		class="relative h-[600px] w-full overflow-hidden rounded-lg border-4 border-slate-800 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center shadow-2xl"
		onclick={() => {
			if (quickSettingsOpen) quickSettingsOpen = false;
		}}
	>
		<!-- The Window -->
		{#if windowState.isOpen && !windowState.isMinimized}
			<div
				class="absolute flex flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-100"
				style="left: {windowState.isMaximized ? 0 : windowState.x}px; top: {windowState.isMaximized
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
					onclick={() => toast.info('Μενού Έναρξη: Από εδώ ξεκινούν όλα!')}
				>
					<div class="grid grid-cols-2 gap-[2px]">
						<div class="h-1.5 w-1.5 bg-white"></div>
						<div class="h-1.5 w-1.5 bg-white"></div>
						<div class="h-1.5 w-1.5 bg-white"></div>
						<div class="h-1.5 w-1.5 bg-white"></div>
					</div>
				</Button>

				<!-- Taskbar Item (Notepad) -->
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
						>{new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}</span
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
</div>
