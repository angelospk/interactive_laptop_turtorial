import { resolveContentUrl } from './contentUrl';

/** Deep link from a library subsection straight to a specific interactive lesson. */
export interface LessonLink {
	module: string;
	lesson: string;
	label?: string;
}
export interface Subsection {
	id: string;
	title: string;
	mdPath: string;
	sourceUrl: string;
	modules: string[];
	/** Optional, backwards-compatible: links to specific lessons (not just modules). */
	lessonLinks?: LessonLink[];
	kind: string;
}
export interface Chapter {
	title: string;
	subsections: Subsection[];
}
export interface Course {
	id: string;
	moduleNumber: number;
	title: string;
	courseUrl: string;
	chapters: Chapter[];
}
export interface Manifest {
	courses: Course[];
}

export async function loadManifest(fetchFn: typeof fetch): Promise<Manifest> {
	const res = await fetchFn(resolveContentUrl('manifest.json'));
	if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
	return (await res.json()) as Manifest;
}

export function findSubsection(manifest: Manifest, courseId: string, subId: string) {
	const course = manifest.courses.find((c) => c.id === courseId);
	if (!course) return null;
	for (const ch of course.chapters) {
		const sub = ch.subsections.find((s) => s.id === subId);
		if (sub) return { course, chapter: ch, sub };
	}
	return null;
}

export function flattenSubsections(course: Course): Subsection[] {
	return course.chapters.flatMap((ch) => ch.subsections);
}
