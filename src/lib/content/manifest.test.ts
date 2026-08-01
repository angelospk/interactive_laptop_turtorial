import { describe, it, expect, vi } from 'vitest';
import {
	loadManifest,
	findSubsection,
	flattenSubsections,
	type Manifest,
	type Course
} from './manifest';

/** Minimal course: 2 chapters × 2 subsections, so prev/next has interior + both ends. */
function makeCourse(id = 'esm005'): Course {
	const sub = (sid: string, title: string) => ({
		id: sid,
		title,
		mdPath: `md/${id}/${sid}.md`,
		sourceUrl: `https://example.test/${sid}`,
		modules: ['module1'],
		kind: 'section'
	});
	return {
		id,
		moduleNumber: 5,
		title: 'Course 5',
		courseUrl: `https://example.test/${id}`,
		chapters: [
			{ title: 'Chapter 1', subsections: [sub('c1-s1', 'First'), sub('c1-s2', 'Second')] },
			{ title: 'Chapter 2', subsections: [sub('c2-s1', 'Third'), sub('c2-s2', 'Fourth')] }
		]
	};
}

function makeManifest(): Manifest {
	return { courses: [makeCourse('esm005'), makeCourse('esm001')] };
}

describe('loadManifest', () => {
	it('parses the JSON body on a 200 response', async () => {
		const manifest = makeManifest();
		const fetchFn = vi.fn(async () => new Response(JSON.stringify(manifest), { status: 200 }));

		const result = await loadManifest(fetchFn as unknown as typeof fetch);

		expect(result.courses).toHaveLength(2);
		expect(result.courses[0].id).toBe('esm005');
	});

	it('requests the manifest.json under the configured content base', async () => {
		const fetchFn = vi.fn(
			async () => new Response(JSON.stringify({ courses: [] }), { status: 200 })
		);

		await loadManifest(fetchFn as unknown as typeof fetch);

		expect(fetchFn).toHaveBeenCalledTimes(1);
		expect(String(fetchFn.mock.calls[0][0])).toMatch(/manifest\.json$/);
	});

	it('throws with the status code when the response is not ok', async () => {
		const fetchFn = vi.fn(async () => new Response('nope', { status: 404 }));

		await expect(loadManifest(fetchFn as unknown as typeof fetch)).rejects.toThrow(
			'manifest HTTP 404'
		);
	});

	it('does not parse the body when the response is not ok', async () => {
		// A 500 that returns HTML must surface as the HTTP error, not a JSON parse error.
		const fetchFn = vi.fn(async () => new Response('<html>oops</html>', { status: 500 }));

		await expect(loadManifest(fetchFn as unknown as typeof fetch)).rejects.toThrow(
			'manifest HTTP 500'
		);
	});
});

describe('findSubsection', () => {
	it('finds a subsection in the first chapter', () => {
		const found = findSubsection(makeManifest(), 'esm005', 'c1-s2');

		expect(found).not.toBeNull();
		expect(found?.sub.title).toBe('Second');
		expect(found?.chapter.title).toBe('Chapter 1');
		expect(found?.course.id).toBe('esm005');
	});

	it('keeps searching past the first chapter', () => {
		const found = findSubsection(makeManifest(), 'esm005', 'c2-s1');

		expect(found?.chapter.title).toBe('Chapter 2');
		expect(found?.sub.title).toBe('Third');
	});

	it('returns null for an unknown course', () => {
		expect(findSubsection(makeManifest(), 'does-not-exist', 'c1-s1')).toBeNull();
	});

	it('returns null for a known course but unknown subsection', () => {
		expect(findSubsection(makeManifest(), 'esm005', 'does-not-exist')).toBeNull();
	});

	it('scopes the subsection lookup to the requested course', () => {
		// Both courses use the same subsection ids, so a course-blind search would
		// return the wrong course object.
		const found = findSubsection(makeManifest(), 'esm001', 'c1-s1');

		expect(found?.course.id).toBe('esm001');
	});
});

describe('flattenSubsections', () => {
	it('flattens chapters in order', () => {
		expect(flattenSubsections(makeCourse()).map((s) => s.id)).toEqual([
			'c1-s1',
			'c1-s2',
			'c2-s1',
			'c2-s2'
		]);
	});

	it('returns an empty array for a course with no chapters', () => {
		expect(flattenSubsections({ ...makeCourse(), chapters: [] })).toEqual([]);
	});

	it('skips empty chapters without leaving holes', () => {
		const course = makeCourse();
		course.chapters.splice(1, 0, { title: 'Empty', subsections: [] });

		expect(flattenSubsections(course).map((s) => s.id)).toEqual([
			'c1-s1',
			'c1-s2',
			'c2-s1',
			'c2-s2'
		]);
	});

	// Guards the prev/next arithmetic in routes/library/[course]/[sub]/+page.server.ts,
	// which indexes into this flat array.
	it('has no previous entry at the first subsection', () => {
		const flat = flattenSubsections(makeCourse());
		const idx = flat.findIndex((s) => s.id === 'c1-s1');

		expect(idx).toBe(0);
		expect(flat[idx - 1]).toBeUndefined();
	});

	it('has no next entry at the last subsection', () => {
		const flat = flattenSubsections(makeCourse());
		const idx = flat.findIndex((s) => s.id === 'c2-s2');

		expect(idx).toBe(flat.length - 1);
		expect(flat[idx + 1]).toBeUndefined();
	});

	it('crosses the chapter boundary for prev/next', () => {
		const flat = flattenSubsections(makeCourse());
		const idx = flat.findIndex((s) => s.id === 'c1-s2');

		expect(flat[idx + 1].id).toBe('c2-s1');
		expect(flat[idx - 1].id).toBe('c1-s1');
	});
});
