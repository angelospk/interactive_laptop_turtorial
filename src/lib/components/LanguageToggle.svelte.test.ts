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

	it('renders both language buttons', async () => {
		const screen = render(LanguageToggle);
		await expect.element(screen.getByRole('button', { name: 'EL' })).toBeInTheDocument();
		await expect.element(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
	});

	it('switches to English and persists the preference', async () => {
		const screen = render(LanguageToggle);
		await screen.getByRole('button', { name: 'EN' }).click();
		expect(setLocale).toHaveBeenCalledWith('en');
		expect(localStorage.getItem(LOCALE_KEY)).toBe('en');
	});

	it('switches back to Greek and persists the preference', async () => {
		const screen = render(LanguageToggle);
		await screen.getByRole('button', { name: 'EN' }).click();
		await screen.getByRole('button', { name: 'EL' }).click();
		expect(setLocale).toHaveBeenLastCalledWith('el');
		expect(localStorage.getItem(LOCALE_KEY)).toBe('el');
	});
});
