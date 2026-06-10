<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Globe,
		Search,
		ArrowLeft,
		ArrowRight,
		RefreshCw,
		Plus,
		X,
		Star,
		Clock,
		History,
		Lock,
		Unlock,
		ShieldAlert,
		ZoomIn,
		ZoomOut,
		Download,
		Shield,
		Send,
		Newspaper,
		Landmark,
		Cloud,
		Mic,
		MoreVertical,
		Settings
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';

	let { config = {}, onAction } = $props<{
		config?: any;
		onAction: (action: string, data?: any) => void;
	}>();

	type Tab = {
		id: number;
		title: string;
		url: string;
		type: 'home' | 'search' | 'news' | 'weather' | 'gov' | 'banking' | 'history' | 'browser-settings';
		isSecure: boolean;
		// Per-tab visual history stack (back/forward). Purely cosmetic — never emits onAction.
		stack: string[];
		stackIndex: number;
	};

	type HistoryItem = {
		url: string;
		title: string;
		time: string;
	};

	let tabs = $state<Tab[]>([
		{ id: 1, title: 'Αρχική', url: 'home', type: 'home', isSecure: true, stack: ['home'], stackIndex: 0 }
	]);
	let activeTabId = $state(1);
	let addressBarInput = $state('');
	let searchBarInput = $state('');
	let bookmarkedSites = $state<string[]>([]);

	// Initialize from config
	$effect(() => {
		if (config.initialTabs && config.initialTabs.length > 0) {
			// Map string URLs to tab objects
			tabs = config.initialTabs.map((url: string, index: number) => {
				let type: Tab['type'] = 'search';
				let title = url;

				if (url === 'home') {
					type = 'home';
					title = 'Αρχική';
				} else if (url.includes('news')) {
					type = 'news';
					title = 'Ειδήσεις';
				} else if (url.includes('gov')) {
					type = 'gov';
					title = 'Gov.gr';
				} else if (url.includes('search') || url.includes('google')) {
					type = 'search';
					title = 'Google';
				}

				return {
					id: index + 1,
					title,
					url,
					type,
					isSecure: true,
					stack: [url],
					stackIndex: 0
				};
			});
			activeTabId = 1;
		}
	});

	// History State
	let history = $state<HistoryItem[]>([
		{ url: 'google.com', title: 'Google', time: '10:00' },
		{ url: 'news247.gr', title: 'Ειδήσεις 24/7', time: '09:45' }
	]);

	// Missing State Declarations
	let showCookieBanner = $state(false);

	// Banking State
	let bankState = $state<'login' | 'dashboard' | 'transfer_success'>('login');
	let bankUsername = $state('');
	let bankPassword = $state('');
	let bankBalance = $state(1250.5);
	let bankRecipient = $state('');
	let bankIBAN = $state('');
	let bankTransferAmount = $state('');
	let bankPasswordStrength = $derived.by(() => {
		if (bankPassword.length < 4) return 'weak';
		if (bankPassword.length >= 8 && /[0-9]/.test(bankPassword) && /[^A-Za-z0-9]/.test(bankPassword))
			return 'strong';
		return 'weak';
	});

	// Gov State
	let govState = $state<'home' | 'form' | 'success'>('home');
	let govName = $state('');
	let govAFM = $state('');
	let govText = $state('');

	let activeTab = $derived(tabs.find((t) => t.id === activeTabId) || tabs[0]);

	// Reset internal states when tab changes
	$effect(() => {
		if (activeTab.type === 'banking' && bankState !== 'login') {
			// Optional: reset bank state on navigation away/back? Keeping it persistent for now per tab logic would be complex.
			// For simplicity, banking state is global to the app instance.
		}
	});

	function addTab() {
		const newId = Math.max(...tabs.map((t) => t.id)) + 1;
		// Start with empty/home tab
		tabs.push({
			id: newId,
			title: 'Νέα καρτέλα',
			url: '',
			type: 'home',
			isSecure: true,
			stack: [''],
			stackIndex: 0
		});
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

	// Derive page type/title/security from a URL string (mirrors the original navigate() logic exactly)
	function classify(url: string): { type: Tab['type']; title: string; isSecure: boolean } {
		let type: Tab['type'] = 'search';
		let title = url;
		let isSecure = true;

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
		} else if (url.includes('settings') || url.includes('privacy')) {
			type = 'browser-settings';
			title = 'Ρυθμίσεις Browser';
		}

		// Simulate insecure site
		if (url.includes('unsecure') || url.includes('game') || url.includes('win')) {
			isSecure = false;
		}

		return { type, title, isSecure };
	}

	// Fake loading progress bar (purely visual)
	let isLoading = $state(false);
	let loadProgress = $state(0);
	let loadTimers: ReturnType<typeof setTimeout>[] = [];
	function startLoading() {
		loadTimers.forEach(clearTimeout);
		loadTimers = [];
		isLoading = true;
		loadProgress = 8;
		loadTimers.push(setTimeout(() => (loadProgress = 75), 50));
		loadTimers.push(setTimeout(() => (loadProgress = 100), 450));
		loadTimers.push(
			setTimeout(() => {
				isLoading = false;
				loadProgress = 0;
			}, 650)
		);
	}

	function navigate(url: string) {
		showCookieBanner = false; // Reset cookie banner
		const { type, title, isSecure } = classify(url);

		if (type === 'news') {
			// Show cookie banner for news site
			setTimeout(() => {
				if (activeTab.type === 'news') showCookieBanner = true;
			}, 1000);
		} else if (type === 'banking') {
			// Reset bank state if navigating freshly
			if (activeTab.type !== 'banking') {
				bankState = 'login';
				bankUsername = '';
				bankPassword = '';
			}
		}

		const tab = tabs.find((t) => t.id === activeTabId);
		if (tab) {
			tab.url = url;
			tab.type = type;
			tab.title = title;
			tab.isSecure = isSecure;
			// Record in the per-tab back/forward stack (visual only)
			if (tab.stackIndex < tab.stack.length - 1) {
				tab.stack = tab.stack.slice(0, tab.stackIndex + 1);
			}
			tab.stack.push(url);
			tab.stackIndex = tab.stack.length - 1;
		}

		// Add to history if it's a real page
		if (type !== 'home' && type !== 'history') {
			history.unshift({
				url,
				title,
				time: new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
			});
		}

		startLoading();
		onAction('navigate', { url, isSecure });
	}

	// Back/Forward: cosmetic only. Deliberately NEVER call onAction (no false lesson completions)
	// and never touch the global history list or cookie banner timers.
	let canGoBack = $derived((activeTab?.stackIndex ?? 0) > 0);
	let canGoForward = $derived(
		activeTab ? activeTab.stackIndex < (activeTab.stack?.length ?? 1) - 1 : false
	);

	function applyStackUrl(tab: Tab, url: string) {
		showCookieBanner = false;
		if (url === '') {
			tab.url = '';
			tab.type = 'home';
			tab.title = 'Νέα καρτέλα';
			tab.isSecure = true;
			addressBarInput = '';
		} else {
			const { type, title, isSecure } = classify(url);
			tab.url = url;
			tab.type = type;
			tab.title = title;
			tab.isSecure = isSecure;
			addressBarInput = url === 'home' ? '' : url;
		}
		startLoading();
	}

	function goBack() {
		const tab = tabs.find((t) => t.id === activeTabId);
		if (!tab || tab.stackIndex <= 0) return;
		tab.stackIndex--;
		applyStackUrl(tab, tab.stack[tab.stackIndex]);
	}

	function goForward() {
		const tab = tabs.find((t) => t.id === activeTabId);
		if (!tab || tab.stackIndex >= tab.stack.length - 1) return;
		tab.stackIndex++;
		applyStackUrl(tab, tab.stack[tab.stackIndex]);
	}

	// Refresh: cosmetic spin + loading bar, emits nothing.
	let refreshSpinning = $state(false);
	function handleRefresh() {
		startLoading();
		refreshSpinning = true;
		setTimeout(() => (refreshSpinning = false), 650);
	}

	// Visual-only three-dot menu
	let showMoreMenu = $state(false);

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
			// Re-evaluate cookie banner visibility based on tab type (simplified: only show on fresh nav for now)
			showCookieBanner = false;
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

	// Cookie Actions
	function acceptCookies() {
		showCookieBanner = false;
		toast.success('Cookies Accepted');
		onAction('cookie-choice', { choice: 'accept' });
	}

	function rejectCookies() {
		showCookieBanner = false;
		toast.success('Cookies Rejected');
		onAction('cookie-choice', { choice: 'reject' });
	}

	// Banking Actions
	function loginBank() {
		if (bankPasswordStrength === 'strong') {
			bankState = 'dashboard';
			toast.success(m.login_success ? m.login_success() : 'Login Success');
			onAction('bank-login', { success: true, strength: 'strong' });
		} else {
			toast.error(m.bank_password_weak ? m.bank_password_weak() : 'Weak Password');
			onAction('bank-login', { success: false, strength: bankPasswordStrength });
		}
	}

	function transferMoney() {
		if (!bankRecipient || !bankTransferAmount) {
			toast.error('Please fill all fields');
			return;
		}
		bankState = 'transfer_success';
		bankBalance -= parseFloat(bankTransferAmount);
		onAction('bank-transfer', { amount: bankTransferAmount, recipient: bankRecipient });
	}

	// Gov Actions
	function openGovForm() {
		govState = 'form';
	}

	function submitGovForm() {
		if (!govName || !govAFM) {
			toast.error('Please fill all fields');
			return;
		}
		govState = 'success';
		onAction('gov-submit', { name: govName, afm: govAFM });
	}

	// Browser goal state
	let findBarInput = $state('');
	let aiChatInput = $state('');
	let aiChatMessages = $state<{ role: 'user' | 'ai'; text: string }[]>([
		{ role: 'ai', text: 'Γεια σας! Πώς μπορώ να σας βοηθήσω σήμερα;' }
	]);

	function handleDownload() {
		onAction('download-file', { filename: config.targetFilename || 'document.pdf' });
		toast.success('Λήψη ξεκίνησε!');
	}

	function handleZoom(direction: 'in' | 'out') {
		onAction('zoom-page', { direction });
	}

	function handleFindOnPage() {
		if (findBarInput.trim()) {
			onAction('find-on-page', { term: findBarInput });
		}
	}

	function handlePrivacySettings() {
		onAction('open-privacy-settings', {});
	}

	function handleAiQuestion() {
		if (aiChatInput.trim()) {
			const msg = aiChatInput.trim();
			aiChatMessages.push({ role: 'user', text: msg });
			aiChatInput = '';
			onAction('type-ai-question', { message: msg });
			setTimeout(() => {
				aiChatMessages.push({ role: 'ai', text: 'Ευχαριστώ! Επεξεργάζομαι την απάντηση...' });
			}, 500);
		}
	}

	// Helper to get localized string safely
	function t(key: string) {
		// @ts-ignore
		return m[key]?.() || key;
	}
</script>

<div class="relative flex h-full w-full flex-col overflow-hidden bg-white">
	<!-- Cookie Banner Overlay -->
	{#if showCookieBanner}
		<div
			class="absolute right-0 bottom-0 left-0 z-50 flex animate-in flex-col items-center justify-between gap-4 bg-slate-800 p-6 text-white shadow-xl slide-in-from-bottom md:flex-row"
		>
			<div>
				<h3 class="mb-1 text-lg font-bold">{t('browser_cookie_title')}</h3>
				<p class="text-sm text-slate-300">{t('browser_cookie_text')}</p>
			</div>
			<div class="flex gap-2">
				<Button
					variant="outline"
					class="border-slate-500 bg-transparent text-white hover:bg-slate-700"
					onclick={rejectCookies}
				>
					{t('browser_cookie_reject')}
				</Button>
				<Button variant="default" class="bg-blue-600 hover:bg-blue-700" onclick={acceptCookies}>
					{t('browser_cookie_accept')}
				</Button>
			</div>
		</div>
	{/if}

	<!-- 1. Tab Bar (Chrome-like) -->
	<div class="flex items-end gap-0.5 bg-[#dee1e6] px-2 pt-1.5">
		{#each tabs as tab}
			<div
				class="group relative -mb-px flex max-w-[200px] cursor-pointer items-center gap-2 rounded-t-lg px-3 py-2 text-sm transition-colors select-none {activeTabId ===
				tab.id
					? 'bg-white font-medium text-slate-900'
					: 'text-slate-600 hover:bg-[#cdd1d7]'}"
				onclick={() => switchTab(tab.id)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && switchTab(tab.id)}
			>
				<!-- Favicon per fake site -->
				<span class="flex h-4 w-4 shrink-0 items-center justify-center">
					{#if !tab.isSecure}
						<ShieldAlert class="h-3.5 w-3.5 text-red-500" />
					{:else if tab.type === 'news'}
						<Newspaper class="h-3.5 w-3.5 text-red-600" />
					{:else if tab.type === 'banking'}
						<Landmark class="h-3.5 w-3.5 text-blue-700" />
					{:else if tab.type === 'gov'}
						<Shield class="h-3.5 w-3.5 text-[#003476]" />
					{:else if tab.type === 'weather'}
						<Cloud class="h-3.5 w-3.5 text-sky-500" />
					{:else if tab.type === 'history'}
						<Clock class="h-3.5 w-3.5 text-slate-500" />
					{:else if tab.type === 'browser-settings'}
						<Settings class="h-3.5 w-3.5 text-slate-500" />
					{:else}
						<span
							class="font-sans text-[13px] leading-none font-bold {activeTabId === tab.id
								? 'text-blue-500'
								: 'text-blue-500/80'}">G</span
						>
					{/if}
				</span>
				<span class="max-w-[100px] truncate">{tab.title}</span>
				<button
					class="rounded-full p-0.5 transition-opacity hover:bg-slate-200 {activeTabId === tab.id
						? 'opacity-100'
						: 'opacity-0 group-hover:opacity-100'}"
					onclick={(e) => closeTab(tab.id, e)}
				>
					<X class="h-3 w-3" />
				</button>
			</div>
		{/each}
		<button class="mb-1 ml-1 rounded-full p-1.5 hover:bg-[#cdd1d7]" onclick={addTab} title="Νέα καρτέλα">
			<Plus class="h-4 w-4 text-slate-600" />
		</button>
	</div>

	<!-- 2. Toolbar (Address Bar) -->
	<div class="flex items-center gap-1.5 bg-white px-2 py-1.5">
		<div class="flex items-center">
			<button
				class="rounded-full p-1.5 {canGoBack
					? 'text-slate-600 hover:bg-slate-100'
					: 'cursor-default text-slate-300'}"
				onclick={goBack}
				disabled={!canGoBack}
				title="Πίσω"
			>
				<ArrowLeft class="h-5 w-5" />
			</button>
			<button
				class="rounded-full p-1.5 {canGoForward
					? 'text-slate-600 hover:bg-slate-100'
					: 'cursor-default text-slate-300'}"
				onclick={goForward}
				disabled={!canGoForward}
				title="Μπροστά"
			>
				<ArrowRight class="h-5 w-5" />
			</button>
			<button
				class="rounded-full p-1.5 text-slate-600 hover:bg-slate-100"
				onclick={handleRefresh}
				title="Ανανέωση"
			>
				<RefreshCw class="h-5 w-5 {refreshSpinning ? 'animate-spin' : ''}" />
			</button>
		</div>
		<div class="relative flex-1">
			<div class="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
				{#if activeTab.isSecure}
					<Lock class="h-4 w-4 text-green-600" />
				{:else}
					<ShieldAlert class="h-4 w-4 text-red-500" />
				{/if}
			</div>
			<input
				type="text"
				class="w-full rounded-full bg-slate-100 py-1.5 pr-10 pl-9 text-sm outline-none hover:bg-slate-200/70 focus:bg-white focus:ring-2 focus:shadow-md {activeTab.isSecure
					? 'focus:ring-green-500'
					: 'focus:ring-red-500'}"
				placeholder="Πληκτρολογήστε μια διεύθυνση Web"
				bind:value={addressBarInput}
				onkeydown={(e) => {
					if (e.key === 'Enter') navigate(addressBarInput);
				}}
			/>
			<!-- Chrome-style bookmark star inside the address bar -->
			<button
				class="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full p-1 hover:bg-slate-200"
				onclick={bookmarkSite}
				title="Προσθήκη στα Αγαπημένα"
			>
				<Star
					class="h-4 w-4 {bookmarkedSites.includes(activeTab.url)
						? 'fill-yellow-400 text-yellow-400'
						: 'text-slate-400'}"
				/>
			</button>
		</div>
		<div class="flex items-center">
			<button class="rounded-full p-2 hover:bg-slate-100" onclick={openHistory} title="Ιστορικό">
				<History class="h-5 w-5 text-slate-400" />
			</button>
			{#if config.goal === 'zoom-page'}
				<button class="rounded-full p-2 hover:bg-slate-100" onclick={() => handleZoom('out')} title="Σμίκρυνση">
					<ZoomOut class="h-5 w-5 text-slate-400" />
				</button>
				<button class="rounded-full p-2 hover:bg-slate-100" onclick={() => handleZoom('in')} title="Μεγέθυνση">
					<ZoomIn class="h-5 w-5 text-slate-400" />
				</button>
			{/if}
			<!-- Visual-only three-dot menu -->
			<div class="relative">
				<button
					class="rounded-full p-2 hover:bg-slate-100"
					onclick={() => (showMoreMenu = !showMoreMenu)}
					title="Μενού"
				>
					<MoreVertical class="h-5 w-5 text-slate-400" />
				</button>
				{#if showMoreMenu}
					<div
						class="absolute top-full right-0 z-40 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
					>
						{#each ['Νέα καρτέλα', 'Ιστορικό', 'Λήψεις', 'Αγαπημένα', 'Ρυθμίσεις'] as item}
							<button
								class="block w-full cursor-default px-4 py-1.5 text-left text-sm text-slate-400"
								disabled
							>
								{item}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Fake loading progress bar (visual only) -->
	<div class="relative h-0.5 w-full border-b border-slate-200 bg-transparent">
		{#if isLoading}
			<div
				class="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-300 ease-out"
				style="width: {loadProgress}%"
			></div>
		{/if}
	</div>

	<!-- Find Bar -->
	{#if config.goal === 'find-on-page'}
		<div class="flex items-center gap-2 border-b bg-yellow-50 px-4 py-2">
			<Search class="h-4 w-4 text-slate-400" />
			<input
				type="text"
				class="flex-1 rounded border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="Αναζήτηση στη σελίδα..."
				bind:value={findBarInput}
				onkeydown={(e) => e.key === 'Enter' && handleFindOnPage()}
			/>
			<Button size="sm" onclick={handleFindOnPage}>Εύρεση</Button>
		</div>
	{/if}

	<!-- 3. Content Area -->
	<div class="relative flex-1 overflow-y-auto bg-slate-50">
		{#if config.goal === 'download-file'}
			<div class="absolute right-4 bottom-4 z-10 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 shadow-md">
				<Download class="h-5 w-5 text-blue-600" />
				<span class="text-sm font-medium text-blue-900">{config.targetFilename || 'document.pdf'}</span>
				<button
					class="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
					onclick={handleDownload}
				>
					Λήψη
				</button>
			</div>
		{/if}
		{#if activeTab.type === 'home'}
			<!-- Google Simulator -->
			<div class="flex h-full flex-col items-center justify-center bg-white p-4">
				<h1 class="mb-8 text-6xl font-medium tracking-tight">
					<span class="text-[#4285F4]">G</span><span class="text-[#EA4335]">o</span><span
						class="text-[#FBBC05]">o</span
					><span class="text-[#4285F4]">g</span><span class="text-[#34A853]">l</span><span
						class="text-[#EA4335]">e</span
					>
				</h1>
				<div class="relative w-full max-w-xl">
					<Search class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						class="w-full rounded-full border border-slate-200 py-3 pr-12 pl-12 shadow-[0_1px_6px_rgba(32,33,36,0.18)] outline-none hover:shadow-[0_1px_8px_rgba(32,33,36,0.25)] focus:shadow-[0_1px_8px_rgba(32,33,36,0.25)]"
						placeholder="Αναζήτηση στο Google"
						bind:value={searchBarInput}
						onkeydown={(e) => {
							if (e.key === 'Enter') handleSearch();
						}}
					/>
					<Mic class="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-[#4285F4]" />
				</div>
				<div class="mt-7 flex gap-3">
					<Button
						variant="secondary"
						class="rounded bg-[#f8f9fa] text-sm font-normal text-[#3c4043] hover:border hover:border-slate-200 hover:shadow-sm"
						onclick={handleSearch}>Αναζήτηση Google</Button
					>
					<Button
						variant="ghost"
						class="rounded bg-[#f8f9fa] text-sm font-normal text-[#3c4043] hover:border hover:border-slate-200 hover:shadow-sm"
						>Αισθάνομαι τυχερός</Button
					>
				</div>
			</div>
		{:else if activeTab.type === 'search'}
			<!-- Search Results Simulation -->
			<div class="mx-auto min-h-full max-w-4xl bg-white p-6">
				<div class="mb-3 flex items-center gap-4 border-b pb-4">
					<div class="text-2xl font-medium">
						<span class="text-[#4285F4]">G</span><span class="text-[#EA4335]">o</span><span
							class="text-[#FBBC05]">o</span
						><span class="text-[#4285F4]">g</span><span class="text-[#34A853]">l</span><span
							class="text-[#EA4335]">e</span
						>
					</div>
					<div class="relative max-w-xl flex-1">
						<input
							type="text"
							class="w-full rounded-full border border-slate-200 py-2 pr-10 pl-4 shadow-[0_1px_6px_rgba(32,33,36,0.15)] outline-none"
							value={searchBarInput.replace('search?q=', '') ||
								addressBarInput.replace('search?q=', '')}
							readonly
						/>
						<Search class="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#4285F4]" />
					</div>
				</div>

				<div class="mb-6 text-sm text-[#70757a]">
					Περίπου 1.240.000 αποτελέσματα (0,42 δευτερόλεπτα)
				</div>

				<div class="space-y-8">
					<!-- Fake Result 1 -->
					<div
						class="group max-w-2xl cursor-pointer"
						onclick={() => navigate('https://www.wikipedia.org')}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && navigate('https://www.wikipedia.org')}
					>
						<div class="mb-1 text-sm text-[#202124]">
							<span class="text-[#202124]">el.wikipedia.org</span><span class="text-[#5f6368]">
								› wiki</span
							>
						</div>
						<div
							class="text-[20px] leading-snug font-normal text-[#1a0dab] group-hover:underline visited:text-purple-900"
						>
							{searchBarInput.replace('search?q=', '') || 'Αποτελέσματα'} - Βικιπαίδεια
						</div>
						<div class="mt-1 text-sm leading-normal text-[#4d5156]">
							Η Βικιπαίδεια είναι μια ελεύθερη, διαδικτυακή εγκυκλοπαίδεια που γράφεται και
							συντηρείται από εθελοντές...
						</div>
					</div>

					<!-- Fake Result 2 -->
					<div
						class="group max-w-2xl cursor-pointer"
						onclick={() => navigate('news')}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && navigate('news')}
					>
						<div class="mb-1 text-sm text-[#202124]">
							<span class="text-[#202124]">www.news247.gr</span><span class="text-[#5f6368]">
								› eidiseis</span
							>
						</div>
						<div
							class="text-[20px] leading-snug font-normal text-[#1a0dab] group-hover:underline visited:text-purple-900"
						>
							Ειδήσεις τώρα - Όλες οι εξελίξεις
						</div>
						<div class="mt-1 text-sm leading-normal text-[#4d5156]">
							Διαβάστε τις τελευταίες ειδήσεις από την Ελλάδα και τον κόσμο. Πολιτική, Οικονομία,
							Κοινωνία...
						</div>
					</div>

					<!-- Fake Result 3 -->
					<div class="group max-w-2xl cursor-pointer">
						<div class="mb-1 text-sm text-[#202124]">
							<span class="text-[#202124]">www.example.com</span><span class="text-[#5f6368]">
								› info</span
							>
						</div>
						<div
							class="text-[20px] leading-snug font-normal text-[#1a0dab] group-hover:underline visited:text-purple-900"
						>
							Πληροφορίες για {searchBarInput.replace('search?q=', '')}
						</div>
						<div class="mt-1 text-sm leading-normal text-[#4d5156]">
							Βρείτε όλα όσα ψάχνετε εδώ. Γρήγορα και εύκολα αποτελέσματα για την αναζήτησή σας.
						</div>
					</div>
				</div>
			</div>
		{:else if activeTab.type === 'news'}
			<!-- News Site Simulator -->
			<div class="mx-auto min-h-full max-w-3xl bg-white shadow-sm">
				<!-- Masthead -->
				<header class="border-b-4 border-red-600">
					<div class="flex items-end justify-between px-8 pt-6 pb-3">
						<h1 class="font-serif text-4xl font-black tracking-tight text-slate-900">
							Ειδήσεις 24/7
						</h1>
						<p class="text-sm text-slate-500">
							{new Date().toLocaleDateString('el-GR', {
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</p>
					</div>
					<nav class="flex gap-5 bg-red-600 px-8 py-2 text-sm font-medium text-white">
						<span>Πολιτική</span>
						<span>Οικονομία</span>
						<span>Κοινωνία</span>
						<span>Τεχνολογία</span>
						<span>Αθλητικά</span>
					</nav>
				</header>
				<div class="p-8">
					<article class="space-y-4">
						<div
							class="mb-4 flex h-48 w-full items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-300"
						>
							<Newspaper class="h-10 w-10 text-slate-400" />
						</div>
						<h2 class="font-serif text-3xl font-bold leading-tight">
							Νέα πλατφόρμα εκπαίδευσης για αρχάριους
						</h2>
						<p class="leading-relaxed text-slate-700">
							Μια νέα πρωτοποριακή εφαρμογή βοηθάει τους χρήστες να εξοικειωθούν με την τεχνολογία.
							Η πλατφόρμα προσφέρει μαθήματα για Windows, Internet, και Email με διαδραστικό τρόπο.
						</p>
						<p class="leading-relaxed text-slate-700">
							Οι χρήστες μπορούν να μάθουν πώς να προστατεύονται από ηλεκτρονικές απάτες και πώς να
							χρησιμοποιούν αποτελεσματικά τον υπολογιστή τους.
						</p>
					</article>
					<!-- Secondary article cards -->
					<div class="mt-8 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
						<div class="overflow-hidden rounded-lg border border-slate-200">
							<div class="flex h-28 items-center justify-center bg-slate-200">
								<Newspaper class="h-6 w-6 text-slate-400" />
							</div>
							<div class="p-4">
								<h3 class="font-serif text-lg font-bold leading-snug">
									Ο καιρός το σαββατοκύριακο: Ηλιοφάνεια σε όλη τη χώρα
								</h3>
								<p class="mt-1 text-sm text-slate-500">πριν από 2 ώρες</p>
							</div>
						</div>
						<div class="overflow-hidden rounded-lg border border-slate-200">
							<div class="flex h-28 items-center justify-center bg-slate-200">
								<Newspaper class="h-6 w-6 text-slate-400" />
							</div>
							<div class="p-4">
								<h3 class="font-serif text-lg font-bold leading-snug">
									Πώς να αναγνωρίσετε ένα ύποπτο email
								</h3>
								<p class="mt-1 text-sm text-slate-500">πριν από 5 ώρες</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else if activeTab.type === 'gov'}
			<!-- Gov.gr Simulator -->
			<div class="mx-auto min-h-full max-w-4xl bg-white p-8">
				<header class="mb-8 border-b border-slate-200 pb-4">
					<div class="flex items-center gap-3">
						<span class="rounded bg-[#003476] px-2.5 py-1.5 text-2xl font-bold text-white">ΓΔ</span>
						<h1 class="text-3xl font-bold lowercase text-[#003476]">Gov.gr</h1>
					</div>
					<p class="mt-2 text-slate-600">Ενιαία Ψηφιακή Πύλη της Δημόσιας Διοίκησης</p>
				</header>

				{#if govState === 'home'}
					<div class="grid grid-cols-2 gap-6">
						<div
							class="cursor-pointer rounded-lg border-2 border-slate-200 p-6 hover:border-blue-500"
						>
							<h3 class="mb-2 font-bold">Υπηρεσίες Πολιτών</h3>
							<p class="text-sm text-slate-600">Βρείτε υπηρεσίες και πληροφορίες</p>
						</div>
						<div
							class="cursor-pointer rounded-lg border-2 border-slate-200 p-6 hover:border-blue-500"
							onclick={openGovForm}
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && openGovForm()}
						>
							<h3 class="mb-2 font-bold">{t('gov_service_title')}</h3>
							<p class="text-sm text-slate-600">Δημιουργία εγγράφου</p>
						</div>
					</div>
				{:else if govState === 'form'}
					<div class="mx-auto max-w-2xl rounded-lg border p-8">
						<h2 class="mb-4 text-xl font-bold">{t('gov_service_title')}</h2>
						<div class="space-y-4">
							<div>
								<label for="gov-name" class="mb-1 block text-sm font-medium"
									>{t('gov_form_name')}</label
								>
								<input
									id="gov-name"
									type="text"
									class="w-full rounded border p-2"
									bind:value={govName}
								/>
							</div>
							<div>
								<label for="gov-afm" class="mb-1 block text-sm font-medium"
									>{t('gov_form_afm')}</label
								>
								<input
									id="gov-afm"
									type="text"
									class="w-full rounded border p-2"
									bind:value={govAFM}
								/>
							</div>
							<div>
								<label for="gov-text" class="mb-1 block text-sm font-medium"
									>{t('gov_form_text')}</label
								>
								<textarea
									id="gov-text"
									class="w-full rounded border p-2"
									rows="3"
									bind:value={govText}
								></textarea>
							</div>
							<Button onclick={submitGovForm}>{t('gov_form_submit')}</Button>
						</div>
					</div>
				{:else if govState === 'success'}
					<div class="mx-auto max-w-xl rounded-lg bg-green-50 p-12 text-center">
						<div class="mb-4 text-5xl">✅</div>
						<h2 class="text-xl font-bold text-green-800">{t('gov_success')}</h2>
						<Button variant="outline" class="mt-6" onclick={() => (govState = 'home')}
							>Επιστροφή</Button
						>
					</div>
				{/if}
			</div>
		{:else if activeTab.type === 'banking'}
			<!-- Banking Simulator -->
			<div class="mx-auto min-h-full max-w-4xl bg-white p-8">
				<header class="mb-8 flex items-center justify-between border-b-4 border-blue-800 pb-4">
					<div>
						<div class="flex items-center gap-3">
							<span class="rounded bg-blue-800 p-2 text-white"><Landmark class="h-6 w-6" /></span>
							<h1 class="text-3xl font-bold text-blue-900">National Bank</h1>
						</div>
						<p class="mt-2 text-slate-600">e-Banking</p>
					</div>
					{#if bankState !== 'login'}
						<Button variant="ghost" onclick={() => (bankState = 'login')}>Αποσύνδεση</Button>
					{/if}
				</header>

				{#if bankState === 'login'}
					<div class="mx-auto max-w-sm rounded-lg border p-6 shadow-lg">
						<h3 class="mb-4 text-lg font-bold">{t('bank_login_title')}</h3>
						<div class="space-y-4">
							<input
								type="text"
								placeholder="Username"
								class="w-full rounded border p-2"
								bind:value={bankUsername}
							/>
							<div>
								<input
									type="password"
									placeholder={t('bank_password_placeholder')}
									class="w-full rounded border p-2"
									bind:value={bankPassword}
								/>
								{#if bankPassword}
									<div class="mt-2 text-xs">
										{#if bankPasswordStrength === 'weak'}
											<span class="text-red-500">{t('bank_password_weak')}</span>
										{:else if bankPasswordStrength === 'strong'}
											<span class="text-green-600">{t('bank_password_strong')}</span>
										{/if}
									</div>
								{/if}
							</div>
							<Button
								class="w-full bg-blue-800 text-white hover:bg-blue-900"
								onclick={loginBank}>Login</Button
							>
						</div>
						<p class="mt-4 text-xs text-slate-500">Ποτέ μην δίνετε τον κωδικό σας τηλεφωνικά!</p>
					</div>
				{:else if bankState === 'dashboard'}
					<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
						<!-- Sidebar -->
						<div class="col-span-1 space-y-2">
							<div class="rounded bg-slate-100 p-4">
								<p class="text-sm text-slate-500">{t('bank_dashboard_welcome')}</p>
								<p class="font-bold">{bankUsername || 'User'}</p>
							</div>
							<div class="rounded border border-blue-200 bg-blue-50 p-4">
								<p class="text-sm text-blue-800">{t('bank_dashboard_balance')}</p>
								<p class="text-2xl font-bold text-blue-900">€{bankBalance.toFixed(2)}</p>
							</div>
						</div>
						<!-- Main Area -->
						<div class="col-span-2 space-y-6">
							<div class="rounded-lg border p-6">
								<h3 class="mb-4 text-lg font-bold">{t('bank_transfer_menu')}</h3>
								<div class="grid gap-4">
									<div>
										<label for="bank-recipient" class="mb-1 block text-sm"
											>{t('bank_transfer_recipient')}</label
										>
										<input
											id="bank-recipient"
											type="text"
											class="w-full rounded border p-2"
											bind:value={bankRecipient}
											placeholder="Μαρία Παπαδοπούλου"
										/>
									</div>
									<div>
										<label for="bank-iban" class="mb-1 block text-sm"
											>{t('bank_transfer_iban')}</label
										>
										<input
											id="bank-iban"
											type="text"
											class="w-full rounded border p-2"
											bind:value={bankIBAN}
											placeholder="GR1234..."
										/>
									</div>
									<div>
										<label for="bank-amount" class="mb-1 block text-sm"
											>{t('bank_transfer_amount')}</label
										>
										<input
											id="bank-amount"
											type="number"
											class="w-full rounded border p-2"
											bind:value={bankTransferAmount}
											placeholder="0.00"
										/>
									</div>
									<Button
										class="bg-blue-800 text-white hover:bg-blue-900"
										onclick={transferMoney}
									>
										{t('bank_transfer_button')}
									</Button>
								</div>
							</div>
						</div>
					</div>
				{:else if bankState === 'transfer_success'}
					<div
						class="mx-auto max-w-xl rounded-lg border border-green-200 bg-green-50 p-12 text-center"
					>
						<div class="mb-4 text-5xl">✅</div>
						<h2 class="text-xl font-bold text-green-800">{t('bank_transfer_success')}</h2>
						<p class="mt-2 text-green-700">
							Μεταφέρατε €{bankTransferAmount} στον/ην {bankRecipient}.
						</p>
						<Button variant="outline" class="mt-6" onclick={() => (bankState = 'dashboard')}
							>Επιστροφή</Button
						>
					</div>
				{/if}
			</div>
		{:else if activeTab.type === 'history'}
			<!-- History View -->
			<div class="mx-auto min-h-full max-w-2xl bg-white p-8">
				<h2 class="mb-6 text-2xl font-bold">Ιστορικό</h2>
				<div class="space-y-0 overflow-hidden rounded-lg border">
					{#each history as item}
						<div
							class="flex cursor-pointer items-center justify-between border-b p-4 last:border-0 hover:bg-slate-50"
							onclick={() => navigate(item.url)}
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && navigate(item.url)}
						>
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
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							history = [];
							toast.success('Το ιστορικό διαγράφηκε');
						}}
					>
						Διαγραφή ιστορικού
					</Button>
				</div>
			</div>
		{:else if config.goal === 'type-ai-question'}
			<!-- AI Chat Simulation -->
			<div class="flex h-full flex-col bg-white">
				<header class="border-b bg-slate-800 px-6 py-4 text-white">
					<h1 class="text-lg font-bold">🤖 AI Assistant</h1>
					<p class="text-sm text-slate-300">Ρωτήστε οτιδήποτε</p>
				</header>
				<div class="flex-1 space-y-4 overflow-y-auto p-4">
					{#each aiChatMessages as msg}
						<div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
							<div
								class="max-w-xs rounded-2xl px-4 py-2 text-sm {msg.role === 'user'
									? 'bg-blue-600 text-white'
									: 'bg-slate-100 text-slate-900'}"
							>
								{msg.text}
							</div>
						</div>
					{/each}
				</div>
				<div class="flex items-center gap-2 border-t p-4">
					<input
						type="text"
						class="flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Γράψτε την ερώτησή σας..."
						bind:value={aiChatInput}
						onkeydown={(e) => e.key === 'Enter' && handleAiQuestion()}
					/>
					<button
						class="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
						onclick={handleAiQuestion}
					>
						<Send class="h-4 w-4" />
					</button>
				</div>
			</div>
		{:else if activeTab.type === 'browser-settings'}
			<!-- Browser Settings Page -->
			<div class="mx-auto min-h-full max-w-2xl bg-white p-8">
				<h2 class="mb-6 text-2xl font-bold text-slate-900">Ρυθμίσεις</h2>
				<div class="space-y-2">
					{#each ['Γενικά', 'Απόρρητο & Ασφάλεια', 'Εμφάνιση', 'Γλώσσα'] as section, i}
						<button
							class="flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm hover:bg-slate-50 {i === 1 ? 'border-blue-300 bg-blue-50' : ''}"
							onclick={() => i === 1 && handlePrivacySettings()}
						>
							<div class="flex items-center gap-3">
								{#if i === 1}
									<Shield class="h-4 w-4 text-blue-600" />
								{:else}
									<Globe class="h-4 w-4 text-slate-400" />
								{/if}
								<span class="{i === 1 ? 'font-medium text-blue-700' : 'text-slate-700'}">{section}</span>
							</div>
							<ArrowRight class="h-4 w-4 text-slate-400" />
						</button>
					{/each}
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
