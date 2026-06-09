import { env } from '$env/dynamic/public';

/** Pure join: base + relPath, normalizing slashes. */
export function joinContentUrl(base: string, relPath: string): string {
	return `${base.replace(/\/+$/, '')}/${relPath.replace(/^\/+/, '')}`;
}

/** Resolve a content-relative path to a full URL using PUBLIC_CONTENT_BASE_URL. */
export function resolveContentUrl(relPath: string): string {
	const base = env.PUBLIC_CONTENT_BASE_URL || '/content';
	return joinContentUrl(base, relPath);
}
