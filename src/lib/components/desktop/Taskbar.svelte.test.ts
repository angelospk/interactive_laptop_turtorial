import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { FileText, Folder } from 'lucide-svelte';
import Taskbar from './Taskbar.svelte';

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
