import { describe, it, expect } from 'vitest';
import { wrongAppHint } from './desktopApps';

describe('wrongAppHint', () => {
	it('names both apps when the learner opens the wrong one', () => {
		expect(wrongAppHint({ goal: 'open-app', targetAppId: 'excel' }, 'word')).toBe(
			'Ανοίξατε: Word. Το μάθημα ζητά: Excel.'
		);
	});

	it('says nothing for the right app', () => {
		expect(wrongAppHint({ goal: 'open-app', targetAppId: 'excel' }, 'excel')).toBeNull();
	});

	it('says nothing when the lesson is not about opening an app', () => {
		expect(wrongAppHint({ goal: 'update-cell', targetAppId: 'excel' }, 'word')).toBeNull();
		expect(wrongAppHint({ goal: 'open-app' }, 'word')).toBeNull();
	});
});
