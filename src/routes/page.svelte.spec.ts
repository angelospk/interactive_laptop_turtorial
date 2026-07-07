import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		// +page.svelte reads `data` (user/modules/progress). Provide the minimal
		// logged-out shape so the hero heading renders.
		render(Page, {
			data: {
				user: null,
				modules: [],
				moduleCounts: {},
				moduleLessonIds: {},
				progress: {}
			}
		} as never);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
