import { describe, it, expect, vi } from 'vitest';
import { load } from './+page.server';
import type { Manifest, Course } from '$lib/content/manifest';

/**
 * The prev/next arithmetic lives in this loader, not in flattenSubsections —
 * so the off-by-one risk at both ends of the flat list is only reachable here.
 */

function makeCourse(id: string): Course {
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
		title: `Course ${id}`,
		courseUrl: `https://example.test/${id}`,
		chapters: [
			{ title: 'Chapter 1', subsections: [sub('c1-s1', 'First'), sub('c1-s2', 'Second')] },
			{ title: 'Chapter 2', subsections: [sub('c2-s1', 'Third'), sub('c2-s2', 'Fourth')] }
		]
	};
}

const MANIFEST: Manifest = { courses: [makeCourse('esm005'), makeCourse('esm001')] };

function makeEvent(course: string, sub: string, manifest: Manifest = MANIFEST) {
	return {
		fetch: vi.fn(async () => new Response(JSON.stringify(manifest), { status: 200 })),
		params: { course, sub }
	} as unknown as Parameters<typeof load>[0];
}

describe('library/[course]/[sub] load', () => {
	it('returns the subsection with its course and chapter context', async () => {
		const data = await load(makeEvent('esm005', 'c1-s2'));

		expect(data.sub.title).toBe('Second');
		expect(data.courseId).toBe('esm005');
		expect(data.courseTitle).toBe('Course esm005');
		expect(data.chapterTitle).toBe('Chapter 1');
	});

	it('has no prev at the very first subsection', async () => {
		const data = await load(makeEvent('esm005', 'c1-s1'));

		expect(data.prev).toBeNull();
		expect(data.next).toEqual({ id: 'c1-s2', title: 'Second' });
	});

	it('has no next at the very last subsection', async () => {
		const data = await load(makeEvent('esm005', 'c2-s2'));

		expect(data.next).toBeNull();
		expect(data.prev).toEqual({ id: 'c2-s1', title: 'Third' });
	});

	it('links prev and next across the chapter boundary', async () => {
		const data = await load(makeEvent('esm005', 'c1-s2'));

		expect(data.prev).toEqual({ id: 'c1-s1', title: 'First' });
		expect(data.next).toEqual({ id: 'c2-s1', title: 'Third' });
	});

	it('resolves neighbours inside the requested course, not the first one', async () => {
		// Both courses share subsection ids; a course-blind flatten would produce
		// neighbours from esm005 while serving esm001.
		const data = await load(makeEvent('esm001', 'c1-s2'));

		expect(data.courseId).toBe('esm001');
		expect(data.next).toEqual({ id: 'c2-s1', title: 'Third' });
	});

	it('throws 404 for an unknown course', async () => {
		await expect(load(makeEvent('nope', 'c1-s1'))).rejects.toMatchObject({ status: 404 });
	});

	it('throws 404 for an unknown subsection in a known course', async () => {
		await expect(load(makeEvent('esm005', 'nope'))).rejects.toMatchObject({ status: 404 });
	});

	it('handles a single-subsection course with neither prev nor next', async () => {
		const solo: Manifest = {
			courses: [
				{
					...makeCourse('esm009'),
					chapters: [
						{
							title: 'Only',
							subsections: [
								{
									id: 'only-s1',
									title: 'Only one',
									mdPath: 'md/esm009/only-s1.md',
									sourceUrl: 'https://example.test/only-s1',
									modules: [],
									kind: 'section'
								}
							]
						}
					]
				}
			]
		};

		const data = await load(makeEvent('esm009', 'only-s1', solo));

		expect(data.prev).toBeNull();
		expect(data.next).toBeNull();
	});

	it('propagates a manifest fetch failure instead of rendering an empty page', async () => {
		const event = {
			fetch: vi.fn(async () => new Response('nope', { status: 503 })),
			params: { course: 'esm005', sub: 'c1-s1' }
		} as unknown as Parameters<typeof load>[0];

		await expect(load(event)).rejects.toThrow('manifest HTTP 503');
	});
});
