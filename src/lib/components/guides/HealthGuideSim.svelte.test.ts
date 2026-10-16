import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HealthGuideSim from './HealthGuideSim.svelte';
import { healthGuideConfig } from '$lib/db/seeds/health-lessons';

const has = (target: string) => document.querySelector(`[data-guide="${target}"]`) !== null;

describe('HealthGuideSim', () => {
	it('shows the screen the step target names and keeps it for other targets', async () => {
		// `props:` because `target` is also a mount option.
		const screen = render(HealthGuideSim, {
			props: { config: healthGuideConfig(), target: 'health-sms', onEvent: vi.fn() }
		} as never);
		expect(has('health-sms')).toBe(true);

		await screen.rerender({ target: 'health-appointments' });
		await vi.waitFor(() => expect(has('health-appointments')).toBe(true));

		await screen.rerender({ target: null });
		expect(has('health-appointments')).toBe(true);
	});

	it('reports the events of the screen', async () => {
		const onEvent = vi.fn();
		const screen = render(HealthGuideSim, {
			props: { config: healthGuideConfig(), target: 'health-portal', onEvent }
		} as never);
		await screen.getByRole('button', { name: /Σύνδεση με Taxisnet/ }).click();
		await screen.getByRole('button', { name: /Οι συνταγές μου/ }).click();
		expect(onEvent).toHaveBeenCalledWith('health-prescriptions-viewed', {});
	});
});
