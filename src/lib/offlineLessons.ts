// What still works without a connection.
//
// The service worker keeps every page the learner opened (the HTML of a full
// load, or the `__data.json` of a client-side one). The offline page used to
// promise "τα μαθήματα που έχετε ήδη ανοίξει παραμένουν διαθέσιμα" and then
// offer only a retry button. This turns the cache keys into that list.

export type OfflinePage = { path: string; kind: 'lesson' | 'theory' };

const LESSON = /^\/modules\/[^/]+\/[^/]+$/;
const THEORY = /^\/library\/[^/]+\/[^/]+$/;

/** Opened lessons and theory pages among cached URLs, first-seen order, no repeats. */
export function offlinePages(urls: readonly string[], origin?: string): OfflinePage[] {
	const seen = new Set<string>();
	const pages: OfflinePage[] = [];
	for (const raw of urls) {
		let url: URL;
		try {
			url = new URL(raw);
		} catch {
			continue;
		}
		if (origin && url.origin !== origin) continue;
		const path = url.pathname.replace(/\/__data\.json$/, '');
		const kind = LESSON.test(path) ? 'lesson' : THEORY.test(path) ? 'theory' : null;
		if (!kind || seen.has(path)) continue;
		seen.add(path);
		pages.push({ path, kind });
	}
	return pages;
}

/** The page's own title, without the site name after the dash. */
export function titleFromHtml(html: string): string | null {
	const match = /<title>([^<]*)<\/title>/i.exec(html);
	const title = match?.[1].split(' — ')[0].trim();
	return title || null;
}
