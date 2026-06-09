import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { loadManifest, findSubsection } from '$lib/content/manifest';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const manifest = await loadManifest(fetch);
	const found = findSubsection(manifest, params.course, params.sub);
	if (!found) throw error(404, 'Δεν βρέθηκε η υποενότητα');
	return { sub: found.sub, courseTitle: found.course.title, chapterTitle: found.chapter.title };
};
