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
		ShieldAlert
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages';

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
		isSecure: boolean;
	};

	type HistoryItem = {
		url: string;
		title: string;
		time: string;
	};

	let tabs = $state<Tab[]>([
		{ id: 1, title: 'Αρχική', url: 'home', type: 'home', isSecure: true }
	]);
	let activeTabId = $state(1);
	let addressBarInput = $state('');
	let searchBarInput = $state('');
	let bookmarkedSites = $state<string[]>([]);

	// Cookie Banner State
	let showCookieBanner = $state(false);

	// Banking State
	let bankState = $state<'login' | 'dashboard' | 'transfer_success'>('login');
	let bankUsername = $state('');
	let bankPassword = $state('');
	let bankBalance = $state(1250.0);
	let bankTransferAmount = $state('');
	let bankRecipient = $state('');
	let bankIBAN = $state('');
	let bankPasswordStrength = $derived.by(() => {
		if (!bankPassword) return 'none';
		if (
			bankPassword.length >= 8 &&
			/[0-9]/.test(bankPassword) &&
			/[a-zA-Z]/.test(bankPassword)
		)
			return 'strong';
		return 'weak';
	});

	// Gov State
	let govState = $state<'home' | 'form' | 'success'>('home');
	let govName = $state('');
	let govAFM = $state('');
	let govText = $state('');

	// History State
	let history = $state<HistoryItem[]>([
		{ url: 'google.com', title: 'Google', time: '10:00' },
		{ url: 'news247.gr', title: 'Ειδήσεις 24/7', time: '09:45' }
	]);

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
		tabs.push({ id: newId, title: 'Νέα καρτέλα', url: '', type: 'home', isSecure: true });
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
		let isSecure = true;
		showCookieBanner = false; // Reset cookie banner

		if (url.includes('news') || url.includes('eidiseis')) {
			type = 'news';
			title = 'Ειδήσεις';
			// Show cookie banner for news site
			setTimeout(() => {
				if (activeTab.type === 'news') showCookieBanner = true;
			}, 1000);
		} else if (url.includes('weather') || url.includes('kairos')) {
			type = 'weather';
			title = 'Καιρός';
		} else if (url.includes('gov')) {
			type = 'gov';
			title = 'Gov.gr';
		} else if (url.includes('bank')) {
			type = 'banking';
			title = 'e-Banking';
			// Reset bank state if navigating freshly
			if (activeTab.type !== 'banking') {
				bankState = 'login';
				bankUsername = '';
				bankPassword = '';
			}
		} else if (url === 'history') {
			type = 'history';
			title = 'Ιστορικό';
		} else if (url === 'home') {
			type = 'home';
			title = 'Αρχική';
		}

		// Simulate insecure site
		if (url.includes('unsecure') || url.includes('game') || url.includes('win')) {
			isSecure = false;
		}

		const tab = tabs.find((t) => t.id === activeTabId);
		if (tab) {
			tab.url = url;
			tab.type = type;
			tab.title = title;
			tab.isSecure = isSecure;
		}

		// Add to history if it's a real page
		if (type !== 'home' && type !== 'history') {
			history.unshift({
				url,
				title,
				time: new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
			});
		}

		onAction('navigate', { url, isSecure });
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
			class="animate-in slide-in-from-bottom absolute bottom-0 right-0 left-0 z-50 flex flex-col items-center justify-between gap-4 bg-slate-800 p-6 text-white shadow-xl md:flex-row"
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
				<Button
					variant="default"
					class="bg-blue-600 hover:bg-blue-700"
					onclick={acceptCookies}
				>
					{t('browser_cookie_accept')}
				</Button>
			</div>
		</div>
	{/if}

	<!-- 1. Tab Bar -->
	<div class="flex items-end gap-1 border-b border-slate-300 bg-slate-100 px-2 pt-2">
		{#each tabs as tab}
			<div
				class="group relative flex cursor-pointer items-center gap-2 rounded-t-lg px-4 py-2 text-sm transition-colors select-none {activeTabId ===
				tab.id
					? 'bg-white font-medium text-slate-900 shadow-sm'
					: 'bg-slate-200 text-slate-600 hover:bg-slate-300'}"
				onclick={() => switchTab(tab.id)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && switchTab(tab.id)}
			>
				{#if tab.isSecure}
					<Lock class="h-3 w-3 text-green-600" />
				{:else}
					<ShieldAlert class="h-3 w-3 text-red-500" />
				{/if}
				<span class="max-w-[100px] truncate">{tab.title}</span>
				<button
					class="rounded-full p-0.5 opacity-0 hover:bg-slate-200 group-hover:opacity-100"
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
			<ArrowLeft class="h-5 w-5 cursor-pointer hover:text-slate-600" />
			<ArrowRight class="h-5 w-5 cursor-pointer hover:text-slate-600" />
			<RefreshCw class="h-5 w-5 cursor-pointer hover:text-slate-600" />
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
				class="w-full rounded-full bg-slate-100 py-1.5 pr-4 pl-9 text-sm outline-none focus:ring-2 {activeTab.isSecure
					? 'focus:ring-green-500'
					: 'focus:ring-red-500'}"
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
			<div class="mx-auto min-h-full max-w-4xl bg-white p-6">
				<div class="mb-6 flex items-center gap-4 border-b pb-4">
					<div class="text-2xl font-bold">
						<span class="text-blue-500">G</span><span class="text-red-500">o</span><span
							class="text-yellow-500">o</span
						><span class="text-blue-500">g</span><span class="text-green-500">l</span><span
							class="text-red-500">e</span
						>
					</div>
					<div class="relative flex-1 max-w-xl">
						<input
							type="text"
							class="w-full rounded-full border border-slate-300 py-2 px-4 shadow-sm outline-none"
							value={searchBarInput.replace('search?q=', '') ||
								addressBarInput.replace('search?q=', '')}
							readonly
						/>
					</div>
				</div>

				<div class="space-y-8">
					<!-- Fake Result 1 -->
					<div
						class="group cursor-pointer"
						onclick={() => navigate('https://www.wikipedia.org')}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && navigate('https://www.wikipedia.org')}
					>
						<div class="mb-1 text-sm text-slate-700">https://el.wikipedia.org › wiki</div>
						<div
							class="text-xl font-medium text-blue-800 visited:text-purple-900 hover:underline group-hover:text-blue-600"
						>
							{searchBarInput.replace('search?q=', '') || 'Αποτελέσματα'} - Βικιπαίδεια
						</div>
						<div class="mt-1 text-sm text-slate-600">
							Η Βικιπαίδεια είναι μια ελεύθερη, διαδικτυακή εγκυκλοπαίδεια που γράφεται και
							συντηρείται από εθελοντές...
						</div>
					</div>

					<!-- Fake Result 2 -->
					<div
						class="group cursor-pointer"
						onclick={() => navigate('news')}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && navigate('news')}
					>
						<div class="mb-1 text-sm text-slate-700">https://www.news247.gr › eidiseis</div>
						<div
							class="text-xl font-medium text-blue-800 visited:text-purple-900 hover:underline group-hover:text-blue-600"
						>
							Ειδήσεις τώρα - Όλες οι εξελίξεις
						</div>
						<div class="mt-1 text-sm text-slate-600">
							Διαβάστε τις τελευταίες ειδήσεις από την Ελλάδα και τον κόσμο. Πολιτική, Οικονομία,
							Κοινωνία...
						</div>
					</div>

					<!-- Fake Result 3 -->
					<div class="group cursor-pointer">
						<div class="mb-1 text-sm text-slate-700">https://www.example.com › info</div>
						<div
							class="text-xl font-medium text-blue-800 visited:text-purple-900 hover:underline group-hover:text-blue-600"
						>
							Πληροφορίες για {searchBarInput.replace('search?q=', '')}
						</div>
						<div class="mt-1 text-sm text-slate-600">
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
					<div class="h-48 w-full rounded-lg bg-slate-200 mb-4"></div>
					<h2 class="text-2xl font-bold">Νέα πλατφόρμα εκπαίδευσης για αρχάριους</h2>
					<p class="leading-relaxed text-slate-700">
						Μια νέα πρωτοποριακή εφαρμογή βοηθάει τους χρήστες να εξοικειωθούν με την τεχνολογία. Η
						πλατφόρμα προσφέρει μαθήματα για Windows, Internet, και Email με διαδραστικό τρόπο.
					</p>
					<p class="leading-relaxed text-slate-700">
						Οι χρήστες μπορούν να μάθουν πώς να προστατεύονται από ηλεκτρονικές απάτες και πώς να
						χρησιμοποιούν αποτελεσματικά τον υπολογιστή τους.
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
				<header class="mb-8 flex items-center justify-between border-b border-yellow-400 pb-4">
					<div>
						<h1 class="text-3xl font-bold text-slate-900">National Bank</h1>
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
								class="w-full bg-yellow-500 text-black hover:bg-yellow-600"
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
										class="bg-yellow-500 text-black hover:bg-yellow-600"
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
