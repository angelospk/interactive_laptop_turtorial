<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Globe, Search, ArrowLeft, ArrowRight, RefreshCw, Plus, X, Star, Clock, History } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let {
		config = {},
		onAction
	} = $props<{
		config?: any;
		onAction: (action: string, data?: any) => void;
	}>();

	type Tab = {
		id: number;
		title: string;
		url: string;
		type: 'home' | 'search' | 'news' | 'weather' | 'gov' | 'banking' | 'history';
	};

    type HistoryItem = {
        url: string;
        title: string;
        time: string;
    }

	let tabs = $state<Tab[]>([{ id: 1, title: 'Αρχική', url: 'home', type: 'home' }]);
	let activeTabId = $state(1);
	let addressBarInput = $state('');
	let searchBarInput = $state('');
	let bookmarkedSites = $state<string[]>([]);

    // History State
    let history = $state<HistoryItem[]>([
        { url: 'google.com', title: 'Google', time: '10:00' },
        { url: 'news247.gr', title: 'Ειδήσεις 24/7', time: '09:45' }
    ]);

	let activeTab = $derived(tabs.find((t) => t.id === activeTabId) || tabs[0]);

	function addTab() {
		const newId = Math.max(...tabs.map((t) => t.id)) + 1;
		// Start with empty/home tab
        tabs.push({ id: newId, title: 'Νέα καρτέλα', url: '', type: 'home' });
		activeTabId = newId;
		addressBarInput = '';
		searchBarInput = '';
		onAction('new-tab');
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
		onAction('close-tab');
	}

	function navigate(url: string) {
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
		} else if (url.includes('bank')) {
			type = 'banking';
			title = 'e-Banking';
		} else if (url === 'history') {
            type = 'history';
            title = 'Ιστορικό';
        } else if (url === 'home') {
            type = 'home';
            title = 'Αρχική';
        }

		const tab = tabs.find((t) => t.id === activeTabId);
		if (tab) {
			tab.url = url;
			tab.type = type;
			tab.title = title;
		}

        // Add to history if it's a real page
        if(type !== 'home' && type !== 'history') {
             history.unshift({
                url,
                title,
                time: new Date().toLocaleTimeString('el-GR', {hour: '2-digit', minute: '2-digit'})
             });
        }

		onAction('navigate', { url });
	}

	function handleSearch() {
		if (searchBarInput.trim()) {
			onAction('search', { query: searchBarInput });
			navigate('search?q=' + searchBarInput);
		}
	}

	function switchTab(id: number) {
		activeTabId = id;
		const tab = tabs.find((t) => t.id === id);
		if (tab) {
			addressBarInput = tab.url === 'home' ? '' : tab.url;
		}
		onAction('switch-tab', { id });
	}

	function bookmarkSite() {
		if (activeTab.url && !bookmarkedSites.includes(activeTab.url)) {
			bookmarkedSites.push(activeTab.url);
			toast.success('Προστέθηκε στα Αγαπημένα!');
			onAction('bookmark', { url: activeTab.url });
		}
	}

    function openHistory() {
        addTab();
        navigate('history');
    }
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-white">
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
			<ArrowLeft class="h-5 w-5 hover:text-slate-600 cursor-pointer" />
			<ArrowRight class="h-5 w-5 hover:text-slate-600 cursor-pointer" />
			<RefreshCw class="h-5 w-5 hover:text-slate-600 cursor-pointer" />
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
        <div class="flex items-center">
            <button
                class="rounded-full p-2 hover:bg-slate-100"
                onclick={bookmarkSite}
                title="Προσθήκη στα Αγαπημένα"
            >
                <Star
                    class="h-5 w-5 {bookmarkedSites.includes(activeTab.url)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-400'}"
                />
            </button>
            <button
                class="rounded-full p-2 hover:bg-slate-100"
                onclick={openHistory}
                title="Ιστορικό"
            >
                <History class="h-5 w-5 text-slate-400" />
            </button>
        </div>
	</div>

	<!-- 3. Content Area -->
	<div class="relative flex-1 overflow-y-auto bg-slate-50">
		{#if activeTab.type === 'home'}
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
        {:else if activeTab.type === 'search'}
            <!-- Search Results Simulation -->
             <div class="p-6 max-w-4xl mx-auto bg-white min-h-full">
                <div class="flex items-center gap-4 mb-6 pb-4 border-b">
                    <div class="text-2xl font-bold">
                        <span class="text-blue-500">G</span><span class="text-red-500">o</span><span class="text-yellow-500">o</span><span class="text-blue-500">g</span><span class="text-green-500">l</span><span class="text-red-500">e</span>
                    </div>
                    <div class="relative flex-1 max-w-xl">
                         <input
                            type="text"
                            class="w-full rounded-full border border-slate-300 py-2 px-4 shadow-sm outline-none"
                            value={searchBarInput.replace('search?q=', '') || addressBarInput.replace('search?q=', '')}
                            readonly
                        />
                    </div>
                </div>

                <div class="space-y-8">
                    <!-- Fake Result 1 -->
                    <div class="group cursor-pointer" onclick={() => navigate('https://www.wikipedia.org')}>
                        <div class="text-sm text-slate-700 mb-1">https://el.wikipedia.org › wiki</div>
                        <div class="text-xl text-blue-800 hover:underline group-hover:text-blue-600 visited:text-purple-900 font-medium">
                           {searchBarInput.replace('search?q=', '') || 'Αποτελέσματα'} - Βικιπαίδεια
                        </div>
                        <div class="text-sm text-slate-600 mt-1">
                            Η Βικιπαίδεια είναι μια ελεύθερη, διαδικτυακή εγκυκλοπαίδεια που γράφεται και συντηρείται από εθελοντές...
                        </div>
                    </div>

                     <!-- Fake Result 2 -->
                    <div class="group cursor-pointer" onclick={() => navigate('news')}>
                        <div class="text-sm text-slate-700 mb-1">https://www.news247.gr › eidiseis</div>
                        <div class="text-xl text-blue-800 hover:underline group-hover:text-blue-600 visited:text-purple-900 font-medium">
                           Ειδήσεις τώρα - Όλες οι εξελίξεις
                        </div>
                        <div class="text-sm text-slate-600 mt-1">
                            Διαβάστε τις τελευταίες ειδήσεις από την Ελλάδα και τον κόσμο. Πολιτική, Οικονομία, Κοινωνία...
                        </div>
                    </div>

                     <!-- Fake Result 3 -->
                    <div class="group cursor-pointer">
                        <div class="text-sm text-slate-700 mb-1">https://www.example.com › info</div>
                        <div class="text-xl text-blue-800 hover:underline group-hover:text-blue-600 visited:text-purple-900 font-medium">
                           Πληροφορίες για {searchBarInput.replace('search?q=', '')}
                        </div>
                        <div class="text-sm text-slate-600 mt-1">
                            Βρείτε όλα όσα ψάχνετε εδώ. Γρήγορα και εύκολα αποτελέσματα για την αναζήτησή σας.
                        </div>
                    </div>
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
						τεχνολογία. Η πλατφόρμα προσφέρει μαθήματα για Windows, Internet, και Email με διαδραστικό τρόπο.
					</p>
                    <p class="leading-relaxed text-slate-700">
                        Οι χρήστες μπορούν να μάθουν πώς να προστατεύονται από ηλεκτρονικές απάτες και πώς να χρησιμοποιούν αποτελεσματικά τον υπολογιστή τους.
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
					<div class="rounded-lg border-2 border-slate-200 p-6 hover:border-blue-500 cursor-pointer">
						<h3 class="mb-2 font-bold">Υπηρεσίες Πολιτών</h3>
						<p class="text-sm text-slate-600">Βρείτε υπηρεσίες και πληροφορίες</p>
					</div>
					<div class="rounded-lg border-2 border-slate-200 p-6 hover:border-blue-500 cursor-pointer">
						<h3 class="mb-2 font-bold">Ψηφιακή Ταυτότητα</h3>
						<p class="text-sm text-slate-600">Είσοδος στις υπηρεσίες</p>
					</div>
                    <div class="rounded-lg border-2 border-slate-200 p-6 hover:border-blue-500 cursor-pointer">
						<h3 class="mb-2 font-bold">Εξουσιοδότηση</h3>
						<p class="text-sm text-slate-600">Δημιουργία εγγράφου</p>
					</div>
                    <div class="rounded-lg border-2 border-slate-200 p-6 hover:border-blue-500 cursor-pointer">
						<h3 class="mb-2 font-bold">Υπεύθυνη Δήλωση</h3>
						<p class="text-sm text-slate-600">Δημιουργία εγγράφου</p>
					</div>
				</div>
			</div>
		{:else if activeTab.type === 'banking'}
			<!-- Banking Simulator -->
			<div class="mx-auto min-h-full max-w-4xl bg-white p-8">
				<header class="mb-8 border-b border-yellow-400 pb-4">
					<h1 class="text-3xl font-bold text-slate-900">National Bank</h1>
					<p class="mt-2 text-slate-600">e-Banking</p>
				</header>
				<div class="mx-auto max-w-sm rounded-lg border p-6 shadow-lg">
					<h3 class="mb-4 text-lg font-bold">Είσοδος</h3>
					<div class="space-y-4">
						<input type="text" placeholder="Username" class="w-full rounded border p-2" />
						<input type="password" placeholder="Password" class="w-full rounded border p-2" />
						<Button class="w-full bg-yellow-500 text-black hover:bg-yellow-600">Login</Button>
					</div>
					<p class="mt-4 text-xs text-slate-500">
						Ποτέ μην δίνετε τον κωδικό σας τηλεφωνικά!
					</p>
				</div>
			</div>
        {:else if activeTab.type === 'history'}
            <!-- History View -->
             <div class="mx-auto max-w-2xl p-8 bg-white min-h-full">
                <h2 class="text-2xl font-bold mb-6">Ιστορικό</h2>
                <div class="space-y-0 border rounded-lg overflow-hidden">
                    {#each history as item}
                        <div class="flex items-center justify-between p-4 border-b last:border-0 hover:bg-slate-50 cursor-pointer" onclick={() => navigate(item.url)}>
                            <div class="flex items-center gap-3">
                                <Clock class="h-4 w-4 text-slate-400" />
                                <div>
                                    <div class="font-medium text-blue-600">{item.title}</div>
                                    <div class="text-xs text-slate-400">{item.url}</div>
                                </div>
                            </div>
                            <div class="text-xs text-slate-500">{item.time}</div>
                        </div>
                    {/each}
                    {#if history.length === 0}
                        <div class="p-8 text-center text-slate-500">Το ιστορικό είναι κενό</div>
                    {/if}
                </div>
                <div class="mt-4 text-right">
                    <Button variant="outline" size="sm" onclick={() => { history = []; toast.success('Το ιστορικό διαγράφηκε'); }}>
                        Διαγραφή ιστορικού
                    </Button>
                </div>
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
