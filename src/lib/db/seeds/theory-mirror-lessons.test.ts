import { describe, it, expect } from 'vitest';
import { allLessons } from './index';
import theoryManifest from '../../../../content/manifest.json';
import type { Manifest } from '$lib/content/manifest';

/**
 * Lessons that mirror a concrete scenario from the theory (docs/theory-exercise-mapping.md).
 * Each block pins the scenario the lesson must practise and that the theory
 * subsection links to it, so the two cannot drift apart silently.
 */

const byId = new Map(allLessons.map((l) => [l.id, l]));
const config = (id: string) => (byId.get(id)?.config ?? {}) as Record<string, unknown>;

const subsections = (theoryManifest as Manifest).courses.flatMap((c) =>
	c.chapters.flatMap((ch) => ch.subsections)
);
const linksOf = (subId: string) =>
	(subsections.find((s) => s.id === subId)?.lessonLinks ?? []).map(
		(l) => `${l.module}/${l.lesson}`
	);

describe('P1 — gov.gr: κάρτα ανεργίας & θυρίδα πολίτη (esm002-c3-s3)', () => {
	it('finds the unemployment-card service among decoys', () => {
		const c = config('gov-find-unemployment-card');
		expect(c.goal).toBe('gov-find-service');
		expect(c.targetServiceId).toBe('unemployment-card');
		expect((c.services as unknown[]).length).toBeGreaterThanOrEqual(3);
	});

	it('downloads the unemployment card as a PDF', () => {
		const c = config('gov-download-unemployment-card');
		expect(c.goal).toBe('download-file');
		expect((c.certificate as { filename: string }).filename).toMatch(/\.pdf$/);
	});

	it('finds the citizen mailbox', () => {
		expect(config('gov-find-citizen-mailbox').targetServiceId).toBe('citizen-mailbox');
	});

	it('is linked from the public-services theory section', () => {
		expect(linksOf('esm002-c3-s3')).toEqual(
			expect.arrayContaining(['gov/gov-find-unemployment-card', 'gov/gov-find-citizen-mailbox'])
		);
	});
});
