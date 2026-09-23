import { describe, expect, test } from 'vitest';
import { getAssistantContent } from './assistant';

// The assistant used to fall back to the lesson description, which is already
// printed under the lesson title and, for most lesson types, a third time as the
// in-lesson "Οδηγίες" line. Three copies of one sentence is what a learner reads
// as clutter, so the assistant now only speaks when it has something to add.

const lesson = (config: unknown, description = 'Μάθετε να κινείτε το ποντίκι.') =>
	({ config, description }) as never;

describe('getAssistantContent', () => {
	test('offers structured steps when the lesson has them', () => {
		expect(getAssistantContent(lesson({ tutorialSteps: ['Βήμα 1', 'Βήμα 2'] }))).toEqual([
			'Βήμα 1',
			'Βήμα 2'
		]);
	});

	test('stays quiet about instructions, which the lesson itself keeps on screen', () => {
		expect(getAssistantContent(lesson({ instructions: 'Κάνε κλικ στο εικονίδιο.' }))).toBeNull();
	});

	test('authored steps are what it does offer', () => {
		expect(
			getAssistantContent(lesson({ tutorialSteps: ['Βήμα 1'], instructions: 'Γενικά λόγια' }))
		).toEqual(['Βήμα 1']);
	});

	test('says nothing when the lesson has neither', () => {
		expect(getAssistantContent(lesson({ theme: 'balloons' }))).toBeNull();
	});

	test('never falls back to the description the learner can already read', () => {
		expect(getAssistantContent(lesson({}, 'Μάθετε να κινείτε το ποντίκι.'))).toBeNull();
	});

	test('ignores differences in whitespace and case when comparing steps', () => {
		expect(
			getAssistantContent(
				lesson({ tutorialSteps: ['  ΜΕΤΑΚΙΝΉΣΤΕ  το ποντίκι. '] }, 'Μετακινήστε το ποντίκι.')
			)
		).toBeNull();
	});

	test('drops steps that are all repeats of the description', () => {
		const line = 'Κάνε κλικ στον κάδο.';
		expect(getAssistantContent(lesson({ tutorialSteps: [line, '  '] }, line))).toBeNull();
	});

	test('keeps the steps that do add something', () => {
		const line = 'Κάνε κλικ στον κάδο.';
		expect(
			getAssistantContent(lesson({ tutorialSteps: [line, 'Μετά πάτα Enter.'] }, line))
		).toEqual(['Μετά πάτα Enter.']);
	});

	test('treats empty strings and empty arrays as nothing to say', () => {
		expect(getAssistantContent(lesson({ tutorialSteps: ['  ', ''] }))).toBeNull();
		expect(getAssistantContent(lesson({ tutorialSteps: [] }))).toBeNull();
	});

	test('survives a lesson with no config at all', () => {
		expect(getAssistantContent(lesson(null, ''))).toBeNull();
	});
});
