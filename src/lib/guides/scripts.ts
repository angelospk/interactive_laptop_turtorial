import { parseScript, type Clip } from './script';

// The scripts are documents first (Harold pastes them into ElevenLabs), so they
// live in docs/ and are bundled from there.
const files = import.meta.glob('/docs/guides/*.script.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

function load(): Map<string, Clip> {
	const all = new Map<string, Clip>();
	for (const [path, markdown] of Object.entries(files)) {
		for (const [id, clip] of parseScript(markdown, path)) {
			if (all.has(id))
				throw new Error(`${path}: clip «${id}» is already defined in another script`);
			all.set(id, clip);
		}
	}
	return all;
}

let cache: Map<string, Clip> | null = null;

/** Every clip of every guide script, by id. */
export function allClips(): Map<string, Clip> {
	cache ??= load();
	return cache;
}
