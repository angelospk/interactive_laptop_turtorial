import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MacSimLesson from './MacSimLesson.svelte';
import { macGuideConfig } from '$lib/db/seeds/mac-lessons';

// The mac guide embeds the desktop: every event goes out, and the desktop
// never scores, completes or shows a lesson frame of its own.

const lesson = {
	id: 'guide-mac',
	moduleId: '',
	lessonKey: 'guide-sim',
	titleKey: '',
	lessonType: 'mac-simulation',
	config: macGuideConfig()
} as never;

describe('MacSimLesson embedded', () => {
	it('reports events and never completes, even on the config goal', async () => {
		const onEvent = vi.fn();
		const onComplete = vi.fn();
		const screen = render(MacSimLesson, {
			lesson,
			embedded: true,
			onEvent,
			onComplete,
			onBack: vi.fn()
		} as never);
		// Opening Safari is the config's goal: a lesson would complete here.
		(document.querySelector('[data-guide="dock-safari"]') as HTMLElement).click();
		await vi.waitFor(() =>
			expect(onEvent).toHaveBeenCalledWith('mac-app-opened', { appId: 'safari', source: 'dock' })
		);
		(document.querySelector('[data-guide="mac-close"]') as HTMLElement).click();
		await vi.waitFor(() =>
			expect(onEvent).toHaveBeenCalledWith('mac-window-closed', { appId: 'safari' })
		);
		expect(screen.getByText(macGuideConfig().prompt).elements()).toHaveLength(0);
		await new Promise((r) => setTimeout(r, 1000));
		expect(onComplete).not.toHaveBeenCalled();
	});
});
