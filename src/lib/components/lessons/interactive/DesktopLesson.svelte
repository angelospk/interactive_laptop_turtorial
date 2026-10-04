<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import Desktop from '$lib/components/desktop/Desktop.svelte';
	import Taskbar from '$lib/components/desktop/Taskbar.svelte';
	import Window from '$lib/components/desktop/Window.svelte';
	import StartMenu from '$lib/components/desktop/StartMenu.svelte';
	import TaskView from '$lib/components/desktop/TaskView.svelte';
	import DesktopIcons from '$lib/components/desktop/DesktopIcons.svelte';
	import LessonTemplate from '../LessonTemplate.svelte';
	import InstructionText from '../InstructionText.svelte';
	import { Card } from '$lib/components/ui/card';
	import { Info } from 'lucide-svelte';

	import { untrack, type ComponentProps } from 'svelte';
	import { checkGoalMatch } from '$lib/lessons/goalHandlers';
	import { page } from '$app/state';
	import { fillShortcutText, type LearnerDevice } from '$lib/lessons/shortcuts';
	import { frontmostWindowId } from '$lib/components/desktop/frontmost';
	import { osState } from '$lib/osState.svelte';
	import { isValidGoalId, type GoalId } from '$lib/lessons/goals';
	import {
		DESKTOP_APPS,
		wrongAppHint,
		type DesktopAppId
	} from '$lib/components/desktop/desktopApps';

	// Import Apps
	import FileExplorerApp from '$lib/components/apps/FileExplorerApp.svelte';
	import BrowserApp from '$lib/components/apps/BrowserApp.svelte';
	import EmailApp from '$lib/components/apps/EmailApp.svelte';
	import SpreadsheetApp from '$lib/components/apps/SpreadsheetApp.svelte';
	import InstallerApp from '$lib/components/apps/InstallerApp.svelte';
	import SettingsApp from '$lib/components/apps/SettingsApp.svelte';
	import VideoCallApp from '$lib/components/apps/VideoCallApp.svelte';
	import WordProcessorApp from '$lib/components/apps/WordProcessorApp.svelte';
	import TaskManagerApp from '$lib/components/apps/TaskManagerApp.svelte';

	// Icons
	import {
		Folder,
		Globe,
		Mail,
		Grid3X3,
		Download,
		Settings,
		FileText,
		Phone,
		Video,
		Activity
	} from 'lucide-svelte';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	// Parse config
	type DesktopConfig = Record<string, unknown> & {
		goal?: string;
		instructions?: string;
		targetAppId?: string;
		initialApps?: (string | { appId: string; minimized?: boolean; maximized?: boolean })[];
		initialPage?: string;
		initialFiles?: ComponentProps<typeof FileExplorerApp>['initialFiles'];
		initialData?: Record<string, string>;
		emails?: ComponentProps<typeof EmailApp>['emails'];
	};
	const config = (lesson.config as DesktopConfig | null) || {};
	const goal = config.goal || '';

	// The machine state (Wi-Fi, volume, brightness…) is shared by the taskbar
	// tray, Quick Settings and the Settings app. Every lesson starts from the
	// same clean machine, whatever the previous lesson toggled.
	osState.reset();

	// Define available apps
	const appParts = {
		explorer: { icon: Folder, component: FileExplorerApp },
		browser: { icon: Globe, component: BrowserApp },
		email: { icon: Mail, component: EmailApp },
		excel: { icon: Grid3X3, component: SpreadsheetApp },
		installer: { icon: Download, component: InstallerApp },
		settings: { icon: Settings, component: SettingsApp },
		word: { icon: FileText, component: WordProcessorApp },
		viber: { icon: Phone, component: VideoCallApp },
		meeting: { icon: Video, component: VideoCallApp },
		taskmanager: { icon: Activity, component: TaskManagerApp }
	} satisfies Record<DesktopAppId, unknown>;
	const availableApps = DESKTOP_APPS.map((app) => ({ ...app, ...appParts[app.id] }));

	// Windows open maximized: a 600x400 window in the corner of a big screen left
	// a beginner squinting at a fraction of it. The one exception is the lesson
	// about the maximize button itself, which needs a window that is not yet.
	const openMaximized = goal !== 'maximize-app';

	// Pinned Apps (Default set)
	const pinnedAppIds = ['explorer', 'browser', 'email', 'settings'];
	// Shortcuts on the wallpaper: the everyday apps, the way a home PC has them.
	const desktopIconApps = availableApps.filter((a) =>
		['browser', 'email', 'word', 'excel'].includes(a.id)
	);

	// State
	// `settingsPage` is per instance: a deep link must be able to say "this
	// window, this page" without touching the lesson config every other app
	// shares (bd-cc7).
	let openApps = $state<
		{
			id: string;
			appId: string;
			minimized: boolean;
			maximized: boolean;
			settingsPage?: string;
		}[]
	>([]);
	let startMenuOpen = $state(false);
	// Only the window in front reacts to keyboard shortcuts.
	const frontmostId = $derived(frontmostWindowId(openApps));

	// The keyboard the learner chose in onboarding: instructions and the apps'
	// own shortcuts follow it, so a Mac learner is never told to press Ctrl.
	const device = $derived((page.data?.user?.preferredDevice ?? null) as LearnerDevice);
	let showTaskView = $state(false);
	let completed = $state(false);

	// «Επαναφορά παραθύρου»: point at the hidden window's taskbar icon until it is back.
	const highlightAppIds = $derived(
		goal === 'restore-app' && !completed
			? openApps.filter((a) => a.minimized && a.appId === config.targetAppId).map((a) => a.appId)
			: []
	);

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
				config.initialApps?.forEach(
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
				maximized: initialState?.maximized ?? openMaximized
			});
			checkGoal('open-app', { appId });
			const hint = completed ? null : wrongAppHint(config, appId);
			if (hint) toast.info(hint);
		}
		startMenuOpen = false;
	}

	/**
	 * Opens Settings on a specific page — the taskbar's Quick Settings entry
	 * point. Records the page on the instance so an already-open window
	 * navigates instead of staying wherever the learner left it.
	 */
	function openSettingsToPage(page: string) {
		openApp('settings');
		const instance = openApps.find((a) => a.appId === 'settings');
		if (instance) instance.settingsPage = page;
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

	/** Task View / taskbar path back to a hidden window: same `restore-app` event as the caption button. */
	function restoreApp(instanceId: string) {
		const app = openApps.find((a) => a.id === instanceId);
		if (app?.minimized) {
			app.minimized = false;
			checkGoal('restore-app', { appId: app.appId });
		}
		bringToFront(instanceId);
	}

	function bringToFront(instanceId: string) {
		const index = openApps.findIndex((a) => a.id === instanceId);
		if (index !== -1 && index !== openApps.length - 1) {
			const app = openApps[index];
			openApps = [...openApps.slice(0, index), ...openApps.slice(index + 1), app];
		}
	}

	// Goal Checking Logic
	function checkGoal(action: string, data: Record<string, unknown> = {}) {
		if (completed) return;

		try {
			if (!goal || !isValidGoalId(goal)) {
				console.warn(`[DesktopLesson] Unknown goal "${goal}" — skipping check`);
				return;
			}

			if (checkGoalMatch(goal as GoalId, action, data, config)) {
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

	function handleAppAction(action: string, data?: Record<string, unknown>) {
		// Ending a task in Task Manager closes that program's window too.
		if (action === 'end-task') {
			openApps = openApps.filter((a) => a.appId !== data?.appId);
		}
		try {
			checkGoal(action, data);
		} catch (err) {
			console.error('Error handling app action:', err);
		}
	}
</script>

<LessonTemplate {lesson} {onBack}>
	<!-- A column: the instruction keeps its own height and the simulated screen
	     takes every pixel left, instead of a fixed 600px box. -->
	<div class="flex h-full min-h-0 flex-col gap-2">
		{#if config.instructions}
			<div class="shrink-0">
				<Card class="rounded-lg border-blue-200 bg-blue-50 py-0">
					<div class="flex items-start gap-2 px-3 py-2">
						<Info class="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
						<div class="min-w-0 flex-1 text-sm text-blue-900">
							<InstructionText text={fillShortcutText(config.instructions, device)} />
						</div>
					</div>
				</Card>
			</div>
		{/if}
		<div class="relative min-h-0 w-full flex-1">
			<!-- Desktop Environment -->
			<Desktop
				onBackgroundClick={() => {
					startMenuOpen = false;
				}}
			>
				<DesktopIcons apps={desktopIconApps} onOpen={(id) => openApp(id)} disabled={completed} />

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
									...(instance.appId === 'settings'
										? { initialPage: instance.settingsPage ?? config.initialPage }
										: {})
								}}
								onAction={handleAppAction}
								{device}
								active={instance.id === frontmostId}
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
					onCloseApp={(instanceId) => closeApp(instanceId)}
					onAppClick={restoreApp}
				/>

				<!-- Taskbar -->
				<Taskbar
					apps={taskbarApps}
					openAppIds={openApps.map((a) => a.appId)}
					{highlightAppIds}
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
					onOpenTaskManager={() => openApp('taskmanager')}
					onAction={handleAppAction}
					wifiConfig={{
						targetSsid: config.targetSsid as string | undefined,
						requiredPassword: config.requiredPassword as string | undefined
					}}
				/>
			</Desktop>
		</div>
	</div>
</LessonTemplate>
