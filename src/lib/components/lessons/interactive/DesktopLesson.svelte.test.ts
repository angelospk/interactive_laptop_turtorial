import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DesktopLesson from './DesktopLesson.svelte';
import { module3Lessons } from '$lib/db/seeds/module3-lessons';
import { module5Lessons } from '$lib/db/seeds/module5-lessons';
import type { Lesson } from '$lib/db/schema';
// Geometry is the point here, so the real styles have to be on the page.
import '../../../../routes/layout.css';

// The simulated screen used to be a fixed 600px box, and a maximized window ran
// to its very bottom, under the taskbar. In the download lesson the "Λήψη"
// button sits at the bottom of the page, so it was hidden behind the taskbar:
// a beginner had no way to find it.

const downloadLesson = (module5Lessons as Lesson[]).find((l) => l.id === 'module5-lesson8')!;

function mountIn(width: number, height: number, lesson: Lesson) {
	const target = document.body.appendChild(document.createElement('div'));
	target.style.cssText = `width:${width}px;height:${height}px;display:flex;flex-direction:column`;
	return render(
		DesktopLesson as never,
		{
			target,
			props: { lesson, onComplete: vi.fn(), onBack: vi.fn() }
		} as never
	);
}

const rect = (el: Element | null) => el!.getBoundingClientRect();

describe('the simulated Windows screen', () => {
	test('fills the space it is given instead of a fixed 600px', async () => {
		const screen = mountIn(1200, 900, downloadLesson);
		await expect.element(screen.getByRole('button', { name: 'Λήψη' })).toBeInTheDocument();
		const desktop = rect(screen.container.querySelector('[data-desktop]'));
		expect(desktop.height).toBeGreaterThan(650);
		// Runs to the bottom of the lesson, give or take its padding.
		expect(rect(screen.container).bottom - desktop.bottom).toBeLessThan(32);
	});

	test('the browser of the download lesson opens filling the screen', async () => {
		const screen = mountIn(1200, 700, downloadLesson);
		await expect.element(screen.getByRole('button', { name: 'Λήψη' })).toBeInTheDocument();
		const desktop = rect(screen.container.querySelector('[data-desktop]'));
		const win = rect(screen.container.querySelector('[data-window]'));
		expect(win.width).toBeGreaterThan(desktop.width - 20);
	});

	test('"Λήψη" is above the taskbar, not behind it', async () => {
		const screen = mountIn(1200, 700, downloadLesson);
		const button = screen.getByRole('button', { name: 'Λήψη' });
		await expect.element(button).toBeInTheDocument();
		const taskbar = rect(screen.container.querySelector('[data-taskbar]'));
		const win = rect(screen.container.querySelector('[data-window]'));
		expect(win.bottom).toBeLessThanOrEqual(taskbar.top + 1);
		expect(rect(button.element()).bottom).toBeLessThanOrEqual(taskbar.top);
		// Big enough for an unsteady hand.
		expect(rect(button.element()).height).toBeGreaterThanOrEqual(44);
	});

	test('the "maximize" lesson still starts with a window that is not maximized', async () => {
		const lesson = (module3Lessons as Lesson[]).find(
			(l) => (l.config as { goal?: string })?.goal === 'maximize-app'
		)!;
		const screen = mountIn(1200, 700, lesson);
		await vi.waitFor(() => expect(screen.container.querySelector('[data-window]')).not.toBeNull());
		const desktop = rect(screen.container.querySelector('[data-desktop]'));
		const win = rect(screen.container.querySelector('[data-window]'));
		expect(win.width).toBeLessThan(desktop.width - 100);
	});
});
