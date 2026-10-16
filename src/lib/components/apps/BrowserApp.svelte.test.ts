import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BrowserApp from './BrowserApp.svelte';
import type { LearnerDevice } from '$lib/lessons/shortcuts';
// Real styles, so the toolbar test measures the real layout.
import '../../../routes/layout.css';

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

/**
 * The module5 guide pointed its download, zoom and find steps at the whole page:
 * those controls only appeared in their own lessons, so there was nothing to see.
 */
describe('BrowserApp guide showcase', () => {
	const showcase = () => {
		const onAction = vi.fn();
		const screen = render(BrowserApp, {
			config: { initialTabs: ['home', 'news.gr'], guideShowcase: true },
			onAction
		} as never);
		return { screen, onAction };
	};
	const target = (name: string) => document.querySelector(`[data-guide="${name}"]`);

	it('puts the download, zoom and find controls on screen, each with its own target', () => {
		const { screen } = showcase();
		for (const name of ['download', 'zoom', 'find']) expect(target(name), name).not.toBeNull();
		screen.unmount();
	});

	it('keeps them hidden in an ordinary browser window', () => {
		const screen = render(BrowserApp, { config: {}, onAction: vi.fn() } as never);
		for (const name of ['download', 'zoom', 'find']) expect(target(name), name).toBeNull();
		screen.unmount();
	});

	it('the zoom buttons really zoom the page, within limits', async () => {
		const { screen } = showcase();
		const level = screen.getByTestId('zoom-level');
		await expect.element(level).toHaveTextContent('100%');
		await screen.getByRole('button', { name: 'Μεγέθυνση' }).click();
		await expect.element(level).toHaveTextContent('110%');
		for (let i = 0; i < 12; i++) await screen.getByRole('button', { name: 'Σμίκρυνση' }).click();
		await expect.element(level).toHaveTextContent('50%');
	});

	it('find tells how often the word is on the page', async () => {
		const { screen, onAction } = showcase();
		await screen.getByPlaceholder('Αναζήτηση στη σελίδα...').fill('google');
		await screen.getByRole('button', { name: 'Εύρεση' }).click();
		await expect.element(screen.getByRole('status')).toHaveTextContent(/Βρέθηκε \d+ φορ/);
		expect(onAction).toHaveBeenCalledWith('find-on-page', { term: 'google' });
		await screen.getByPlaceholder('Αναζήτηση στη σελίδα...').fill('ανύπαρκτη');
		await screen.getByRole('button', { name: 'Εύρεση' }).click();
		await expect.element(screen.getByRole('status')).toHaveTextContent('Δεν βρέθηκε');
	});

	it('answers the zoom and find shortcuts, so the real browser does not', () => {
		const { screen } = showcase();
		expect(press({ key: '=', ctrlKey: true }).defaultPrevented).toBe(true);
		expect(press({ key: 'f', ctrlKey: true }).defaultPrevented).toBe(true);
		screen.unmount();
	});
});

// On a 390px phone the toolbar is ~366px wide and the zoom-in button stuck out
// past its right edge, cut off.
describe('BrowserApp toolbar on a narrow screen', () => {
	for (const width of [340, 366, 1000]) {
		it(`keeps the zoom-in button inside a ${width}px browser`, async () => {
			const { screen } = mount('zoom-page', 'windows');
			screen.container.style.cssText = `width: ${width}px;`;
			const root = screen.container;
			const zoomIn = screen.getByRole('button', { name: 'Μεγέθυνση' }).element();
			const address = root.querySelector<HTMLElement>('[data-guide="address-bar"]')!;
			await expect
				.poll(() => zoomIn.getBoundingClientRect().right)
				.toBeLessThanOrEqual(root.getBoundingClientRect().right);
			// The address bar stays usable: wide enough to read a short address.
			expect(address.getBoundingClientRect().width).toBeGreaterThanOrEqual(200);
		});
	}
});

/**
 * The AI chat page sat after the «search» branch, and chatgpt.com counted as a
 * search page, so the AI lesson never showed its chat box.
 */
describe('BrowserApp AI assistant page', () => {
	it('opens the AI chat for a chatgpt.com tab, and reports the question', async () => {
		const onAction = vi.fn();
		const screen = render(BrowserApp, {
			config: { goal: 'type-ai-question', initialTabs: ['chatgpt.com'] },
			onAction
		} as never);
		const box = screen.getByPlaceholder('Γράψτε την ερώτησή σας...');
		await expect.element(box).toBeVisible();
		await box.fill('Πώς ανανεώνω την ταυτότητά μου;');
		await screen.getByRole('button', { name: 'Αποστολή ερώτησης' }).click();
		expect(onAction).toHaveBeenCalledWith('type-ai-question', {
			message: 'Πώς ανανεώνω την ταυτότητά μου;'
		});
	});

	it('opens the AI chat for a gemini.google.com tab, not a Google search', async () => {
		const screen = render(BrowserApp, {
			config: { initialTabs: ['gemini.google.com'] },
			onAction: vi.fn()
		} as never);
		await expect.element(screen.getByPlaceholder('Γράψτε την ερώτησή σας...')).toBeVisible();
	});

	it('opens the AI chat when the learner types chatgpt.com in the address bar', async () => {
		const screen = render(BrowserApp, { config: {}, onAction: vi.fn() } as never);
		const bar = screen.getByPlaceholder('Πληκτρολογήστε μια διεύθυνση Web');
		await bar.fill('chatgpt.com');
		(bar.element() as HTMLInputElement).dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
		);
		await expect.element(screen.getByPlaceholder('Γράψτε την ερώτησή σας...')).toBeVisible();
	});
});

describe('BrowserApp bank page', () => {
	it('opens the bank login for a mybank.gr tab', async () => {
		render(BrowserApp, { config: { initialTabs: ['mybank.gr'] }, onAction: vi.fn() } as never);
		await vi.waitFor(() =>
			expect(document.querySelector('[data-guide="bank-login"]')).not.toBeNull()
		);
	});

	it('says which page the address opened, so a guide can wait for the bank', async () => {
		const onAction = vi.fn();
		const screen = render(BrowserApp, { config: {}, onAction } as never);
		const bar = screen.getByPlaceholder('Πληκτρολογήστε μια διεύθυνση Web');
		await bar.fill('mybank.gr');
		(bar.element() as HTMLInputElement).dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
		);
		expect(onAction).toHaveBeenCalledWith(
			'navigate',
			expect.objectContaining({ page: 'banking', isSecure: true })
		);
	});
});
