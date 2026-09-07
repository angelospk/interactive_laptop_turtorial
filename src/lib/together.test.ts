import { describe, expect, it } from 'vitest';
import { countProgress, pickTogetherActivity, type LessonMeta } from './together';
import { getBasePathLessonIds } from './config/moduleOrganization';

function meta(id: string): LessonMeta {
	return { id, lessonKey: id, titleKey: `title.${id}` };
}

// Real module ids with a declared base path, so the test exercises the same
// config the page does rather than a fixture that could drift from it.
const ANDROID_BASE = getBasePathLessonIds('android') ?? [];

describe('pickTogetherActivity', () => {
	it('starts a learner with nothing done on their own device', () => {
		expect(ANDROID_BASE.length).toBeGreaterThan(0);
		const lessons = {
			module1: [meta('m1-a')],
			android: ANDROID_BASE.map(meta)
		};
		const a = pickTogetherActivity(['module1', 'android'], lessons, {}, 'android');
		expect(a?.moduleId).toBe('android');
		expect(a?.lesson.id).toBe(ANDROID_BASE[0]);
		expect(a?.isReview).toBe(false);
	});

	it('follows the basic route before anything added on top', () => {
		const extra = 'android-extra-not-in-base';
		const lessons = {
			// The extra sits FIRST in the module's own order; the basic route
			// still wins, because that is the part designed to be enough alone.
			android: [meta(extra), ...ANDROID_BASE.map(meta)]
		};
		const a = pickTogetherActivity(['android'], lessons, {}, 'android');
		expect(a?.lesson.id).toBe(ANDROID_BASE[0]);
	});

	it('moves on once the earlier lessons are done', () => {
		const lessons = { android: ANDROID_BASE.map(meta) };
		const progress = { [ANDROID_BASE[0]]: { completed: true } };
		const a = pickTogetherActivity(['android'], lessons, progress, 'android');
		expect(a?.lesson.id).toBe(ANDROID_BASE[1]);
	});

	it('falls past the basic route to whatever is left', () => {
		const extra = 'android-extra';
		const lessons = { android: [...ANDROID_BASE.map(meta), meta(extra)] };
		const progress = Object.fromEntries(ANDROID_BASE.map((id) => [id, { completed: true }]));
		const a = pickTogetherActivity(['android'], lessons, progress, 'android');
		expect(a?.lesson.id).toBe(extra);
		expect(a?.isReview).toBe(false);
	});

	it('offers a repeat instead of an empty page when everything is done', () => {
		const lessons = { android: ANDROID_BASE.map(meta) };
		const progress = Object.fromEntries(ANDROID_BASE.map((id) => [id, { completed: true }]));
		const a = pickTogetherActivity(['android'], lessons, progress, 'android');
		expect(a?.isReview).toBe(true);
		expect(a?.lesson.id).toBe(ANDROID_BASE[0]);
	});

	// module1 declares sections by count rather than by lesson id, so it has no
	// base-path list. It must still be reachable: a module without a declared
	// basic route is not a module to skip.
	it('still answers when the module has no declared basic route', () => {
		const lessons = { module1: [meta('m1-a'), meta('m1-b')] };
		const a = pickTogetherActivity(['module1'], lessons, {}, null);
		expect(a?.moduleId).toBe('module1');
		expect(a?.lesson.id).toBe('m1-a');
	});

	it('still answers when the learner never chose a device', () => {
		const lessons = { android: ANDROID_BASE.map(meta) };
		const a = pickTogetherActivity(['android'], lessons, {}, null);
		expect(a?.moduleId).toBe('android');
	});

	it('does not send a phone learner into a Windows module while their own has work left', () => {
		const lessons = {
			module1: [meta('m1-a')],
			android: ANDROID_BASE.map(meta)
		};
		const a = pickTogetherActivity(['module1', 'android'], lessons, {}, 'android');
		expect(a?.moduleId).toBe('android');
	});

	it('is null only when there is genuinely nothing to point at', () => {
		expect(pickTogetherActivity([], {}, {}, 'android')).toBeNull();
		expect(pickTogetherActivity(['android'], { android: [] }, {}, 'android')).toBeNull();
	});
});

describe('countProgress', () => {
	it('counts across modules and ignores rows for lessons that are gone', () => {
		const lessons = { a: [meta('a1'), meta('a2')], b: [meta('b1')] };
		const progress = { a1: { completed: true }, deleted: { completed: true } };
		expect(countProgress(lessons, progress)).toEqual({ total: 3, completed: 1 });
	});

	it('is zero of zero rather than a crash on an empty catalogue', () => {
		expect(countProgress({}, {})).toEqual({ total: 0, completed: 0 });
	});
});
