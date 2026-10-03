<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardDescription } from '$lib/components/ui/card';
	import {
		Globe,
		Search,
		ArrowLeft,
		ArrowRight,
		RefreshCw,
		Plus,
		X,
		Star,
		History
	} from '@lucide/svelte';
	import LessonTemplate from '../LessonTemplate.svelte';
	import { checkGoalMatch } from '$lib/lessons/goalHandlers';
	import { isValidGoalId, type GoalId } from '$lib/lessons/goals';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	const config = lesson.config as {
		goal?: string;
		action?: string;
		initialTabs?: string[];
		targetSite?: string;
		targetUrl?: string;
		/** Pages already visited in the first tab, oldest first; the last one is shown. */
		initialHistory?: string[];
	} | null;
	const action = config?.goal || config?.action || 'new-tab';
	const goal = (isValidGoalId(action) ? action : 'new-tab') as GoalId;

	type PageType = 'home' | 'search' | 'news' | 'weather' | 'gov' | 'history';
	type Tab = {
		id: number;
		title: string;
		url: string;
		type: PageType;
		// This tab's own Back/Forward list.
		stack: string[];
		stackIndex: number;
	};

	function pageFor(url: string): { type: PageType; title: string } {
		if (url === 'home') return { type: 'home', title: 'Αρχική' };
		if (url === 'history') return { type: 'history', title: 'Ιστορικό' };
		if (url.includes('news') || url.includes('eidiseis'))
			return { type: 'news', title: 'Ειδήσεις' };
		if (url.includes('weather') || url.includes('kairos'))
			return { type: 'weather', title: 'Καιρός' };
		if (url.includes('gov')) return { type: 'gov', title: 'Gov.gr' };
		return { type: 'search', title: url };
	}

	function makeTab(id: number, stack: string[]): Tab {
		const url = stack[stack.length - 1];
		return { id, url, ...pageFor(url), stack, stackIndex: stack.length - 1 };
	}

	function buildInitialTabs(): Tab[] {
		if (config?.initialHistory?.length) return [makeTab(1, [...config.initialHistory])];
		const initial: string[] = config?.initialTabs || [];
		if (initial.length === 0) return [makeTab(1, ['home'])];
		return initial.map((url, i) => makeTab(i + 1, [url]));
	}

	// Pages visited in this lesson, newest first — what the history page lists.
	type Visit = { url: string; title: string };
	function initialVisits(): Visit[] {
		const urls = config?.initialHistory ?? config?.initialTabs ?? [];
		return urls
			.filter((url) => url !== 'home' && url !== 'history')
			.map((url) => ({ url, title: pageFor(url).title }))
			.reverse();
	}
	let visits = $state<Visit[]>(initialVisits());
	let wentBack = $state(false);

	let tabs = $state<Tab[]>(buildInitialTabs());
	let activeTabId = $state(1);
	let addressBarInput = $state('');
	let searchBarInput = $state('');
	let completed = $state(false);
	let bookmarkedSites = $state<string[]>([]);

	let activeTab = $derived(tabs.find((t) => t.id === activeTabId) || tabs[0]);

	function addTab() {
		const newId = Math.max(...tabs.map((t) => t.id)) + 1;
		tabs.push({ ...makeTab(newId, ['home']), title: 'Νέα καρτέλα' });
		activeTabId = newId;
		addressBarInput = '';
		searchBarInput = '';

		if (action === 'new-tab' && !completed) {
			checkCompletion();
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

		if (action === 'close-tab' && !completed) {
			checkCompletion();
		}
	}

	function showPage(tab: Tab, url: string) {
		Object.assign(tab, { url, ...pageFor(url) });
		addressBarInput = tab.type === 'home' || tab.type === 'history' ? '' : url;
	}

	function navigate(url: string) {
		const tab = tabs.find((t) => t.id === activeTabId);
		if (tab) {
			tab.stack = [...tab.stack.slice(0, tab.stackIndex + 1), url];
			tab.stackIndex = tab.stack.length - 1;
			showPage(tab, url);
			if (tab.type !== 'home' && tab.type !== 'history') {
				visits = [{ url, title: tab.title }, ...visits.filter((v) => v.url !== url)];
			}
		}

		if (action === 'navigate' && url.includes('.') && !completed) {
			checkCompletion();
		}
		if (url === 'history' && !completed && checkGoalMatch(goal, 'open-history', {}, {})) {
			checkCompletion();
		}
	}

	function goBack() {
		const tab = activeTab;
		if (tab.stackIndex === 0) return;
		tab.stackIndex -= 1;
		showPage(tab, tab.stack[tab.stackIndex]);
		wentBack = true;
	}

	function goForward() {
		const tab = activeTab;
		if (tab.stackIndex >= tab.stack.length - 1) return;
		tab.stackIndex += 1;
		showPage(tab, tab.stack[tab.stackIndex]);
		if (!completed && checkGoalMatch(goal, 'forward', { afterBack: wentBack }, {})) {
			checkCompletion();
		}
	}

	function handleSearch() {
		if (searchBarInput.trim()) {
			if (action === 'search' && !completed) {
				checkCompletion();
			}
			navigate('search?q=' + searchBarInput);
		}
	}

	function switchTab(id: number) {
		activeTabId = id;
		const tab = tabs.find((t) => t.id === id);
		if (tab) {
			addressBarInput = tab.type === 'home' || tab.type === 'history' ? '' : tab.url;
		}

		if ((action === 'switch-tab' || action === 'switch-tabs') && tabs.length > 1 && !completed) {
			checkCompletion();
		}
	}

	function bookmarkSite() {
		if (activeTab.url && !bookmarkedSites.includes(activeTab.url)) {
			bookmarkedSites.push(activeTab.url);
			toast.success('Προστέθηκε στα Αγαπημένα!');

			if (
				action === 'bookmark' &&
				activeTab.url.includes(config?.targetSite || 'gov') &&
				!completed
			) {
				checkCompletion();
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

	const instructions = {
		'new-tab': 'Κάνε κλικ στο κουμπί "+" για να ανοίξεις μια νέα καρτέλα.',
		navigate: `Γράψε "${config?.targetUrl || 'news.gr'}" στη γραμμή διευθύνσεων και πάτησε Enter.`,
		search: 'Κάνε αναζήτηση γράφοντας "καιρός" στο Google.',
		'switch-tab': 'Άλλαξε καρτέλα κάνοντας κλικ σε μια άλλη καρτέλα από αυτή που είσαι.',
		'switch-tabs': 'Άλλαξε καρτέλα κάνοντας κλικ σε μια άλλη καρτέλα από αυτή που είσαι.',
		'close-tab': 'Κλείσε μια καρτέλα πατώντας το X δίπλα στο όνομά της.',
		bookmark: `Πρόσθεσε στα Αγαπημένα το ${config?.targetSite || 'gov.gr'}.`,
		'open-history':
			'Άνοιξε το Ιστορικό: πάτησε το εικονίδιο με το ρολόι, πάνω δεξιά δίπλα στο αστέρι. Θα δεις τις σελίδες που επισκέφτηκες.',
		'back-forward':
			'Είσαι στη σελίδα «Καιρός». Πάτησε το βελάκι «Πίσω» (←), πάνω αριστερά, για να γυρίσεις στις «Ειδήσεις». Μετά πάτησε το βελάκι «Μπροστά» (→) για να ξαναπάς στον «Καιρό».'
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
			<!-- Browser Simulator -->
			<div
				class="flex h-[500px] w-full flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl"
			>
				<!-- 1. Tab Bar -->
				<div class="flex items-end gap-1 border-b border-slate-300 bg-slate-100 px-2 pt-2">
					{#each tabs as tab (tab.id)}
						<div
							class="group relative flex cursor-pointer items-center gap-2 rounded-t-lg py-0 pr-0 pl-4 text-sm transition-colors select-none
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
							<!-- Always visible: a close button that appears only on hover cannot
							     be found by a learner who does not know it is there. -->
							<button
								class="flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-300"
								onclick={(e) => closeTab(tab.id, e)}
								title="Κλείσιμο καρτέλας"
								aria-label="Κλείσιμο καρτέλας"
							>
								<X class="h-4 w-4" />
							</button>
						</div>
					{/each}
					<button
						class="mb-1 flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-200"
						onclick={addTab}
						title="Νέα καρτέλα"
						aria-label="Νέα καρτέλα"
					>
						<Plus class="h-5 w-5 text-slate-600" />
					</button>
				</div>

				<!-- 2. Toolbar (Address Bar) -->
				<div class="flex items-center gap-2 border-b border-slate-200 bg-white p-2">
					<div class="flex items-center gap-1 text-slate-600">
						<button
							class="flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent"
							onclick={goBack}
							disabled={activeTab.stackIndex === 0}
							title="Πίσω"
							aria-label="Πίσω"
						>
							<ArrowLeft class="h-5 w-5" />
						</button>
						<button
							class="flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent"
							onclick={goForward}
							disabled={activeTab.stackIndex >= activeTab.stack.length - 1}
							title="Μπροστά"
							aria-label="Μπροστά"
						>
							<ArrowRight class="h-5 w-5" />
						</button>
						<RefreshCw class="h-5 w-5 text-slate-400" />
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
					<button
						class="flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100"
						onclick={bookmarkSite}
						title="Προσθήκη στα Αγαπημένα"
						aria-label="Προσθήκη στα Αγαπημένα"
					>
						<Star
							class="h-5 w-5 {bookmarkedSites.includes(activeTab.url)
								? 'fill-yellow-400 text-yellow-400'
								: 'text-slate-400'}"
						/>
					</button>
					<button
						class="flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100 {activeTab.type ===
						'history'
							? 'bg-slate-100'
							: ''}"
						onclick={() => navigate('history')}
						title="Ιστορικό"
						aria-label="Ιστορικό"
					>
						<History class="h-5 w-5 text-slate-600" />
					</button>
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
								<h2 class="text-2xl font-bold">Νέα πλατφόρμα εκπαίδευσης για αρχάριους</h2>
								<p class="leading-relaxed text-slate-700">
									Μια νέα πρωτοποριακή εφαρμογή βοηθάει τους χρήστες να εξοικειωθούν με την
									τεχνολογία...
								</p>
							</article>
						</div>
					{:else if activeTab.type === 'gov'}
						<!-- Gov.gr Simulator -->
						<div class="mx-auto min-h-full max-w-4xl bg-white p-8">
							<header class="mb-8 border-b-4 border-blue-600 pb-4">
								<h1 class="text-3xl font-bold text-blue-900">Gov.gr</h1>
								<p class="mt-2 text-slate-600">Ενιαία Ψηφιακή Πύλη της Δημόσιας Διοίκησης</p>
							</header>
							<div class="grid grid-cols-2 gap-6">
								<div class="rounded-lg border-2 border-slate-200 p-6 hover:border-blue-500">
									<h3 class="mb-2 font-bold">Υπηρεσίες Πολιτών</h3>
									<p class="text-sm text-slate-600">Βρείτε υπηρεσίες και πληροφορίες</p>
								</div>
								<div class="rounded-lg border-2 border-slate-200 p-6 hover:border-blue-500">
									<h3 class="mb-2 font-bold">Ψηφιακή Ταυτότητα</h3>
									<p class="text-sm text-slate-600">Είσοδος στις υπηρεσίες</p>
								</div>
							</div>
						</div>
					{:else if activeTab.type === 'history'}
						<div class="mx-auto min-h-full max-w-3xl bg-white p-8">
							<h1 class="mb-6 text-3xl font-bold text-slate-900">Ιστορικό</h1>
							{#if visits.length}
								<ul class="divide-y rounded-lg border">
									{#each visits as visit (visit.url)}
										<li>
											<button
												class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
												onclick={() => navigate(visit.url)}
											>
												<Globe class="h-5 w-5 shrink-0 text-slate-400" />
												<span class="font-medium text-slate-900">{visit.title}</span>
												<span class="truncate text-sm text-slate-500">{visit.url}</span>
											</button>
										</li>
									{/each}
								</ul>
							{:else}
								<p class="text-slate-500">Δεν έχετε επισκεφτεί ακόμα καμία σελίδα.</p>
							{/if}
						</div>
					{:else if activeTab.type === 'weather'}
						<div class="mx-auto min-h-full max-w-3xl bg-white p-8 shadow-sm">
							<h1 class="mb-4 text-3xl font-bold text-sky-700">Καιρός</h1>
							<p class="text-lg text-slate-700">Αθήνα: ηλιοφάνεια, 24°C</p>
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
</LessonTemplate>
