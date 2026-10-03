import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import '../../../routes/layout.css';
import TocSidebar from './TocSidebar.svelte';
import { LARGE_CLASS } from '$lib/textSize';

const toc = Array.from({ length: 40 }, (_, i) => ({
	id: `s${i}`,
	text: `Ενότητα ${i + 1} με αρκετά μεγάλο τίτλο`,
	level: 2 as const
}));

afterEach(() => document.documentElement.classList.remove(LARGE_CLASS));

describe('TocSidebar', () => {
	// With «Μεγαλύτερα γράμματα» on, the list is taller than the screen. It used
	// to stay pinned and cut off; every entry must stay reachable.
	it('scrolls inside itself so the last entry is reachable in large text', async () => {
		document.documentElement.classList.add(LARGE_CLASS);
		const screen = render(TocSidebar, { toc });
		const panel = screen.container.querySelector<HTMLElement>('[data-toc-sidebar]')!;

		expect(panel.getBoundingClientRect().height).toBeLessThanOrEqual(window.innerHeight);
		expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);

		const last = screen.getByRole('link', { name: /Ενότητα 40/ }).element();
		last.scrollIntoView({ block: 'nearest' });
		await expect.poll(() => last.getBoundingClientRect().bottom <= window.innerHeight).toBe(true);
		expect(panel.scrollTop).toBeGreaterThan(0);
	});
});
