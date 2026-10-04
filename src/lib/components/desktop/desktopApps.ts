/**
 * The apps the Windows simulation can open. Kept apart from DesktopLesson so the
 * seed contracts can check that every lesson names an app that really exists.
 *
 * `name` is the window title and the Start-menu label; `shortName` is how an
 * instruction refers to the app, so a learner reading «Ανοίξτε το Excel» finds
 * the same word on screen.
 */
export const DESKTOP_APPS = [
	{ id: 'explorer', name: 'Εξερεύνηση', shortName: 'Εξερεύνηση' },
	{ id: 'browser', name: 'Browser', shortName: 'Browser' },
	{ id: 'email', name: 'Email', shortName: 'Email' },
	{ id: 'excel', name: 'Excel (Υπολογιστικά Φύλλα)', shortName: 'Excel' },
	{ id: 'installer', name: 'Εγκατάσταση', shortName: 'Εγκατάσταση' },
	{ id: 'settings', name: 'Ρυθμίσεις', shortName: 'Ρυθμίσεις' },
	{ id: 'word', name: 'Word (Επεξεργασία Κειμένου)', shortName: 'Word' },
	{ id: 'viber', name: 'Viber', shortName: 'Viber' },
	{ id: 'meeting', name: 'Βιντεοσύσκεψη', shortName: 'Βιντεοσύσκεψη' },
	{ id: 'taskmanager', name: 'Διαχείριση εργασιών', shortName: 'Διαχείριση εργασιών' }
] as const;

export type DesktopAppId = (typeof DESKTOP_APPS)[number]['id'];

const shortNameOf = (id: string | undefined) => DESKTOP_APPS.find((a) => a.id === id)?.shortName;

/**
 * A learner told «Ανοίξτε το Excel» who opens Word should hear why nothing
 * happened, instead of opening apps one after another.
 */
export function wrongAppHint(
	config: { goal?: string; targetAppId?: string },
	openedAppId: string
): string | null {
	if (config.goal !== 'open-app' || !config.targetAppId) return null;
	if (openedAppId === config.targetAppId) return null;
	const opened = shortNameOf(openedAppId);
	const wanted = shortNameOf(config.targetAppId);
	if (!opened || !wanted) return null;
	return `Ανοίξατε: ${opened}. Το μάθημα ζητά: ${wanted}.`;
}
