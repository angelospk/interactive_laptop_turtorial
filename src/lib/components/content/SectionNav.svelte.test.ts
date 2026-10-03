import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import '../../../routes/layout.css';
import SectionNav from './SectionNav.svelte';

const toc = [
	{ id: 'reply', text: 'Απάντηση σε email', level: 2 as const },
	{ id: 'reply-mobile', text: 'Απάντηση σε email από κινητό', level: 3 as const },
	{ id: 'forward', text: 'Προώθηση email', level: 2 as const },
	{ id: 'move', text: 'Μετακίνηση email', level: 2 as const }
];

let page: HTMLElement;

function longPage() {
	page = document.createElement('div');
	for (const entry of toc) {
		const h = document.createElement(entry.level === 2 ? 'h2' : 'h3');
		h.id = entry.id;
		h.textContent = entry.text;
		h.style.height = '1500px';
		page.append(h);
	}
	document.body.prepend(page);
}

afterEach(() => {
	page?.remove();
	window.scrollTo(0, 0);
});

const topOf = (id: string) => document.getElementById(id)!.getBoundingClientRect().top;

describe('SectionNav', () => {
	it('jumps to the next and previous section, skipping sub-headings', async () => {
		longPage();
		const screen = render(SectionNav, { toc });
		document.getElementById('reply')!.scrollIntoView();

		// A DOM click: a real pointer would first scroll the page down to the bar,
		// which in this bare test page sits after all the sections.
		(screen.getByRole('button', { name: 'Επόμενη ενότητα' }).element() as HTMLElement).click();
		await expect.poll(() => Math.abs(topOf('forward')) < 5, { timeout: 3000 }).toBe(true);

		(screen.getByRole('button', { name: 'Προηγούμενη ενότητα' }).element() as HTMLElement).click();
		await expect.poll(() => Math.abs(topOf('reply')) < 5, { timeout: 3000 }).toBe(true);
	});

	it('opens the full contents list', async () => {
		longPage();
		const screen = render(SectionNav, { toc });
		await screen.getByRole('button', { name: /Περιεχόμενα/ }).click();
		await expect.element(screen.getByRole('link', { name: 'Προώθηση email' })).toBeVisible();
	});
});
