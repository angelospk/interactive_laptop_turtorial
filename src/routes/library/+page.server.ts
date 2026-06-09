import type { PageServerLoad } from './$types';
import { loadManifest } from '$lib/content/manifest';

export const load: PageServerLoad = async ({ fetch }) => {
	const manifest = await loadManifest(fetch);
	return { manifest };
};
