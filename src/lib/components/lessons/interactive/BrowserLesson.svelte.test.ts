import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BrowserLesson from './BrowserLesson.svelte';

const lesson = (config: Record<string, unknown>) =>
	({ id: 'module5-test', moduleId: 'module5', lessonType: 'browser', config }) as never;

describe('BrowserLesson — history', () => {
	// Harold could not finish «Ιστορικό περιήγησης»: it asked him to type
	// "history", and typing it never counted. The clock icon is the way in.
	it('opens the history from the clock icon and completes', async () => {
		const onComplete = vi.fn();
		const screen = render(BrowserLesson, {
			lesson: lesson({ goal: 'open-history', initialTabs: ['home', 'news', 'weather'] }),
			onComplete,
			onBack: vi.fn()
		});
		await screen.getByRole('button', { name: 'Ιστορικό' }).click();
		await expect.element(screen.getByRole('heading', { name: 'Ιστορικό' })).toBeVisible();
		await expect.poll(() => onComplete.mock.calls.length, { timeout: 3000 }).toBe(1);
	});

	it('lists the pages visited, and opens one again from the list', async () => {
		const screen = render(BrowserLesson, {
			lesson: lesson({ goal: 'open-history', initialTabs: ['home', 'news'] }),
			onComplete: vi.fn(),
			onBack: vi.fn()
		});
		await screen.getByRole('button', { name: 'Ιστορικό' }).click();
		await screen
			.getByRole('list')
			.getByRole('button', { name: /Ειδήσεις/ })
			.click();
		await expect.element(screen.getByRole('heading', { name: 'Ειδήσεις 24/7' })).toBeVisible();
	});
});

describe('BrowserLesson — back and forward', () => {
	const backForward = lesson({
		goal: 'back-forward',
		initialHistory: ['home', 'news.gr', 'weather.gr']
	});

	it('goes back a page and forward again, then completes', async () => {
		const onComplete = vi.fn();
		const screen = render(BrowserLesson, { lesson: backForward, onComplete, onBack: vi.fn() });
		const back = screen.getByRole('button', { name: 'Πίσω', exact: true });
		const forward = screen.getByRole('button', { name: 'Μπροστά' });
		await expect.element(forward).toBeDisabled();

		await back.click();
		await expect.element(screen.getByRole('heading', { name: 'Ειδήσεις 24/7' })).toBeVisible();
		await expect.element(forward).toBeEnabled();
		expect(onComplete).not.toHaveBeenCalled();

		await forward.click();
		await expect.poll(() => onComplete.mock.calls.length, { timeout: 3000 }).toBe(1);
	});

	it('cannot go back from the first page', async () => {
		const screen = render(BrowserLesson, {
			lesson: lesson({ goal: 'new-tab' }),
			onComplete: vi.fn(),
			onBack: vi.fn()
		});
		await expect.element(screen.getByRole('button', { name: 'Πίσω', exact: true })).toBeDisabled();
	});
});

describe('BrowserLesson — instructions', () => {
	it('shows the lesson’s own instruction when it has one', async () => {
		const screen = render(BrowserLesson, {
			lesson: lesson({ goal: 'open-history', instructions: 'Πατήστε το ρολόι πάνω δεξιά.' }),
			onComplete: vi.fn(),
			onBack: vi.fn()
		});
		await expect.element(screen.getByText('Πατήστε το ρολόι πάνω δεξιά.')).toBeVisible();
	});
});
