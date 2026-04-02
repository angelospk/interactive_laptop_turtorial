<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import Desktop from '$lib/components/desktop/Desktop.svelte';
	import Taskbar from '$lib/components/desktop/Taskbar.svelte';
	import Window from '$lib/components/desktop/Window.svelte';
	import StartMenu from '$lib/components/desktop/StartMenu.svelte';
	import TaskView from '$lib/components/desktop/TaskView.svelte';
	import LessonTemplate from '../LessonTemplate.svelte';
	import { Card } from '$lib/components/ui/card';
	import { Info } from 'lucide-svelte';

	import { untrack } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';

	// Import Apps
	import FileExplorerApp from '$lib/components/apps/FileExplorerApp.svelte';
	import BrowserApp from '$lib/components/apps/BrowserApp.svelte';
	import EmailApp from '$lib/components/apps/EmailApp.svelte';
	import SpreadsheetApp from '$lib/components/apps/SpreadsheetApp.svelte';
	import InstallerApp from '$lib/components/apps/InstallerApp.svelte';
	import SettingsApp from '$lib/components/apps/SettingsApp.svelte';
	import VideoCallApp from '$lib/components/apps/VideoCallApp.svelte';

	// Icons
	import { Folder, Globe, Mail, Grid3X3, Download, Settings, FileText, Phone } from 'lucide-svelte';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	// Parse config
	const config = (lesson.config as any) || {};
	const goal = config.goal || '';
	const tutorialSteps = (config.tutorialSteps || []) as string[];

	// Define available apps
	const availableApps = [
		{ id: 'explorer', name: 'Εξερεύνηση', icon: Folder, component: FileExplorerApp },
		{ id: 'browser', name: 'Browser', icon: Globe, component: BrowserApp },
		{ id: 'email', name: 'Email', icon: Mail, component: EmailApp },
		{ id: 'excel', name: 'Υπολογιστικά Φύλλα', icon: Grid3X3, component: SpreadsheetApp },
		{ id: 'installer', name: 'Εγκατάσταση', icon: Download, component: InstallerApp },
		{ id: 'settings', name: 'Ρυθμίσεις', icon: Settings, component: SettingsApp },
		{ id: 'notepad', name: 'Σημειωματάριο', icon: FileText, component: null }, // Placeholder
		{ id: 'viber', name: 'Viber', icon: Phone, component: VideoCallApp }
	];

	// Pinned Apps (Default set)
	const pinnedAppIds = ['explorer', 'browser', 'email', 'settings'];

	// State
	let openApps = $state<{ id: string; appId: string; minimized: boolean; maximized: boolean }[]>(
		[]
	);
	let startMenuOpen = $state(false);
	let showTaskView = $state(false);
	let completed = $state(false);

	// Helper to get localized string safely
	function t(key: string) {
		// @ts-ignore
		return m[key]?.() || key;
	}

	// Derived Taskbar Apps: Pinned + Open but Unpinned
	let taskbarApps = $derived.by(() => {
		const pinned = availableApps.filter((a) => pinnedAppIds.includes(a.id));
		const openUnpinned = openApps
			.map((inst) => availableApps.find((a) => a.id === inst.appId))
			.filter((a) => a && !pinnedAppIds.includes(a.id)) as typeof availableApps;

		// Unique apps
		const all = [...pinned];
		openUnpinned.forEach((app) => {
			if (!all.find((a) => a.id === app.id)) {
				all.push(app);
			}
		});
		return all;
	});

	// Initialize from config
	$effect(() => {
		if (config.initialApps) {
			untrack(() => {
				config.initialApps.forEach(
					(appItem: string | { appId: string; minimized?: boolean; maximized?: boolean }) => {
						if (typeof appItem === 'string') {
							openApp(appItem);
						} else {
							openApp(appItem.appId, appItem);
						}
					}
				);
			});
		}
	});

	function openApp(appId: string, initialState?: { minimized?: boolean; maximized?: boolean }) {
		// Check if already open
		const existing = openApps.find((a) => a.appId === appId);
		if (existing) {
			if (initialState) {
				existing.minimized = !!initialState.minimized;
				existing.maximized = !!initialState.maximized;
			} else {
				if (existing.minimized) {
					existing.minimized = false;
					checkGoal('restore-app', { appId: existing.appId });
				}
			}
			// Bring to front (remove and push)
			openApps = openApps.filter((a) => a !== existing);
			openApps.push(existing);
		} else {
			openApps.push({
				id: crypto.randomUUID(),
				appId,
				minimized: !!initialState?.minimized,
				maximized: !!initialState?.maximized
			});
			checkGoal('open-app', { appId });
		}
		startMenuOpen = false;
	}

	function openSettingsToPage(page: string) {
		// If Settings is already open, just update it?
		// For now, simple implementation: open settings, passing page in config would be tricky dynamically
		// But SettingsApp listens to a prop or internal logic?
		// We need to pass the target page to the SettingsApp.
		// The standard `openApp` doesn't support params.
		// Let's assume `openApp` works, and `SettingsApp` handles internal state if we could pass it.
		// For this MVP, we'll just open the app. Deep linking was partly implemented in SettingsApp via config.initialPage.
		// But here we might need to re-mount or signal the app.

		// Checking if it's already open
		const existing = openApps.find((a) => a.appId === 'settings');
		if (!existing) {
			openApp('settings');
			// We can't easily set the initialPage prop dynamically for a specific instance unless we store instance-specific configs in openApps state.
			// But for now, opening it is the main requirement.
		} else {
			// Bring to front
			openApp('settings');
		}

		// Hack: We will update the config passed to ALL SettingsApps to navigate?
		// Or simpler: The QuickSettings component in Taskbar calls onOpenSettings.
		// That callback in Taskbar calls openSettingsToPage here.
		// We can try to force the 'config' prop of the SettingsApp to have the new page.
		// But `config` is derived from `lesson.config`.
		// We would need local overrides.
	}

	function closeApp(instanceId: string) {
		const app = openApps.find((a) => a.id === instanceId);
		if (app) {
			checkGoal('close-app', { appId: app.appId });
			if (config.goal === 'uninstall-app' && app.appId === 'settings') {
				// Keep generic goal check, but specific logic handled in checkGoal
			}
			openApps = openApps.filter((a) => a.id !== instanceId);
		}
	}

	function toggleMinimize(instanceId: string) {
		const app = openApps.find((a) => a.id === instanceId);
		if (app) {
			app.minimized = !app.minimized;
			if (app.minimized) {
				checkGoal('minimize-app', { appId: app.appId });
			} else {
				checkGoal('restore-app', { appId: app.appId });
			}
		}
	}

	function toggleMaximize(instanceId: string) {
		const app = openApps.find((a) => a.id === instanceId);
		if (app) {
			app.maximized = !app.maximized;
			if (app.maximized) {
				checkGoal('maximize-app', { appId: app.appId });
			}
		}
	}

	function bringToFront(instanceId: string) {
		const index = openApps.findIndex((a) => a.id === instanceId);
		if (index !== -1 && index !== openApps.length - 1) {
			const app = openApps[index];
			openApps = [...openApps.slice(0, index), ...openApps.slice(index + 1), app];
		}
	}

	// Goal Checking Logic
	function checkGoal(action: string, data: any = {}) {
		if (completed) return;

		try {
			// console.log('Action:', action, 'Data:', data, 'Goal:', goal);

			let success = false;

			// Specific matches based on config
			if (
				action === 'navigate' &&
				goal === 'navigate-site' &&
				data.url?.includes(config.targetUrl)
			) {
				success = true;
			}
			if (action === 'report-phishing' && goal === 'identify-phishing' && data.correct) {
				success = true;
			}
			if (action === 'update-cell' && goal === 'update-cell') {
				const cellOk = !config.targetCell || data.cellId === config.targetCell;
				const valueOk = !config.targetValue || data.value?.trim() === config.targetValue.trim();
				if (cellOk && valueOk) success = true;
			}
			if (action === 'format-cell' && goal === 'format-cell') {
				success = true;
			}
			if (action === 'formula-success' && goal === 'enter-formula') {
				success = true;
			}
			if (action === 'install-complete' && goal === 'install-app') {
				success = true;
			}
			if (action === 'uninstall-app' && goal === 'uninstall-app') {
				success = true;
			}
			if (action === 'connect-wifi' && goal === 'connect-wifi') {
				success = true;
			}
			if (action === 'add-printer' && goal === 'add-printer') {
				success = true;
			}
			if (
				action === 'create-folder' &&
				goal === 'create-folder' &&
				(!config.targetName || data.name === config.targetName)
			) {
				success = true;
			}
			if (action === 'select-file' && goal === 'select-file') {
				success = true;
			}
			if (action === 'open-app' && goal === 'open-app' && data.appId === config.targetAppId) {
				success = true;
			}
			if (action === 'open-quick-settings' && goal === 'open-quick-settings') {
				success = true;
			}
			if (action === 'open-task-view' && goal === 'open-task-view') {
				success = true;
			}
			if (action === 'minimize-app' && goal === 'minimize-app' && data.appId === config.targetAppId) {
				success = true;
			}
			if (action === 'restore-app' && goal === 'restore-app' && data.appId === config.targetAppId) {
				success = true;
			}
			if (action === 'maximize-app' && goal === 'maximize-app' && data.appId === config.targetAppId) {
				success = true;
			}
			if (action === 'close-app' && goal === 'close-app' && data.appId === config.targetAppId) {
				success = true;
			}
			if (action === 'open-start-menu' && goal === 'open-start-menu') {
				success = true;
			}
			if (action === 'attach-file' && (goal === 'attach-file' || goal === 'email-attachment')) {
				success = true;
			}
			// Module 8 New Goals
			if (
				action === 'cookie-choice' &&
				goal === 'handle-cookies' &&
				data.choice === config.targetChoice
			) {
				success = true;
			}
			if (
				action === 'bank-login' &&
				goal === 'secure-login' &&
				data.success &&
				data.strength === 'strong'
			) {
				success = true;
			}
			if (action === 'bank-transfer' && goal === 'make-transfer') {
				success = true;
			}
			if (action === 'gov-submit' && goal === 'gov-service') {
				success = true;
			}

			// Missing Goal Checks
			if (action === 'reply-email' && goal === 'reply-email') success = true;
			if (action === 'forward-email' && goal === 'forward-email') success = true;
			if (action === 'delete-email' && goal === 'delete-email') success = true;
			if (action === 'download-attachment' && goal === 'download-attachment') success = true;
			if (action === 'rename' && goal === 'rename-file') {
				success = true;
			}
			if (action === 'delete' && goal === 'delete-file') {
				success = true;
			}

			// Module 4: File operations
			if (action === 'paste-cut' && goal === 'paste-cut-file') {
				success = true;
			}
			if (action === 'paste-copy' && goal === 'paste-copy') {
				success = true;
			}
			if (action === 'drag-drop' && goal === 'drag-drop-file') {
				success = true;
			}

			// Module 6: Email - complete when all unread are read
			if (action === 'read-all-unread-complete' && goal === 'read-all-unread') {
				success = true;
			}

			// Browser new goals
			if (action === 'download-file' && goal === 'download-file') success = true;
			if (action === 'zoom-page' && goal === 'zoom-page') success = true;
			if (action === 'find-on-page' && goal === 'find-on-page') success = true;
			if (action === 'open-privacy-settings' && goal === 'open-privacy-settings') success = true;
			if (action === 'type-ai-question' && goal === 'type-ai-question') success = true;

			// Settings new goals
			if (action === 'connect-bluetooth' && goal === 'connect-bluetooth') success = true;
			if (action === 'open-display-settings' && goal === 'open-display-settings') success = true;
			if (action === 'open-accessibility' && goal === 'open-accessibility') success = true;
			if (action === 'open-sound-settings' && goal === 'open-sound-settings') success = true;
			if (action === 'update-app' && goal === 'update-app') success = true;

			// VideoCall goals
			if (action === 'start-videocall' && goal === 'start-videocall') success = true;
			if (action === 'mute-call' && goal === 'mute-call') success = true;
			if (action === 'end-call' && goal === 'end-call') success = true;

			if (success) {
				completed = true;
				toast.success('Μπράβο! Ολοκλήρωσες τη δραστηριότητα!');
				setTimeout(() => {
					onComplete(100);
				}, 1500);
			}
		} catch (err) {
			console.error('Error checking goal:', err);
			toast.error('Παρουσιάστηκε σφάλμα κατά τον έλεγχο της δραστηριότητας.');
		}
	}

	function handleAppAction(action: string, data: any) {
		try {
			checkGoal(action, data);
		} catch (err) {
			console.error('Error handling app action:', err);
		}
	}
</script>

<LessonTemplate {lesson} {onBack}>
	{#if config.instructions}
		<div class="mb-4">
			<Card class="border-blue-200 bg-blue-50">
				<div class="flex gap-3 p-4">
					<Info class="h-5 w-5 shrink-0 text-blue-600" />
					<div class="flex-1 text-sm whitespace-pre-line text-blue-900">
						{config.instructions}
					</div>
				</div>
			</Card>
		</div>
	{/if}
	<div class="relative h-full w-full">
		<!-- Desktop Environment -->
		<Desktop class="h-[600px]">
			<!-- Windows -->
			{#each openApps as instance (instance.id)}
				{@const appDef = availableApps.find((a) => a.id === instance.appId)}
				{#if appDef && appDef.component}
					<Window
						title={appDef.name}
						icon={appDef.icon}
						isOpen={true}
						isMinimized={instance.minimized}
						isMaximized={instance.maximized}
						onMinimize={() => toggleMinimize(instance.id)}
						onMaximize={() => toggleMaximize(instance.id)}
						onClose={() => closeApp(instance.id)}
						onFocus={() => bringToFront(instance.id)}
					>
						<!-- Dynamic Component Rendering -->
						<appDef.component
							config={{
								...config,
								...(instance.appId === 'settings' ? { initialPage: config.initialPage } : {})
							}}
							onAction={handleAppAction}
							initialFiles={config.initialFiles}
							initialData={config.initialData}
							emails={config.emails}
						/>
					</Window>
				{:else}
					<!-- Fallback/Placeholder Window -->
					<Window
						title={appDef?.name || 'App'}
						icon={appDef?.icon}
						isOpen={true}
						isMinimized={instance.minimized}
						isMaximized={instance.maximized}
						onMinimize={() => toggleMinimize(instance.id)}
						onMaximize={() => toggleMaximize(instance.id)}
						onClose={() => closeApp(instance.id)}
						onFocus={() => bringToFront(instance.id)}
					>
						<div class="flex h-full items-center justify-center bg-white">
							<p class="text-slate-400">Η εφαρμογή δεν είναι διαθέσιμη</p>
						</div>
					</Window>
				{/if}
			{/each}

			<!-- Start Menu -->
			<StartMenu
				isOpen={startMenuOpen}
				apps={availableApps}
				onAppClick={openApp}
				onClose={() => (startMenuOpen = false)}
			/>

			<!-- Task View -->
			<TaskView
				isOpen={showTaskView}
				{openApps}
				{availableApps}
				onClose={() => (showTaskView = false)}
				onAppClick={(instanceId) => {
					const app = openApps.find((a) => a.id === instanceId);
					if (app && app.minimized) {
						app.minimized = false;
					}
					bringToFront(instanceId);
				}}
			/>

			<!-- Taskbar -->
			<Taskbar
				apps={taskbarApps}
				openAppIds={openApps.map((a) => a.appId)}
				onAppClick={(id) => openApp(id)}
				onStartClick={() => {
					startMenuOpen = !startMenuOpen;
					if (startMenuOpen) {
						checkGoal('open-start-menu');
					}
				}}
				onQuickSettingsClick={() => checkGoal('open-quick-settings')}
				onTaskViewClick={() => {
					showTaskView = !showTaskView;
					if (showTaskView) {
						checkGoal('open-task-view');
					}
				}}
				onOpenSettings={openSettingsToPage}
			/>
		</Desktop>
	</div>
</LessonTemplate>
