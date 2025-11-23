<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import Desktop from '$lib/components/desktop/Desktop.svelte';
	import Taskbar from '$lib/components/desktop/Taskbar.svelte';
	import Window from '$lib/components/desktop/Window.svelte';
	import StartMenu from '$lib/components/desktop/StartMenu.svelte';
	import LessonTemplate from '../LessonTemplate.svelte';

	import { untrack } from 'svelte';

	// Import Apps
	import FileExplorerApp from '$lib/components/apps/FileExplorerApp.svelte';
	import BrowserApp from '$lib/components/apps/BrowserApp.svelte';
	import EmailApp from '$lib/components/apps/EmailApp.svelte';
	import SpreadsheetApp from '$lib/components/apps/SpreadsheetApp.svelte';
	import InstallerApp from '$lib/components/apps/InstallerApp.svelte';
	import SettingsApp from '$lib/components/apps/SettingsApp.svelte';

	// Icons
	import { Folder, Globe, Mail, Grid3X3, Download, Settings, FileText } from 'lucide-svelte';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	// Parse config
	const config = (lesson.config as any) || {};
	const goal = config.goal || '';

	// Define available apps
	const availableApps = [
		{ id: 'explorer', name: 'Εξερεύνηση', icon: Folder, component: FileExplorerApp },
		{ id: 'browser', name: 'Browser', icon: Globe, component: BrowserApp },
		{ id: 'email', name: 'Email', icon: Mail, component: EmailApp },
		{ id: 'excel', name: 'Υπολογιστικά Φύλλα', icon: Grid3X3, component: SpreadsheetApp },
		{ id: 'installer', name: 'Εγκατάσταση', icon: Download, component: InstallerApp },
		{ id: 'settings', name: 'Ρυθμίσεις', icon: Settings, component: SettingsApp },
		{ id: 'notepad', name: 'Σημειωματάριο', icon: FileText, component: null } // Placeholder
	];

    // Pinned Apps (Default set)
    const pinnedAppIds = ['explorer', 'browser', 'email', 'settings'];

	// State
	let openApps = $state<{ id: string; appId: string; minimized: boolean; maximized: boolean }[]>(
		[]
	);
	let startMenuOpen = $state(false);
	let completed = $state(false);

    // Derived Taskbar Apps: Pinned + Open but Unpinned
    let taskbarApps = $derived.by(() => {
        const pinned = availableApps.filter(a => pinnedAppIds.includes(a.id));
        const openUnpinned = openApps
            .map(inst => availableApps.find(a => a.id === inst.appId))
            .filter(a => a && !pinnedAppIds.includes(a.id)) as typeof availableApps;

        // Unique apps
        const all = [...pinned];
        openUnpinned.forEach(app => {
            if (!all.find(a => a.id === app.id)) {
                all.push(app);
            }
        });
        return all;
    });

	// Initialize from config
	$effect(() => {
		if (config.initialApps) {
			untrack(() => {
				config.initialApps.forEach((appId: string) => openApp(appId));
			});
		}
	});

	function openApp(appId: string) {
		// Check if already open
		const existing = openApps.find((a) => a.appId === appId);
		if (existing) {
			if (existing.minimized) existing.minimized = false;
			// Bring to front (remove and push)
			openApps = openApps.filter((a) => a !== existing);
			openApps.push(existing);
		} else {
			openApps.push({
				id: crypto.randomUUID(),
				appId,
				minimized: false,
				maximized: false
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
        const existing = openApps.find(a => a.appId === 'settings');
        if(!existing) {
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
            if(config.goal === 'uninstall-app' && app.appId === 'settings') {
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

			// Direct match
			if (goal === action) success = true;

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
			if (action === 'open-app' && goal === 'open-app' && data.appId === config.targetAppId) {
				success = true;
			}
			if (action === 'open-quick-settings' && goal === 'open-quick-settings') {
				success = true;
			}

            // --- ENHANCED EXCEL VERIFICATION ---
            if (action === 'update-cell') {
                if (goal === 'check-value' && config.targetCell === data.cellId) {
                    const currentVal = parseFloat(data.calculatedValue);
                    const targetVal = parseFloat(config.targetValue);

                    // Check number equality (with tolerance) or string equality
                    if (!isNaN(targetVal) && !isNaN(currentVal)) {
                        if (Math.abs(currentVal - targetVal) < 0.1) {
                            success = true;
                        }
                    } else if (data.calculatedValue === config.targetValue) {
                         success = true;
                    } else if (data.value === config.targetValue) { // Check raw input (e.g. text)
                        success = true;
                    }
                }
            }
            if (action === 'format-cell' && goal === 'format-cell') {
                // If we care about specific formatting, we can check it here
                // For now, any format action on the correct lesson is success
                // Or verify bold/center if needed (requires extending config)
                if (config.requiredStyle) {
                    // Check if style matches
                    // data.style contains { bold: boolean, ... }
                    const req = config.requiredStyle;
                    const style = data.style;
                    let matches = true;
                    if(req.bold !== undefined && req.bold !== style.bold) matches = false;
                    if(req.align !== undefined && req.align !== style.align) matches = false;

                    if (matches) success = true;
                } else {
                     success = true;
                }
            }

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
						config={{...config, ...(instance.appId === 'settings' ? { initialPage: config.initialPage } : {})}}
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

		<!-- Taskbar -->
		<Taskbar
			apps={taskbarApps}
			openAppIds={openApps.map((a) => a.appId)}
			onAppClick={(id) => openApp(id)}
			onStartClick={() => (startMenuOpen = !startMenuOpen)}
			onQuickSettingsClick={() => checkGoal('open-quick-settings')}
            onOpenSettings={openSettingsToPage}
		/>
	</Desktop>
</LessonTemplate>
