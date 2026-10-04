<script lang="ts">
	import {
		Wifi,
		WifiOff,
		Plane,
		Volume2,
		VolumeX,
		Volume1,
		Battery,
		BatteryCharging,
		BatteryLow,
		LayoutGrid,
		Search,
		ChevronUp,
		Bell
	} from 'lucide-svelte';
	import type { Icon as LucideIcon } from 'lucide-svelte';
	import QuickSettings from './QuickSettings.svelte';
	import CalendarFlyout from './CalendarFlyout.svelte';
	import { osState } from '$lib/osState.svelte';
	import { cn } from '$lib/utils';

	/**
	 * The Windows 11 taskbar: Start, Search and the pinned apps in the centre,
	 * the system tray (hidden icons, Wi-Fi / sound / battery, clock, notification
	 * bell) on the right. The tray icons are not decoration — they read the shared
	 * machine state, so Wi-Fi switched off in Quick Settings shows up here too.
	 */
	let {
		apps = [],
		openAppIds = [],
		highlightAppIds = [],
		onAppClick,
		onStartClick,
		onOpenSettings,
		onQuickSettingsClick,
		onTaskViewClick,
		onOpenTaskManager,
		onAction,
		wifiConfig
	} = $props<{
		apps: { id: string; name: string; icon: typeof LucideIcon }[];
		openAppIds: string[];
		/** Apps the lesson points at, e.g. the minimised window to bring back. */
		highlightAppIds?: string[];
		onAppClick: (appId: string) => void;
		onStartClick: () => void;
		onOpenSettings: (page: string) => void;
		onQuickSettingsClick?: () => void;
		onTaskViewClick?: () => void;
		onOpenTaskManager?: () => void;
		/** Semantic events from Quick Settings (e.g. `connect-wifi`), forwarded to the lesson. */
		onAction?: (action: string, data?: Record<string, unknown>) => void;
		wifiConfig?: { targetSsid?: string; requiredPassword?: string };
	}>();

	// Right-click on the taskbar → «Διαχείριση εργασιών», as in Windows 11.
	let menuOpen = $state(false);

	let time = $state(new Date());
	// One flyout at a time, like Windows: opening one closes the others.
	let flyout = $state<null | 'quick' | 'calendar' | 'tray' | 'bell'>(null);
	const showQuickSettings = $derived(flyout === 'quick');

	$effect(() => {
		const timer = setInterval(() => {
			time = new Date();
		}, 60000); // Update every minute
		return () => clearInterval(timer);
	});

	function toggleFlyout(which: NonNullable<typeof flyout>) {
		flyout = flyout === which ? null : which;
		if (which === 'quick' && flyout === 'quick') onQuickSettingsClick?.();
	}

	function closeFlyouts() {
		flyout = null;
	}

	// Tray glyphs follow the machine state: that is how a learner sees "the
	// Wi-Fi is off" without opening anything.
	const NetIcon = $derived(osState.airplaneMode ? Plane : osState.wifiEnabled ? Wifi : WifiOff);
	const SoundIcon = $derived(
		osState.muted || osState.volume === 0 ? VolumeX : osState.volume < 50 ? Volume1 : Volume2
	);
	const BatteryIcon = $derived(
		osState.batterySaver ? BatteryCharging : osState.batteryPercent < 20 ? BatteryLow : Battery
	);
	const trayTitle = $derived(
		[
			osState.airplaneMode
				? 'Λειτουργία πτήσης'
				: osState.wifiEnabled
					? `Wi-Fi: ${osState.connectedNetwork ?? 'χωρίς σύνδεση'}`
					: 'Wi-Fi: κλειστό',
			osState.muted ? 'Ήχος: σίγαση' : `Ήχος: ${osState.volume}%`,
			`Μπαταρία: ${osState.batteryPercent}%`
		].join(' · ')
	);

	const trayButton =
		'flex h-10 items-center gap-1.5 rounded-md px-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70';
</script>

<!-- stops click from reaching the backdrop -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	data-testid="taskbar"
	class="absolute right-0 bottom-0 left-0 z-50 flex h-12 items-center border-t border-white/10 bg-[#202020]/85 px-2 [font-family:Segoe_UI,system-ui,sans-serif] backdrop-blur-xl"
	onclick={(e) => {
		e.stopPropagation();
		menuOpen = false;
	}}
	oncontextmenu={(e) => {
		if (!onOpenTaskManager) return;
		e.preventDefault();
		menuOpen = true;
	}}
	data-taskbar
>
	{#if menuOpen}
		<div
			role="menu"
			class="absolute bottom-14 left-1/2 w-60 -translate-x-1/2 rounded-lg border border-white/10 bg-[#2b2b2b]/95 p-1 text-sm text-white shadow-xl backdrop-blur-xl"
		>
			<button
				type="button"
				role="menuitem"
				class="w-full rounded px-3 py-2 text-left hover:bg-white/10"
				onclick={(e) => {
					e.stopPropagation();
					menuOpen = false;
					onOpenTaskManager?.();
				}}
			>
				Διαχείριση εργασιών
			</button>
			<div class="my-1 h-px bg-white/10"></div>
			<button
				type="button"
				role="menuitem"
				class="w-full rounded px-3 py-2 text-left hover:bg-white/10"
				onclick={(e) => {
					e.stopPropagation();
					menuOpen = false;
					onOpenSettings('system');
				}}
			>
				Ρυθμίσεις γραμμής εργασιών
			</button>
		</div>
	{/if}

	<!-- Flyouts -->
	<QuickSettings
		isOpen={showQuickSettings}
		{onAction}
		{wifiConfig}
		onClose={closeFlyouts}
		onOpenSettings={(page) => {
			closeFlyouts();
			onOpenSettings(page);
		}}
	/>
	{#if flyout === 'calendar'}
		<CalendarFlyout now={time} />
	{/if}
	{#if flyout === 'tray'}
		<div
			class="absolute right-24 bottom-14 z-50 rounded-lg border border-white/10 bg-[#2b2b2b]/95 p-3 text-sm text-white shadow-xl backdrop-blur-xl"
			role="dialog"
			aria-label="Κρυφά εικονίδια"
		>
			<p class="mb-2 text-xs text-slate-300">Κρυφά εικονίδια</p>
			<div class="flex gap-2">
				<span class="flex h-9 w-9 items-center justify-center rounded bg-white/10" title="Antivirus"
					>🛡️</span
				>
				<span class="flex h-9 w-9 items-center justify-center rounded bg-white/10" title="Εκτυπωτής"
					>🖨️</span
				>
				<span class="flex h-9 w-9 items-center justify-center rounded bg-white/10" title="Cloud"
					>☁️</span
				>
			</div>
			<p class="mt-2 max-w-48 text-xs text-slate-400">
				Προγράμματα που τρέχουν στο παρασκήνιο. Δεν χρειάζονται σε αυτό το μάθημα.
			</p>
		</div>
	{/if}
	{#if flyout === 'bell'}
		<div
			class="absolute right-2 bottom-14 z-50 w-72 rounded-lg border border-white/10 bg-[#2b2b2b]/95 p-4 text-sm text-white shadow-xl backdrop-blur-xl"
			role="dialog"
			aria-label="Ειδοποιήσεις"
		>
			<p class="mb-2 font-semibold">Ειδοποιήσεις</p>
			<p class="text-slate-300">Δεν υπάρχουν νέες ειδοποιήσεις.</p>
		</div>
	{/if}

	<!-- Start & Apps (centered, Win11 style) -->
	<div class="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
		<button
			type="button"
			class="flex h-10 w-12 items-center justify-center rounded-md transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
			onclick={() => {
				closeFlyouts();
				onStartClick();
			}}
			title="Έναρξη"
			aria-label="Έναρξη"
			data-start-button
		>
			<!-- Windows 11 logo: four equal squares -->
			<svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
				<rect x="2" y="2" width="9.5" height="9.5" rx="0.5" fill="#4cc2ff" />
				<rect x="12.5" y="2" width="9.5" height="9.5" rx="0.5" fill="#4cc2ff" />
				<rect x="2" y="12.5" width="9.5" height="9.5" rx="0.5" fill="#4cc2ff" />
				<rect x="12.5" y="12.5" width="9.5" height="9.5" rx="0.5" fill="#4cc2ff" />
			</svg>
		</button>

		<!-- Search pill: on Windows it opens Start with the search field focused -->
		<button
			type="button"
			class="hidden h-10 items-center gap-2 rounded-full bg-white/90 pr-4 pl-3 text-sm text-slate-700 shadow-sm transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none sm:flex"
			onclick={() => {
				closeFlyouts();
				onStartClick();
			}}
			aria-label="Αναζήτηση"
			title="Αναζήτηση"
		>
			<Search class="h-4 w-4 text-slate-500" />
			<span class="hidden md:inline">Αναζήτηση</span>
		</button>

		<!-- Task View Button -->
		{#if onTaskViewClick}
			<button
				type="button"
				class="flex h-10 w-11 items-center justify-center rounded-md text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
				onclick={() => {
					closeFlyouts();
					onTaskViewClick();
				}}
				title="Προβολή Εργασιών"
				aria-label="Προβολή Εργασιών"
			>
				<LayoutGrid class="h-5 w-5" />
			</button>
		{/if}

		<!-- Taskbar Items -->
		{#each apps as app (app.id)}
			{@const isOpen = openAppIds.includes(app.id)}
			{@const highlighted = highlightAppIds.includes(app.id)}
			<div class="group relative">
				{#if highlighted}
					<div
						class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-amber-400 px-3 py-1 text-sm font-semibold whitespace-nowrap text-slate-900 shadow-lg motion-safe:animate-bounce"
					>
						Πατήστε εδώ
						<span
							class="absolute top-full left-1/2 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-amber-400"
						></span>
					</div>
				{:else}
					<!-- Hover tooltip with the app name, as Windows shows -->
					<div
						class="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 rounded border border-white/10 bg-[#2b2b2b] px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
						aria-hidden="true"
					>
						{app.name}
					</div>
				{/if}
				<button
					type="button"
					data-highlight={highlighted ? 'true' : undefined}
					class={cn(
						'flex h-10 w-11 items-center justify-center rounded-md transition-all focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none active:scale-95',
						isOpen
							? 'bg-white/10 text-white hover:bg-white/20'
							: 'text-slate-200 hover:bg-white/10 hover:text-white',
						highlighted && 'ring-2 ring-amber-400 motion-safe:animate-pulse'
					)}
					onclick={() => {
						closeFlyouts();
						onAppClick(app.id);
					}}
					title={app.name}
					aria-label={app.name}
				>
					<app.icon class="h-5 w-5" />
				</button>
				{#if isOpen}
					<!-- Running indicator pill under the icon -->
					<div
						class="absolute bottom-0.5 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-sky-300"
						aria-hidden="true"
					></div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- System Tray (right-aligned) -->
	<div class="ml-auto flex h-full items-center gap-0.5 py-1">
		<button
			type="button"
			class={cn(
				trayButton,
				'hidden w-8 justify-center px-0 sm:flex',
				flyout === 'tray' && 'bg-white/10'
			)}
			onclick={() => toggleFlyout('tray')}
			aria-label="Κρυφά εικονίδια"
			title="Κρυφά εικονίδια"
		>
			<ChevronUp class="h-4 w-4" />
		</button>
		<button
			type="button"
			class={cn(trayButton, showQuickSettings && 'bg-white/10')}
			onclick={() => toggleFlyout('quick')}
			aria-label="Γρήγορες ρυθμίσεις"
			title={trayTitle}
			data-tray
			data-wifi={osState.airplaneMode ? 'airplane' : osState.wifiEnabled ? 'on' : 'off'}
			data-muted={osState.muted ? 'true' : 'false'}
		>
			<NetIcon
				class={cn('h-4 w-4', !osState.wifiEnabled && !osState.airplaneMode && 'text-slate-400')}
			/>
			<SoundIcon class={cn('h-4 w-4', osState.muted && 'text-slate-400')} />
			<BatteryIcon class={cn('h-4 w-4', osState.batterySaver && 'text-emerald-300')} />
		</button>
		<button
			type="button"
			class={cn(
				trayButton,
				'flex-col items-end gap-0 text-xs leading-tight',
				flyout === 'calendar' && 'bg-white/10'
			)}
			onclick={() => toggleFlyout('calendar')}
			aria-label="Ώρα και ημερομηνία"
			title="Ώρα και ημερομηνία"
		>
			<span class="tabular-nums">
				{time.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
			</span>
			<span class="tabular-nums">
				{time.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
			</span>
		</button>
		<button
			type="button"
			class={cn(trayButton, 'w-9 justify-center px-0', flyout === 'bell' && 'bg-white/10')}
			onclick={() => toggleFlyout('bell')}
			aria-label="Ειδοποιήσεις"
			title="Ειδοποιήσεις"
		>
			<Bell class="h-4 w-4" />
		</button>
	</div>
</div>
