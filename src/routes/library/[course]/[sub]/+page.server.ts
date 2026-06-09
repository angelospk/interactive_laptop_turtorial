import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { loadManifest, findSubsection, flattenSubsections } from '$lib/content/manifest';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const manifest = await loadManifest(fetch);
	const found = findSubsection(manifest, params.course, params.sub);
	if (!found) throw error(404, 'Δεν βρέθηκε η υποενότητα');
	const flat = flattenSubsections(found.course);
	const idx = flat.findIndex((s) => s.id === params.sub);
	const prev = idx > 0 ? { id: flat[idx - 1].id, title: flat[idx - 1].title } : null;
	const next = idx < flat.length - 1 ? { id: flat[idx + 1].id, title: flat[idx + 1].title } : null;
	return {
		sub: found.sub,
		courseId: found.course.id,
		courseTitle: found.course.title,
		chapterTitle: found.chapter.title,
		prev,
		next
	};
};
