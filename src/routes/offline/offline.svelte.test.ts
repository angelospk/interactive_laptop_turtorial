import { afterEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import OfflinePage from './+page.svelte';

afterEach(() => vi.unstubAllGlobals());

function stubCaches(entries: Record<string, string | null>) {
	const cache = {
		keys: async () => Object.keys(entries).map((url) => new Request(url)),
		match: async (req: Request | string) => {
			const url = typeof req === 'string' ? new URL(req, location.origin).href : req.url;
			const html = entries[url];
			return html ? new Response(html) : undefined;
		}
	};
	vi.stubGlobal('caches', {
		keys: async () => ['runtime-1'],
		open: async () => cache,
		match: async (req: Request | string) => cache.match(req)
	});
}

test('offers the lessons already opened on this device, by name', async () => {
	const o = location.origin;
	stubCaches({
		[`${o}/modules/module1/hover-balloons`]:
			'<html><head><title>Βασική Κίνηση Ποντικιού — Ψηφιακά Βήματα</title></head></html>',
		[`${o}/library/basics/mouse/__data.json`]: null
	});
	const screen = render(OfflinePage);
	await expect
		.element(screen.getByRole('link', { name: /Βασική Κίνηση Ποντικιού/ }))
		.toHaveAttribute('href', '/modules/module1/hover-balloons');
	await expect
		.element(screen.getByRole('link', { name: /Θεωρία/ }))
		.toHaveAttribute('href', '/library/basics/mouse');
	// Saved as a whole page: a full load, which the service worker answers from cache.
	await expect
		.element(screen.getByRole('link', { name: /Βασική Κίνηση Ποντικιού/ }))
		.toHaveAttribute('data-sveltekit-reload');
});

test('pages kept only as data still have their own names and open in-app', async () => {
	const o = location.origin;
	localStorage.setItem(
		'offline-titles',
		JSON.stringify({ '/modules/m/a': 'Διπλό Κλικ', '/modules/m/b': 'Σύρε και άφησε' })
	);
	stubCaches({
		[`${o}/modules/m/a/__data.json`]: null,
		[`${o}/modules/m/b/__data.json`]: null,
		[`${o}/modules/m/c/__data.json`]: null
	});
	try {
		const screen = render(OfflinePage);
		const a = screen.getByRole('link', { name: 'Μάθημα: Διπλό Κλικ' });
		await expect.element(a).toBeInTheDocument();
		await expect.element(a).not.toHaveAttribute('data-sveltekit-reload');
		await expect
			.element(screen.getByRole('link', { name: 'Μάθημα: Σύρε και άφησε' }))
			.toBeInTheDocument();
		// Never seen with a title: still told apart by its address.
		await expect.element(screen.getByRole('link', { name: 'Μάθημα: c' })).toBeInTheDocument();
	} finally {
		localStorage.removeItem('offline-titles');
	}
});

test('says nothing about a list when nothing was saved', async () => {
	stubCaches({});
	const screen = render(OfflinePage);
	await expect.element(screen.getByRole('button', { name: 'Δοκιμάστε ξανά' })).toBeInTheDocument();
	await expect.element(screen.getByRole('list')).not.toBeInTheDocument();
});
