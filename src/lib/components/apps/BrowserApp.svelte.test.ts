import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BrowserApp from './BrowserApp.svelte';
import type { LearnerDevice } from '$lib/lessons/shortcuts';

/**
 * The zoom and find lessons told the learner to press "Ctrl+" but only reacted
 * to clicks on two small grey icons, so the keyboard did nothing in the lesson
 * and a Mac learner's ⌘+ zoomed the real browser instead.
 */
const mount = (goal: string, device: LearnerDevice, active = true) => {
	const onAction = vi.fn();
	const screen = render(BrowserApp, { config: { goal }, onAction, device, active } as never);
	return { screen, onAction };
};

const press = (init: KeyboardEventInit) => {
	const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
	window.dispatchEvent(event);
	return event;
};

describe('BrowserApp keyboard shortcuts', () => {
	it('zooms in with ⌘ + on a Mac and keeps the real browser from zooming', () => {
		const { onAction } = mount('zoom-page', 'mac');
		const event = press({ key: '=', metaKey: true });
		expect(onAction).toHaveBeenCalledWith('zoom-page', { direction: 'in' });
		expect(event.defaultPrevented).toBe(true);
	});

	it('zooms out with Ctrl - on Windows, and accepts the numpad +', () => {
		const { onAction } = mount('zoom-page', 'windows');
		press({ key: '-', ctrlKey: true });
		expect(onAction).toHaveBeenCalledWith('zoom-page', { direction: 'out' });
		press({ key: '+', ctrlKey: true });
		expect(onAction).toHaveBeenCalledWith('zoom-page', { direction: 'in' });
	});

	it('ignores the modifier the learner’s keyboard does not use', () => {
		const { onAction } = mount('zoom-page', 'mac');
		const event = press({ key: '=', ctrlKey: true });
		expect(onAction).not.toHaveBeenCalled();
		expect(event.defaultPrevented).toBe(false);
	});

	it('does nothing while the window is minimised', () => {
		const { onAction } = mount('zoom-page', 'mac', false);
		press({ key: '=', metaKey: true });
		expect(onAction).not.toHaveBeenCalled();
	});

	it('leaves the keyboard alone in lessons about something else', () => {
		const { onAction } = mount('download-file', 'mac');
		const event = press({ key: '=', metaKey: true });
		expect(onAction).not.toHaveBeenCalled();
		expect(event.defaultPrevented).toBe(false);
	});

	it('stops listening once the window is gone', () => {
		const { screen, onAction } = mount('zoom-page', 'mac');
		screen.unmount();
		press({ key: '=', metaKey: true });
		expect(onAction).not.toHaveBeenCalled();
	});

	it('⌘F puts the cursor in the find field without finishing the lesson', async () => {
		const { screen, onAction } = mount('find-on-page', 'mac');
		const event = press({ key: 'f', metaKey: true });
		expect(event.defaultPrevented).toBe(true);
		await expect.element(screen.getByPlaceholder('Αναζήτηση στη σελίδα...')).toHaveFocus();
		expect(onAction).not.toHaveBeenCalled();
	});

	// Size is checked in e2e/lesson-layout.test.ts: the stylesheet is not loaded here.
	it('names the zoom buttons for a screen reader, not only a tooltip', async () => {
		const { screen } = mount('zoom-page', 'mac');
		for (const name of ['Μεγέθυνση', 'Σμίκρυνση']) {
			await expect.element(screen.getByRole('button', { name })).toBeVisible();
		}
	});
});
