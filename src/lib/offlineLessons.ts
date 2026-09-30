// What still works without a connection.
//
// The service worker keeps every page the learner opened (the HTML of a full
// load, or the `__data.json` of a client-side one). The offline page used to
// promise "τα μαθήματα που έχετε ήδη ανοίξει παραμένουν διαθέσιμα" and then
// offer only a retry button. This turns the cache keys into that list.

/**
 * `hasHtml`: the whole page was kept (a full load), so it must be opened with a
 * full load for the service worker to answer it. Otherwise only its data was
 * kept (a client-side visit), and an in-app link is what can use that.
 */
export type OfflinePage = { path: string; kind: 'lesson' | 'theory'; hasHtml: boolean };

const LESSON = /^\/modules\/[^/]+\/[^/]+$/;
const THEORY = /^\/library\/[^/]+\/[^/]+$/;

/** Opened lessons and theory pages among cached URLs, first-seen order, no repeats. */
export function offlinePages(urls: readonly string[], origin?: string): OfflinePage[] {
	const byPath = new Map<string, OfflinePage>();
	for (const raw of urls) {
		let url: URL;
		try {
			url = new URL(raw);
		} catch {
			continue;
		}
		if (origin && url.origin !== origin) continue;
		const isData = url.pathname.endsWith('/__data.json');
		const path = url.pathname.replace(/\/__data\.json$/, '');
		const kind = LESSON.test(path) ? 'lesson' : THEORY.test(path) ? 'theory' : null;
		if (!kind) continue;
		const known = byPath.get(path);
		if (known) known.hasHtml ||= !isData;
		else byPath.set(path, { path, kind, hasHtml: !isData });
	}
	return [...byPath.values()];
}

/** The page's own title, without the site name after the dash. */
export function titleFromHtml(html: string): string | null {
	const match = /<title>([^<]*)<\/title>/i.exec(html);
	const title = match?.[1].split(' — ')[0].trim();
	return title || null;
}

// Titles of pages seen on this device, for pages whose HTML was never cached
// (a client-side visit keeps only the data, which has no <title> to read).
const TITLES_KEY = 'offline-titles';
const MAX_TITLES = 300;

export function rememberTitle(path: string, title: string): void {
	if (!title) return;
	try {
		const titles = readTitles();
		delete titles[path];
		titles[path] = title;
		const keys = Object.keys(titles);
		for (const old of keys.slice(0, Math.max(0, keys.length - MAX_TITLES))) delete titles[old];
		localStorage.setItem(TITLES_KEY, JSON.stringify(titles));
	} catch {
		// Storage off or full: the offline list falls back to the address.
	}
}

export function readTitles(): Record<string, string> {
	try {
		const parsed = JSON.parse(localStorage.getItem(TITLES_KEY) ?? '{}');
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		return {};
	}
}
