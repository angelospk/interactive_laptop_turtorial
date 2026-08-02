import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MacSimLesson from './MacSimLesson.svelte';

const APPS = [
	{ id: 'finder', label: 'Finder', icon: '🗂️', kind: 'finder', alwaysRunning: true },
	{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️', kind: 'settings' },
	{ id: 'notes', label: 'Σημειώσεις', icon: '📝', kind: 'notes' }
];

function lesson(config: Record<string, unknown>) {
	return { id: 'mac-test', moduleId: 'mac', lessonType: 'mac-simulation', config } as never;
}

const dockOpen = lesson({
	goal: 'mac-open-from-dock',
	prompt: 'Άνοιξε τις Ρυθμίσεις από το Dock.',
	apps: APPS,
	dockAppIds: ['finder', 'settings', 'notes'],
	targetAppId: 'settings',
	successMessage: 'Μπράβο! Άνοιξες τις Ρυθμίσεις.'
});

const quitLesson = lesson({
	goal: 'mac-quit-app',
	prompt: 'Τερμάτισε εντελώς τις «Σημειώσεις».',
	apps: APPS,
	dockAppIds: ['finder', 'notes'],
	targetAppId: 'notes',
	successMessage: 'Μπράβο! Τερμάτισες το πρόγραμμα.'
});

const finderLesson = lesson({
	goal: 'mac-finder-open-folder',
	prompt: 'Άνοιξε τον φάκελο «Έγγραφα».',
	apps: APPS,
	dockAppIds: ['finder'],
	targetAppId: 'finder',
	folders: [
		{ id: 'documents', name: 'Έγγραφα' },
		{ id: 'downloads', name: 'Λήψεις' }
	],
	targetFolderId: 'documents',
	successMessage: 'Μπράβο! Βρήκες τα Έγγραφα.'
});

const sizeLesson = lesson({
	goal: 'mac-increase-size',
	prompt: 'Κάνε τα γράμματα Μεγάλα.',
	apps: APPS,
	dockAppIds: ['finder', 'settings'],
	targetAppId: 'settings',
	targetSize: 'large',
	successMessage: 'Μπράβο! Μεγάλωσες τα γράμματα.'
});

const spotlightLesson = lesson({
	goal: 'mac-spotlight-search',
	prompt: 'Βρες τις Ρυθμίσεις με το Spotlight.',
	apps: APPS,
	dockAppIds: ['finder'], // settings NOT in the Dock — must use Spotlight
	targetAppId: 'settings',
	successMessage: 'Μπράβο! Άνοιξες τις Ρυθμίσεις από το Spotlight.'
});

describe('MacSimLesson — open from Dock', () => {
	it('completes when the target app is opened from the Dock', async () => {
		const onComplete = vi.fn();
		const screen = render(MacSimLesson, { lesson: dockOpen, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Ρυθμίσεις' }).click();
		await expect.element(screen.getByText('Μπράβο! Άνοιξες τις Ρυθμίσεις.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('gives calm feedback on the wrong Dock app', async () => {
		const onComplete = vi.fn();
		const screen = render(MacSimLesson, { lesson: dockOpen, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Σημειώσεις' }).click();
		await expect.element(screen.getByText(/Όχι αυτό/)).toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
	});
});

describe('MacSimLesson — close ≠ quit (the pivotal lesson)', () => {
	it('closing the window does NOT quit: no completion, app stays running', async () => {
		const onComplete = vi.fn();
		const screen = render(MacSimLesson, { lesson: quitLesson, onComplete, onBack: vi.fn() });
		// Open Notes from the Dock.
		await screen.getByRole('button', { name: 'Σημειώσεις' }).click();
		// Close its window with the red traffic light.
		await screen.getByRole('button', { name: 'Κλείσιμο παραθύρου' }).click();
		await expect.element(screen.getByText(/το πρόγραμμα τρέχει ακόμα/)).toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
		// The Dock still shows Notes as running.
		await expect
			.element(screen.getByRole('button', { name: 'Σημειώσεις (ανοιχτό)' }))
			.toBeInTheDocument();
	});

	it('quitting from the menu completes the quit-app goal', async () => {
		const onComplete = vi.fn();
		const screen = render(MacSimLesson, { lesson: quitLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Σημειώσεις' }).click();
		// Open the app menu (menu bar shows the active app's name) and choose Quit.
		// `exact` targets the menu-bar button, not the Dock's «Σημειώσεις (ανοιχτό)».
		await screen.getByRole('button', { name: 'Σημειώσεις', exact: true }).click();
		await screen.getByRole('menuitem', { name: /Τερματισμός/ }).click();
		await expect.element(screen.getByText('Μπράβο! Τερμάτισες το πρόγραμμα.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 2000 });
	});
});

describe('MacSimLesson — Finder / Settings / Spotlight', () => {
	it('completes when the target Finder folder is opened', async () => {
		const onComplete = vi.fn();
		const screen = render(MacSimLesson, { lesson: finderLesson, onComplete, onBack: vi.fn() });
		// Finder is always running, so its Dock button reads «Finder (ανοιχτό)».
		await screen.getByRole('button', { name: 'Finder (ανοιχτό)' }).click();
		await screen.getByRole('button', { name: /Έγγραφα/ }).click();
		await expect.element(screen.getByText('Μπράβο! Βρήκες τα Έγγραφα.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 2000 });
	});

	it('completes when text size is set to large in Settings', async () => {
		const onComplete = vi.fn();
		const screen = render(MacSimLesson, { lesson: sizeLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Ρυθμίσεις' }).click();
		await screen.getByRole('button', { name: /Μεγάλα/ }).click();
		await expect.element(screen.getByText('Μπράβο! Μεγάλωσες τα γράμματα.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 2000 });
	});

	it('completes when the app is launched from Spotlight', async () => {
		const onComplete = vi.fn();
		const screen = render(MacSimLesson, { lesson: spotlightLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Spotlight αναζήτηση' }).click();
		await screen.getByRole('button', { name: /Ρυθμίσεις/ }).click();
		await expect
			.element(screen.getByText('Μπράβο! Άνοιξες τις Ρυθμίσεις από το Spotlight.'))
			.toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 2000 });
	});
});
