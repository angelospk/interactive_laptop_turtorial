import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TaskView from './TaskView.svelte';

describe('TaskView accessibility', () => {
	const props = { isOpen: true, openApps: [], availableApps: [], onAppClick: vi.fn() };

	it('names its icon-only close button', async () => {
		const onClose = vi.fn();
		const screen = render(TaskView, { ...props, onClose });
		await screen.getByRole('button', { name: 'Κλείσιμο' }).click();
		expect(onClose).toHaveBeenCalled();
	});

	it('does not expose the backdrop as a button', () => {
		const screen = render(TaskView, { ...props, onClose: vi.fn() });
		expect(screen.getByRole('button').elements()).toHaveLength(1);
	});
});
