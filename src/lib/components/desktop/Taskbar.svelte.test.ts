import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
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
