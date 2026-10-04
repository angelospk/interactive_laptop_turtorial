import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import { FileText, Folder, Globe, Mail, Settings } from 'lucide-svelte';
import { afterEach } from 'vitest';
import Taskbar from './Taskbar.svelte';
// Layout tests below measure real boxes, so they need the app's Tailwind CSS.
import '../../../routes/layout.css';

describe('Taskbar right-click menu', () => {
	it('offers «Διαχείριση εργασιών» and opens it', async () => {
		const onOpenTaskManager = vi.fn();
		const screen = render(Taskbar, {
			apps: [],
			openAppIds: [],
			onAppClick: vi.fn(),
			onStartClick: vi.fn(),
			onOpenSettings: vi.fn(),
			onOpenTaskManager
		} as never);
		await userEvent.click(screen.getByTestId('taskbar'), { button: 'right' });
		await screen.getByRole('menuitem', { name: 'Διαχείριση εργασιών' }).click();
		expect(onOpenTaskManager).toHaveBeenCalledOnce();
		await expect
			.element(screen.getByRole('menuitem', { name: 'Διαχείριση εργασιών' }))
			.not.toBeInTheDocument();
	});
});

describe('Taskbar', () => {
	const props = {
		apps: [
			{ id: 'explorer', name: 'Εξερεύνηση', icon: Folder },
			{ id: 'word', name: 'Word (Επεξεργασία Κειμένου)', icon: FileText }
		],
		openAppIds: ['word'],
		onAppClick: vi.fn(),
		onStartClick: vi.fn(),
		onOpenSettings: vi.fn()
	};

	// «Επαναφορά παραθύρου»: a hidden window is easy to lose. The lesson points
	// at the one icon that brings it back.
	it('points at the app the learner has to bring back', async () => {
		const screen = render(Taskbar, { ...props, highlightAppIds: ['word'] });
		await expect.element(screen.getByText('Πατήστε εδώ')).toBeVisible();
		await expect
			.element(screen.getByRole('button', { name: 'Word (Επεξεργασία Κειμένου)' }))
			.toHaveAttribute('data-highlight', 'true');
	});

	it('points at nothing by default', () => {
		const screen = render(Taskbar, props);
		expect(screen.container.textContent).not.toContain('Πατήστε εδώ');
	});
});

// A phone held upright leaves the Windows simulator about 340 px wide. The
// tray must stay clickable and no app may sit on top of another control.
describe('Taskbar on a narrow screen', () => {
	const apps = [
		{ id: 'explorer', name: 'Εξερεύνηση', icon: Folder },
		{ id: 'browser', name: 'Browser', icon: Globe },
		{ id: 'email', name: 'Email', icon: Mail },
		{ id: 'settings', name: 'Ρυθμίσεις', icon: Settings },
		{ id: 'word', name: 'Word (Επεξεργασία Κειμένου)', icon: FileText }
	];
	const props = {
		apps,
		openAppIds: [],
		onAppClick: vi.fn(),
		onStartClick: vi.fn(),
		onOpenSettings: vi.fn(),
		onTaskViewClick: vi.fn()
	};

	afterEach(() => document.documentElement.classList.remove('text-large'));

	async function renderAt(width: number, extra: Record<string, unknown> = {}) {
		// Hit-testing only works inside the test page, so make it wide enough.
		await page.viewport(Math.max(width + 40, 414), 700);
		const screen = render(Taskbar, { ...props, ...extra } as never);
		screen.container.style.cssText = `position: relative; width: ${width}px; height: 300px;`;
		return screen;
	}

	function blockedButtons(root: HTMLElement) {
		return [...root.querySelectorAll('button')]
			.filter((b) => b.getClientRects().length > 0)
			.filter((b) => {
				const r = b.getBoundingClientRect();
				const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
				return !hit || !b.contains(hit);
			})
			.map((b) => b.getAttribute('aria-label'));
	}

	it.each([340, 370, 720])('leaves every control reachable at %i px', async (width) => {
		const screen = await renderAt(width);
		const bar = screen.getByTestId('taskbar');
		await expect.poll(() => blockedButtons(bar.element() as HTMLElement)).toEqual([]);
		await screen.getByRole('button', { name: 'Γρήγορες ρυθμίσεις' }).click();
		await expect.element(screen.getByRole('dialog', { name: 'Γρήγορες ρυθμίσεις' })).toBeVisible();
	});

	it('moves apps that do not fit into «Εμφάνιση περισσότερων»', async () => {
		const onAppClick = vi.fn();
		const screen = await renderAt(340, { onAppClick });
		await screen.getByRole('button', { name: 'Εμφάνιση περισσότερων' }).click();
		await screen.getByRole('menuitem', { name: 'Word (Επεξεργασία Κειμένου)' }).click();
		expect(onAppClick).toHaveBeenCalledWith('word');
	});

	it('keeps the app the lesson points at on the taskbar', async () => {
		const screen = await renderAt(340, { highlightAppIds: ['word'] });
		await expect
			.element(screen.getByRole('button', { name: 'Word (Επεξεργασία Κειμένου)' }))
			.toHaveAttribute('data-highlight', 'true');
		await expect.element(screen.getByText('Πατήστε εδώ')).toBeVisible();
	});
	it('keeps the tray clear with large text and many apps', async () => {
		document.documentElement.classList.add('text-large');
		const many = Array.from({ length: 10 }, (_, i) => ({
			id: `app${i}`,
			name: `Εφαρμογή ${i}`,
			icon: Folder
		}));
		for (const width of [340, 720]) {
			const screen = await renderAt(width, { apps: many });
			const bar = screen.getByTestId('taskbar');
			await expect.poll(() => blockedButtons(bar.element() as HTMLElement)).toEqual([]);
			await screen.getByRole('button', { name: 'Εμφάνιση περισσότερων' }).click();
			const menu = screen.getByRole('menu').element() as HTMLElement;
			// Long lists scroll inside the menu instead of leaving the screen.
			expect(menu.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
			screen.unmount();
		}
	});

	it('keeps the lesson target with large text on a phone', async () => {
		document.documentElement.classList.add('text-large');
		const screen = await renderAt(340, { highlightAppIds: ['word'], openAppIds: ['word'] });
		const bar = screen.getByTestId('taskbar');
		await expect
			.element(screen.getByRole('button', { name: 'Word (Επεξεργασία Κειμένου)' }))
			.toHaveAttribute('data-highlight', 'true');
		await expect.poll(() => blockedButtons(bar.element() as HTMLElement)).toEqual([]);
	});

	it('works from the keyboard', async () => {
		const onAppClick = vi.fn();
		const screen = await renderAt(340, { onAppClick });
		const more = screen.getByRole('button', { name: 'Εμφάνιση περισσότερων' });
		await expect.element(more).toHaveAttribute('aria-haspopup', 'menu');
		// Other test files run in parallel frames and may own the real keyboard,
		// so send the keys straight to the focused element.
		const press = (key: string) =>
			document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
		await more.click();
		const items = screen.getByRole('menuitem');
		await expect.element(items.first()).toHaveFocus();
		press('ArrowUp');
		await expect.element(items.last()).toHaveFocus();
		press('Home');
		await expect.element(items.first()).toHaveFocus();
		press('Escape');
		await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();
		await expect.element(more).toHaveFocus();
		await more.click();
		press('End');
		(document.activeElement as HTMLElement).click();
		expect(onAppClick).toHaveBeenCalledWith('word');
	});

	it('does not reopen «•••» after the screen widens and narrows again', async () => {
		const screen = await renderAt(340);
		await screen.getByRole('button', { name: 'Εμφάνιση περισσότερων' }).click();
		await expect.element(screen.getByRole('menu')).toBeVisible();
		screen.container.style.width = '900px';
		await expect
			.element(screen.getByRole('button', { name: 'Εμφάνιση περισσότερων' }))
			.not.toBeInTheDocument();
		screen.container.style.width = '340px';
		await expect
			.element(screen.getByRole('button', { name: 'Εμφάνιση περισσότερων' }))
			.toBeVisible();
		expect(screen.container.querySelector('[role="menu"]')).toBeNull();
	});
});
