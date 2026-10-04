import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Folder } from 'lucide-svelte';
import Taskbar from './Taskbar.svelte';
import Desktop from './Desktop.svelte';
import Window from './Window.svelte';
import StartMenu from './StartMenu.svelte';
import TaskView from './TaskView.svelte';
import { osState } from '$lib/osState.svelte';

// Quick Settings, the tray and the desktop all read the same machine state:
// a toggle in the flyout must be visible on the taskbar and on the screen.
describe('Windows Quick Settings ↔ tray ↔ desktop', () => {
	beforeEach(() => osState.reset());

	const taskbarProps = {
		apps: [{ id: 'explorer', name: 'Εξερεύνηση', icon: Folder }],
		openAppIds: [],
		onAppClick: vi.fn(),
		onStartClick: vi.fn(),
		onOpenSettings: vi.fn()
	};

	it('switching Wi-Fi off in Quick Settings greys the tray icon', async () => {
		const screen = render(Taskbar, taskbarProps);
		const tray = screen.getByRole('button', { name: 'Γρήγορες ρυθμίσεις' });
		await expect.element(tray).toHaveAttribute('data-wifi', 'on');
		await tray.click();
		await screen.getByRole('switch', { name: 'Wi-Fi' }).click();
		await expect.element(tray).toHaveAttribute('data-wifi', 'off');
		expect(osState.wifiEnabled).toBe(false);
	});

	it('connects to a network from the Wi-Fi list and tells the lesson', async () => {
		const onAction = vi.fn();
		const screen = render(Taskbar, { ...taskbarProps, onAction });
		await screen.getByRole('button', { name: 'Γρήγορες ρυθμίσεις' }).click();
		await screen.getByRole('button', { name: 'Διαθέσιμα δίκτυα Wi-Fi' }).click();
		await screen.getByRole('button', { name: 'Σύνδεση στο δίκτυο Coffee_Shop' }).click();
		expect(onAction).toHaveBeenCalledWith('connect-wifi', { ssid: 'Coffee_Shop' });
		expect(osState.connectedNetwork).toBe('Coffee_Shop');
		await expect
			.element(screen.getByRole('button', { name: 'Coffee_Shop (συνδεδεμένο)' }))
			.toBeInTheDocument();
	});

	it('a secured network asks for its password before connecting', async () => {
		const onAction = vi.fn();
		const screen = render(Taskbar, {
			...taskbarProps,
			onAction,
			wifiConfig: { requiredPassword: 'kwdikos12345' }
		});
		await screen.getByRole('button', { name: 'Γρήγορες ρυθμίσεις' }).click();
		await screen.getByRole('button', { name: 'Διαθέσιμα δίκτυα Wi-Fi' }).click();
		await screen.getByRole('button', { name: 'Σύνδεση στο δίκτυο Home_WiFi' }).click();
		const field = screen.getByLabelText(/Κωδικός δικτύου/);
		await field.fill('wrong');
		await screen.getByRole('button', { name: 'Σύνδεση', exact: true }).click();
		await expect.element(screen.getByRole('alert')).toBeInTheDocument();
		expect(onAction).not.toHaveBeenCalled();
		await field.fill('kwdikos12345');
		await screen.getByRole('button', { name: 'Σύνδεση', exact: true }).click();
		expect(onAction).toHaveBeenCalledWith('connect-wifi', { ssid: 'Home_WiFi' });
	});

	it('airplane mode switches Wi-Fi off too and the tray shows a plane', async () => {
		const screen = render(Taskbar, taskbarProps);
		await screen.getByRole('button', { name: 'Γρήγορες ρυθμίσεις' }).click();
		await screen.getByRole('switch', { name: 'Λειτουργία πτήσης' }).click();
		expect(osState.wifiEnabled).toBe(false);
		await expect
			.element(screen.getByRole('button', { name: 'Γρήγορες ρυθμίσεις' }))
			.toHaveAttribute('data-wifi', 'airplane');
	});

	it('mute keeps the previous volume and is reflected in the tray', async () => {
		const screen = render(Taskbar, taskbarProps);
		await screen.getByRole('button', { name: 'Γρήγορες ρυθμίσεις' }).click();
		await screen.getByRole('button', { name: 'Σίγαση' }).click();
		expect(osState.muted).toBe(true);
		expect(osState.volume).toBe(80);
		await expect
			.element(screen.getByRole('button', { name: 'Γρήγορες ρυθμίσεις' }))
			.toHaveAttribute('data-muted', 'true');
	});

	it('the clock opens a calendar with today highlighted', async () => {
		const screen = render(Taskbar, taskbarProps);
		await screen.getByRole('button', { name: 'Ώρα και ημερομηνία' }).click();
		await expect.element(screen.getByTestId('calendar-flyout')).toBeInTheDocument();
		expect(
			screen.container.querySelector('[data-testid="calendar-flyout"] [aria-current="date"]')
				?.textContent
		).toBe(String(new Date().getDate()));
	});

	it('the desktop dims with brightness and warms with night light', async () => {
		const screen = render(Desktop, {});
		expect(screen.container.querySelector('[data-brightness-dim]')).toBeNull();
		osState.setBrightness(40);
		await vi.waitFor(() =>
			expect(screen.container.querySelector('[data-brightness-dim]')).not.toBeNull()
		);
		osState.nightLight = true;
		await vi.waitFor(() =>
			expect(screen.container.querySelector('[data-night-light]')).not.toBeNull()
		);
	});
});

describe('Windows window chrome', () => {
	const base = {
		title: 'Έγγραφο',
		icon: Folder,
		isOpen: true,
		isMinimized: false,
		isMaximized: false,
		onMinimize: vi.fn(),
		onClose: vi.fn()
	};

	it('names its caption buttons', async () => {
		const onMaximize = vi.fn();
		const screen = render(Window, { ...base, onMaximize } as never);
		await expect
			.element(screen.getByRole('button', { name: 'Ελαχιστοποίηση' }))
			.toBeInTheDocument();
		await screen.getByRole('button', { name: 'Μεγιστοποίηση' }).click();
		expect(onMaximize).toHaveBeenCalledOnce();
		await expect
			.element(screen.getByRole('button', { name: 'Κλείσιμο παραθύρου' }))
			.toBeInTheDocument();
	});

	it('double-clicking the title bar toggles maximise, like Windows', async () => {
		const onMaximize = vi.fn();
		const screen = render(Window, { ...base, onMaximize } as never);
		await screen.getByRole('group', { name: 'Γραμμή τίτλου' }).dblClick();
		expect(onMaximize).toHaveBeenCalledOnce();
	});

	it('shows «Επαναφορά μεγέθους» when already maximised', async () => {
		const screen = render(Window, { ...base, isMaximized: true, onMaximize: vi.fn() } as never);
		await expect
			.element(screen.getByRole('button', { name: 'Επαναφορά μεγέθους' }))
			.toBeInTheDocument();
	});
});

describe('Start menu', () => {
	const apps = [{ id: 'explorer', name: 'Εξερεύνηση', icon: Folder }];

	it('power options explain that the practice PC never switches off', async () => {
		const onClose = vi.fn();
		const screen = render(StartMenu, { isOpen: true, apps, onAppClick: vi.fn(), onClose });
		await screen.getByRole('button', { name: 'Τροφοδοσία' }).click();
		await screen.getByRole('menuitem', { name: 'Τερματισμός λειτουργίας' }).click();
		await expect.element(screen.getByText(/δεν σβήνει/)).toBeInTheDocument();
		expect(onClose).not.toHaveBeenCalled();
	});

	it('«Όλες οι εφαρμογές» lists the apps and launches one', async () => {
		const onAppClick = vi.fn();
		const screen = render(StartMenu, { isOpen: true, apps, onAppClick, onClose: vi.fn() });
		await screen.getByRole('button', { name: /Όλες οι εφαρμογές/ }).click();
		await screen.getByRole('button', { name: 'Εξερεύνηση' }).click();
		expect(onAppClick).toHaveBeenCalledWith('explorer');
	});
});

describe('Task View', () => {
	it('closes a window from its thumbnail and restores on click', async () => {
		const onCloseApp = vi.fn();
		const onAppClick = vi.fn();
		const screen = render(TaskView, {
			isOpen: true,
			openApps: [{ id: 'w1', appId: 'explorer', minimized: true, maximized: false }],
			availableApps: [{ id: 'explorer', name: 'Εξερεύνηση', icon: Folder }],
			onClose: vi.fn(),
			onAppClick,
			onCloseApp
		});
		await screen.getByRole('button', { name: 'Κλείσιμο Εξερεύνηση' }).click();
		expect(onCloseApp).toHaveBeenCalledWith('w1');
		await screen.getByRole('button', { name: 'Μετάβαση στο παράθυρο Εξερεύνηση' }).click();
		expect(onAppClick).toHaveBeenCalledWith('w1');
	});
});
