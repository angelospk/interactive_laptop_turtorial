import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SettingsApp from './SettingsApp.svelte';

/**
 * bd-cc7: `initialPage` used to be re-applied by a prop->state `$effect`, so any
 * re-render of the parent snapped the learner back to the deep-linked page. It
 * is a reassignable `$derived` now: the prop is the default, a click overrides
 * it, and a genuinely new value takes over again.
 */
const mount = (initialPage?: string) =>
	render(SettingsApp, { config: { initialPage }, onAction: vi.fn() } as never);

describe('SettingsApp deep link', () => {
	it('opens on the page the deep link asked for', async () => {
		const screen = mount('bluetooth');
		await expect.element(screen.getByRole('heading', { name: 'Bluetooth' })).toBeInTheDocument();
	});

	it('opens on the system page when no page is requested', async () => {
		const screen = mount();
		await expect.element(screen.getByRole('heading', { name: 'Οθόνη & Ήχος' })).toBeInTheDocument();
	});

	it('keeps the learner where they clicked instead of snapping back', async () => {
		const screen = mount('bluetooth');
		await screen.getByRole('button', { name: /Εφαρμογές/ }).click();
		await expect
			.element(screen.getByRole('heading', { name: 'Εφαρμογές & Δυνατότητες' }))
			.toBeInTheDocument();
	});
});

describe('SettingsApp accessibility switches', () => {
	it('turns a setting on, reports it, and makes the text larger', async () => {
		const onAction = vi.fn();
		const screen = render(SettingsApp, {
			config: { initialPage: 'accessibility' },
			onAction
		} as never);
		const larger = screen.getByRole('switch', { name: 'Μεγαλύτερο κείμενο' });
		await larger.click();
		await expect.element(larger).toBeChecked();
		expect(onAction).toHaveBeenCalledWith('toggle-accessibility', {
			setting: 'larger-text',
			on: true
		});
		await expect.element(screen.getByTestId('accessibility-panel')).toHaveClass(/text-lg/);
	});

	it('reports switching a setting back off', async () => {
		const onAction = vi.fn();
		const screen = render(SettingsApp, {
			config: { initialPage: 'accessibility' },
			onAction
		} as never);
		const contrast = screen.getByRole('switch', { name: 'Υψηλή αντίθεση' });
		await contrast.click();
		await contrast.click();
		expect(onAction).toHaveBeenLastCalledWith('toggle-accessibility', {
			setting: 'high-contrast',
			on: false
		});
	});
});
