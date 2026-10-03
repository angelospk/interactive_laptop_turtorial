/**
 * Which section «Προηγούμενη / Επόμενη ενότητα» should jump to.
 *
 * `tops` are the section headings' positions relative to where a heading lands
 * after a jump (0 = this section starts right here). Next is the first heading
 * still below that line; previous is the last one above it, so pressing
 * «Προηγούμενη» in the middle of a section first returns to its start.
 */
const TOLERANCE = 2;

export function pickSection(tops: number[], dir: 'prev' | 'next'): number {
	if (dir === 'next') return tops.findIndex((top) => top > TOLERANCE);
	return tops.findLastIndex((top) => top < -TOLERANCE);
}
