import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MacSimLesson from '$lib/components/lessons/interactive/MacSimLesson.svelte';
import FinderMacApp from './apps/FinderMacApp.svelte';
import MacSettingsApp from './apps/MacSettingsApp.svelte';
import MacMenuBar from './MacMenuBar.svelte';
import { MacState } from './macState.svelte';

const APPS = [
	{ id: 'finder', label: 'Finder', icon: '🗂️', kind: 'finder', alwaysRunning: true },
	{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️', kind: 'settings' },
	{ id: 'notes', label: 'Σημειώσεις', icon: '📝', kind: 'notes' }
];
const FOLDERS = [
	{ id: 'documents', name: 'Έγγραφα' },
	{ id: 'downloads', name: 'Λήψεις' },
	{ id: 'empty', name: 'Άδειος', items: [] }
];

function lesson(config: Record<string, unknown>) {
	return { id: 'mac-test', moduleId: 'mac', lessonType: 'mac-simulation', config } as never;
}

const quitLesson = lesson({
	goal: 'mac-quit-app',
	prompt: 'Τερμάτισε τις Σημειώσεις.',
	apps: APPS,
	dockAppIds: ['finder', 'settings', 'notes'],
	targetAppId: 'notes',
	folders: FOLDERS
});

describe('Mac window zoom (green light)', () => {
	it('grows the window and shrinks it back; neither counts as closing', async () => {
		const onComplete = vi.fn();
		const screen = render(MacSimLesson, { lesson: quitLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Σημειώσεις', exact: true }).click();
		const win = () => screen.container.querySelector('[data-mac-window]');
		expect(win()?.getAttribute('data-zoomed')).toBe('false');
		await screen.getByRole('button', { name: 'Μεγιστοποίηση παραθύρου' }).click();
		expect(win()?.getAttribute('data-zoomed')).toBe('true');
		await screen.getByRole('button', { name: 'Επαναφορά μεγέθους παραθύρου' }).click();
		expect(win()?.getAttribute('data-zoomed')).toBe('false');
		// Still running, still open, lesson not completed.
		await expect
			.element(screen.getByRole('button', { name: 'Σημειώσεις (ανοιχτό)' }))
			.toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
	});
});

describe('Mac menu bar', () => {
	it('Apple menu → «Ρυθμίσεις συστήματος…» opens Settings without a launch event', async () => {
		const onComplete = vi.fn();
		const dockLesson = lesson({
			goal: 'mac-open-from-dock',
			prompt: 'Άνοιξε τις Ρυθμίσεις από το Dock.',
			apps: APPS,
			dockAppIds: ['finder', 'settings'],
			targetAppId: 'settings'
		});
		const screen = render(MacSimLesson, { lesson: dockLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Μενού Apple' }).click();
		await screen.getByRole('menuitem', { name: 'Ρυθμίσεις συστήματος…' }).click();
		await expect.element(screen.getByTestId('mac-settings')).toBeInTheDocument();
		// Not a Dock launch → the Dock lesson is not satisfied by the menu path.
		expect(onComplete).not.toHaveBeenCalled();
	});

	it('shut down explains that the practice Mac stays on', async () => {
		const machine = new MacState();
		const screen = render(MacMenuBar, {
			activeLabel: 'Finder',
			onQuit: vi.fn(),
			onSpotlight: vi.fn(),
			machine
		});
		await screen.getByRole('button', { name: 'Μενού Apple' }).click();
		await screen.getByRole('menuitem', { name: 'Τερματισμός λειτουργίας…' }).click();
		await expect.element(screen.getByRole('status')).toHaveTextContent(/δεν σβήνει/);
	});

	it('Control Center Wi-Fi toggle is the same state System Settings shows', async () => {
		const machine = new MacState();
		const bar = render(MacMenuBar, {
			activeLabel: 'Finder',
			onQuit: vi.fn(),
			onSpotlight: vi.fn(),
			machine
		});
		await bar.getByRole('button', { name: 'Κέντρο ελέγχου' }).click();
		await bar.getByRole('switch', { name: 'Wi-Fi' }).click();
		expect(machine.wifiOn).toBe(false);
		expect(machine.connectedSsid).toBeNull();
		await expect.element(bar.getByRole('button', { name: 'Wi-Fi: κλειστό' })).toBeInTheDocument();

		const settings = render(MacSettingsApp, { onEvent: vi.fn(), machine });
		await settings.getByRole('button', { name: 'Wi-Fi', exact: true }).click();
		await expect
			.element(settings.getByRole('switch', { name: 'Wi-Fi ενεργό' }))
			.toHaveAttribute('aria-checked', 'false');
	});

	it('the display slider dims the desktop', async () => {
		const machine = new MacState();
		const bar = render(MacMenuBar, {
			activeLabel: 'Finder',
			onQuit: vi.fn(),
			onSpotlight: vi.fn(),
			machine
		});
		await bar.getByRole('button', { name: 'Κέντρο ελέγχου' }).click();
		await bar.getByRole('slider', { name: 'Φωτεινότητα οθόνης' }).fill('40');
		expect(machine.brightness).toBe(40);
	});
});

describe('Finder', () => {
	it('search narrows the folder (accent-insensitive) and clears per folder', async () => {
		const machine = new MacState();
		const onEvent = vi.fn();
		const screen = render(FinderMacApp, { folders: FOLDERS, machine, onEvent });
		await screen.getByRole('button', { name: 'Έγγραφα' }).click();
		expect(onEvent).toHaveBeenCalledWith('mac-folder-opened', { folderId: 'documents' });
		const search = screen.getByRole('searchbox', { name: 'Αναζήτηση στον φάκελο' });
		await search.fill('ΔΕΗ');
		await expect.element(screen.getByText('Λογαριασμός ΔΕΗ.pdf')).toBeInTheDocument();
		expect(screen.container.textContent).not.toContain('Συνταγή Κέικ');
		await search.fill('zzz');
		await expect.element(screen.getByText(/Τίποτα για «zzz»/)).toBeInTheDocument();
		// Switching folder clears the query and emits once per sidebar pick only.
		await screen.getByRole('button', { name: 'Λήψεις' }).click();
		await expect.element(screen.getByText('Βεβαίωση gov.gr.pdf')).toBeInTheDocument();
		expect(onEvent).toHaveBeenCalledTimes(2);
	});

	it('an explicit empty items list shows an empty folder; back/forward do not re-emit', async () => {
		const machine = new MacState();
		const onEvent = vi.fn();
		const screen = render(FinderMacApp, { folders: FOLDERS, machine, onEvent });
		await screen.getByRole('button', { name: 'Άδειος' }).click();
		await expect.element(screen.getByText('Ο φάκελος είναι άδειος.')).toBeInTheDocument();
		await screen.getByRole('button', { name: 'Πίσω' }).click();
		await expect.element(screen.getByText(/Διάλεξε έναν φάκελο/)).toBeInTheDocument();
		await screen.getByRole('button', { name: 'Μπροστά' }).click();
		expect(machine.finderFolderId).toBe('empty');
		expect(onEvent).toHaveBeenCalledTimes(1);
	});

	it('remembers the open folder in the host state across remounts', async () => {
		const machine = new MacState();
		machine.finderFolderId = 'downloads';
		const screen = render(FinderMacApp, { folders: FOLDERS, machine, onEvent: vi.fn() });
		await expect.element(screen.getByText('Βεβαίωση gov.gr.pdf')).toBeInTheDocument();
	});
});
