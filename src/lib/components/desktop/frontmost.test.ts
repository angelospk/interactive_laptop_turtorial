import { describe, expect, it } from 'vitest';
import { frontmostWindowId } from './frontmost';

// Keyboard shortcuts belong to the window in front. A browser lesson that kept
// listening while an e-mail window covered it finished the lesson unseen.
describe('frontmostWindowId', () => {
	it('is the last window brought forward', () => {
		const windows = [
			{ id: 'browser', minimized: false },
			{ id: 'mail', minimized: false }
		];
		expect(frontmostWindowId(windows)).toBe('mail');
	});

	it('skips minimised windows, which are not on screen', () => {
		const windows = [
			{ id: 'browser', minimized: false },
			{ id: 'mail', minimized: true }
		];
		expect(frontmostWindowId(windows)).toBe('browser');
	});

	it('is nobody when nothing is on screen', () => {
		expect(frontmostWindowId([{ id: 'browser', minimized: true }])).toBeUndefined();
		expect(frontmostWindowId([])).toBeUndefined();
	});
});
