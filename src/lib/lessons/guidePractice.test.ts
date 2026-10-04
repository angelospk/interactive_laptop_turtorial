import { expect, test } from 'vitest';
import { practiceAfterCompletion, readPractice, savePractice } from './guidePractice';

test('retrying guide completion retains unknown exercises; a new all-known guide clears them', () => {
	const guide = { id: 'guide', lessonType: 'guide' };
	const unknown = practiceAfterCompletion([], guide, ['close-tab', 'download', 'zoom']);
	expect(practiceAfterCompletion(unknown, guide)).toEqual(unknown);
	expect(practiceAfterCompletion(unknown, guide, [])).toEqual([]);
	expect(practiceAfterCompletion(unknown, { id: 'close-tab', lessonType: 'browser' })).toEqual([
		'download',
		'zoom'
	]);
});

test('practice survives a reload and stays separate between users and modules', () => {
	const entries = new Map<string, string>();
	const storage = {
		getItem: (key: string) => entries.get(key) ?? null,
		setItem: (key: string, value: string) => {
			entries.set(key, value);
		},
		removeItem: (key: string) => {
			entries.delete(key);
		}
	};
	savePractice(storage, 'guide-practice:user1:module5', ['close-tab']);
	expect(readPractice(storage, 'guide-practice:user1:module5')).toEqual(['close-tab']);
	expect(readPractice(storage, 'guide-practice:user2:module5')).toEqual([]);
	expect(readPractice(storage, 'guide-practice:user1:module6')).toEqual([]);
	savePractice(storage, 'guide-practice:user1:module5', []);
	expect(entries.size).toBe(0);
});
