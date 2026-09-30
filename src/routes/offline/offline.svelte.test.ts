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
});

test('says nothing about a list when nothing was saved', async () => {
	stubCaches({});
	const screen = render(OfflinePage);
	await expect.element(screen.getByRole('button', { name: 'Δοκιμάστε ξανά' })).toBeInTheDocument();
	await expect.element(screen.getByRole('list')).not.toBeInTheDocument();
});
