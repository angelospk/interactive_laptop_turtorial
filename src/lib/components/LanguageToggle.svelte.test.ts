import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';

// The real runtime.setLocale reloads the page, which would tear down the test
// harness. Mock it so we can assert the locale switch + persistence in isolation.
const setLocale = vi.fn();
let mockLocale: 'el' | 'en' = 'el';
vi.mock('$lib/paraglide/runtime', () => ({
	setLocale: (locale: 'el' | 'en') => setLocale(locale),
	getLocale: () => mockLocale
}));

import LanguageToggle from './LanguageToggle.svelte';

const LOCALE_KEY = 'preferred-locale';

describe('LanguageToggle', () => {
	beforeEach(() => {
		setLocale.mockClear();
		mockLocale = 'el';
		localStorage.removeItem(LOCALE_KEY);
	});

	it('names both languages and marks the current one', async () => {
		const screen = render(LanguageToggle);
		await expect
			.element(screen.getByRole('button', { name: 'Ελληνικά' }))
			.toHaveAttribute('aria-pressed', 'true');
		await expect
			.element(screen.getByRole('button', { name: 'English' }))
			.toHaveAttribute('aria-pressed', 'false');
	});

	it('switches to English and persists the preference', async () => {
		const screen = render(LanguageToggle);
		await screen.getByRole('button', { name: 'English' }).click();
		expect(setLocale).toHaveBeenCalledWith('en');
		expect(localStorage.getItem(LOCALE_KEY)).toBe('en');
	});

	it('switches back to Greek and persists the preference', async () => {
		const screen = render(LanguageToggle);
		await screen.getByRole('button', { name: 'English' }).click();
		await screen.getByRole('button', { name: 'Ελληνικά' }).click();
		expect(setLocale).toHaveBeenLastCalledWith('el');
		expect(localStorage.getItem(LOCALE_KEY)).toBe('el');
	});
});
