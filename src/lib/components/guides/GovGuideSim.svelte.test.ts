import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import GovGuideSim from './GovGuideSim.svelte';
import { govGuideConfig } from '$lib/db/seeds/gov-lessons';

const has = (target: string) => document.querySelector(`[data-guide="${target}"]`) !== null;

describe('GovGuideSim', () => {
	it('shows the screen of the step target, even after a skipped step', async () => {
		// `props:` because `target` is also a mount option.
		const screen = render(GovGuideSim, {
			props: { config: govGuideConfig(), target: 'gov-login-button', onEvent: vi.fn() }
		});
		expect(has('gov-login-button')).toBe(true);

		// Login skipped: the next step points at a service tile.
		await screen.rerender({ target: 'gov-service-family-cert' });
		await vi.waitFor(() => expect(has('gov-service-family-cert')).toBe(true));

		// A target on every screen (the header) keeps the screen we are on.
		await screen.rerender({ target: 'gov-header' });
		expect(has('gov-service-family-cert')).toBe(true);

		await screen.rerender({ target: 'gov-download' });
		await vi.waitFor(() => expect(has('gov-download')).toBe(true));
	});

	it('reports the events of the screen', async () => {
		const onEvent = vi.fn();
		render(GovGuideSim, { props: { config: govGuideConfig(), target: 'gov-service-x', onEvent } });
		(document.querySelector('[data-guide="gov-service-citizen-mailbox"]') as HTMLElement).click();
		expect(onEvent).toHaveBeenCalledWith('gov-service-selected', { serviceId: 'citizen-mailbox' });
	});
});
