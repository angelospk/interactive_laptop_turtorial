<script lang="ts">
	import { gameState } from '$lib/gameStore.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Globe, Search, ArrowLeft, ArrowRight, RefreshCw, Plus, X, Home } from '@lucide/svelte';

	// --- State ---
	let currentStep = $state(0);
	let completedSteps = $state<boolean[]>([false, false, false, false]);

	type Tab = {
		id: number;
		title: string;
		url: string;
		type: 'home' | 'search' | 'news' | 'weather' | 'gov';
	};

	let tabs = $state<Tab[]>([{ id: 1, title: 'Αρχική', url: 'home', type: 'home' }]);
	let activeTabId = $state(1);
	let addressBarInput = $state('');
	let searchBarInput = $state('');

	// Derived
	let activeTab = $derived(tabs.find((t) => t.id === activeTabId) || tabs[0]);

	// --- Actions ---

	function addTab() {
		const newId = Math.max(...tabs.map((t) => t.id)) + 1;
		tabs.push({ id: newId, title: 'Νέα καρτέλα', url: '', type: 'search' });
		activeTabId = newId;
		addressBarInput = '';
		searchBarInput = '';

		// Check Step 1: Open new tab
		if (currentStep === 0) {
			completeStep(0, 'Μπράβο! Άνοιξες μια νέα καρτέλα.');
		}
	}

	function closeTab(id: number, e: Event) {
		e.stopPropagation();
		if (tabs.length === 1) {
			toast.error('Δεν μπορείς να κλείσεις την τελευταία καρτέλα!');
			return;
		}
		const index = tabs.findIndex((t) => t.id === id);
		tabs = tabs.filter((t) => t.id !== id);
		if (activeTabId === id) {
			activeTabId = tabs[Math.max(0, index - 1)].id;
		}
	}

	function navigate(url: string) {
		// Simulate navigation
		let type: Tab['type'] = 'search';
		let title = url;

		if (url.includes('news') || url.includes('eidiseis')) {
			type = 'news';
			title = 'Ειδήσεις';
		} else if (url.includes('weather') || url.includes('kairos')) {
			type = 'weather';
			title = 'Καιρός';
		} else if (url.includes('gov')) {
			type = 'gov';
			title = 'Gov.gr';
		}

		const tab = tabs.find((t) => t.id === activeTabId);
		if (tab) {
			tab.url = url;
			tab.type = type;
			tab.title = title;
		}

		// Check Step 2: Navigate to URL
		if (currentStep === 1 && url.includes('.')) {
			completeStep(1, 'Τέλεια! Πλοηγήθηκες σε μια ιστοσελίδα.');
		}
	}

	function handleSearch() {
		if (searchBarInput.trim()) {
			// Check Step 3: Search
			if (currentStep === 2) {
				completeStep(2, 'Ωραία! Έκανες μια αναζήτηση.');
			}
			// Simulate search results navigation
			navigate('search?q=' + searchBarInput);
		}
	}

	function switchTab(id: number) {
		activeTabId = id;
		const tab = tabs.find((t) => t.id === id);
		if (tab) {
			addressBarInput = tab.url === 'home' ? '' : tab.url;
		}

		// Check Step 4: Switch tabs
		if (currentStep === 3 && tabs.length > 1) {
			completeStep(3, 'Άριστα! Έμαθες να αλλάζεις καρτέλες.');
		}
	}

	function completeStep(index: number, message: string) {
		if (!completedSteps[index]) {
			completedSteps[index] = true;
			toast.success(message);
			gameState.updateProgress('module5', ((index + 1) / 4) * 100);
			if (index < 3) {
				currentStep = index + 1;
			} else {
				toast.success('Συγχαρητήρια! Ολοκλήρωσες το μάθημα του Browser!');
			}
		}
	}

	// Instructions
	const steps = [
		{
			title: 'Βήμα 1: Νέα Καρτέλα',
			description:
				'Πάτησε το κουμπί "+" δίπλα στην καρτέλα "Αρχική" για να ανοίξεις μια νέα σελίδα.'
		},
		{
			title: 'Βήμα 2: Γραμμή Διευθύνσεων',
			description: 'Στη πάνω μπάρα (Γραμμή Διευθύνσεων), γράψε "news.gr" και πάτησε Enter.'
		},
		{
			title: 'Βήμα 3: Αναζήτηση',
			description: 'Στο κέντρο της σελίδας (Google), γράψε "καιρός" και πάτησε "Αναζήτηση".'
		},
		{
			title: 'Βήμα 4: Εναλλαγή Καρτελών',
			description: 'Κάνε κλικ στην πρώτη καρτέλα "Αρχική" για να επιστρέψεις εκεί.'
		}
	];
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>5. Ο Περιηγητής (Web Browser)</CardTitle>
			<CardDescription>Μάθε πώς να σερφάρεις στο διαδίκτυο με ασφάλεια.</CardDescription>
		</CardHeader>
		<CardContent>
			<!-- Progress & Instructions (Similar to Module 3) -->
			<div class="mb-6 space-y-4">
				<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
					<h3 class="mb-2 font-bold text-blue-900">{steps[currentStep].title}</h3>
					<p class="text-slate-700">{steps[currentStep].description}</p>
				</div>
			</div>

			<!-- Browser Simulator -->
			<div
				class="flex h-[500px] w-full flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl"
			>
				<!-- 1. Tab Bar -->
				<div class="flex items-end gap-1 border-b border-slate-300 bg-slate-100 px-2 pt-2">
					{#each tabs as tab}
						<div
							class="group relative flex cursor-pointer items-center gap-2 rounded-t-lg px-4 py-2 text-sm transition-colors select-none
                            {activeTabId === tab.id
								? 'bg-white font-medium text-slate-900 shadow-sm'
								: 'bg-slate-200 text-slate-600 hover:bg-slate-300'}"
							onclick={() => switchTab(tab.id)}
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && switchTab(tab.id)}
						>
							<Globe class="h-3 w-3" />
							<span class="max-w-[100px] truncate">{tab.title}</span>
							<button
								class="rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-slate-200"
								onclick={(e) => closeTab(tab.id, e)}
							>
								<X class="h-3 w-3" />
							</button>
						</div>
					{/each}
					<button
						class="mb-1 rounded-full p-2 hover:bg-slate-200"
						onclick={addTab}
						title="Νέα καρτέλα"
					>
						<Plus class="h-4 w-4 text-slate-600" />
					</button>
				</div>

				<!-- 2. Toolbar (Address Bar) -->
				<div class="flex items-center gap-2 border-b border-slate-200 bg-white p-2">
					<div class="flex gap-1 text-slate-400">
						<ArrowLeft class="h-5 w-5" />
						<ArrowRight class="h-5 w-5" />
						<RefreshCw class="h-5 w-5" />
					</div>
					<div class="relative flex-1">
						<div class="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
							{#if activeTab.type === 'search'}
								<Search class="h-4 w-4" />
							{:else}
								<Globe class="h-4 w-4" />
							{/if}
						</div>
						<input
							type="text"
							class="w-full rounded-full bg-slate-100 py-1.5 pr-4 pl-9 text-sm outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Πληκτρολογήστε μια διεύθυνση Web"
							bind:value={addressBarInput}
							onkeydown={(e) => {
								if (e.key === 'Enter') navigate(addressBarInput);
							}}
						/>
					</div>
				</div>

				<!-- 3. Content Area -->
				<div class="relative flex-1 overflow-y-auto bg-slate-50">
					{#if activeTab.type === 'home' || activeTab.type === 'search'}
						<!-- Google Simulator -->
						<div class="flex h-full flex-col items-center justify-center p-4">
							<h1 class="mb-8 text-4xl font-bold text-slate-700">
								<span class="text-blue-500">G</span><span class="text-red-500">o</span><span
									class="text-yellow-500">o</span
								><span class="text-blue-500">g</span><span class="text-green-500">l</span><span
									class="text-red-500">e</span
								>
							</h1>
							<div class="relative w-full max-w-md">
								<Search class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
								<input
									type="text"
									class="w-full rounded-full border border-slate-300 py-3 pr-4 pl-12 shadow-sm outline-none focus:shadow-md"
									placeholder="Αναζήτηση στο Google"
									bind:value={searchBarInput}
									onkeydown={(e) => {
										if (e.key === 'Enter') handleSearch();
									}}
								/>
							</div>
							<div class="mt-6 flex gap-4">
								<Button variant="secondary" onclick={handleSearch}>Αναζήτηση Google</Button>
								<Button variant="ghost">Αισθάνομαι τυχερός</Button>
							</div>
						</div>
					{:else if activeTab.type === 'news'}
						<!-- News Site Simulator -->
						<div class="mx-auto min-h-full max-w-3xl bg-white p-8 shadow-sm">
							<header class="mb-6 border-b pb-4">
								<h1 class="font-serif text-3xl font-bold text-slate-900">Ειδήσεις 24/7</h1>
								<p class="mt-1 text-sm text-slate-500">
									{new Date().toLocaleDateString('el-GR', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</p>
							</header>
							<article class="space-y-4">
								<div class="mb-4 h-48 w-full rounded-lg bg-slate-200"></div>
								<h2 class="text-2xl font-bold">Νέα πλατφόρμα εκπαίδευσης για ηλικιωμένους</h2>
								<p class="leading-relaxed text-slate-700">
									Μια νέα πρωτοποριακή εφαρμογή βοηθάει τους ανθρώπους μεγαλύτερης ηλικίας να
									εξοικειωθούν με την τεχνολογία...
								</p>
							</article>
						</div>
					{:else}
						<!-- Generic Page -->
						<div class="flex h-full items-center justify-center text-slate-400">
							<div class="text-center">
								<Globe class="mx-auto mb-4 h-16 w-16 opacity-20" />
								<p>Φόρτωση σελίδας...</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</CardContent>
	</Card>
</div>
