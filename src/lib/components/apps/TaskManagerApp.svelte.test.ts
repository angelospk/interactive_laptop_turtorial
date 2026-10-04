import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TaskManagerApp from './TaskManagerApp.svelte';

const config = {
	taskManagerApps: [
		{ id: 'word', name: 'Επεξεργασία Κειμένου', status: 'Δεν αποκρίνεται' },
		{ id: 'browser', name: 'Browser', status: 'Εκτελείται' }
	]
};

describe('TaskManagerApp', () => {
	it('shows which program is not responding', async () => {
		const screen = render(TaskManagerApp, { config, onAction: vi.fn() } as never);
		await expect.element(screen.getByText('Δεν αποκρίνεται')).toBeInTheDocument();
	});

	it('ends the selected task and removes it from the list', async () => {
		const onAction = vi.fn();
		const screen = render(TaskManagerApp, { config, onAction } as never);
		const endTask = screen.getByRole('button', { name: 'Τερματισμός εργασίας' });
		await expect.element(endTask).toBeDisabled();
		await screen.getByRole('row', { name: /Επεξεργασία Κειμένου/ }).click();
		await endTask.click();
		expect(onAction).toHaveBeenCalledWith('end-task', { appId: 'word' });
		await expect
			.element(screen.getByRole('row', { name: /Επεξεργασία Κειμένου/ }))
			.not.toBeInTheDocument();
	});
});
