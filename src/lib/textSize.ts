// "Μεγαλύτερα γράμματα": one switch for the whole site.
//
// Every size here is in rem, so scaling the root font scales text, spacing and
// targets together — the page keeps its shape instead of text overflowing its
// boxes. Remembered per browser (the learner's own device), and applied by an
// inline script in app.html before the first paint, so a large-text reader
// never sees the small page flash first.

export const TEXT_SIZE_KEY = 'text-size';
export const LARGE_CLASS = 'text-large';

export function isLargeText(): boolean {
	return document.documentElement.classList.contains(LARGE_CLASS);
}

export function setLargeText(large: boolean): void {
	document.documentElement.classList.toggle(LARGE_CLASS, large);
	try {
		if (large) localStorage.setItem(TEXT_SIZE_KEY, 'large');
		else localStorage.removeItem(TEXT_SIZE_KEY);
	} catch {
		// Private mode or storage off: the choice still holds for this page.
	}
}
