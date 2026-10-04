/**
 * Guide scripts live in `docs/guides/*.script.md`: one `## <clip id>` heading per
 * clip, the text below it pasted as-is into ElevenLabs (Eleven v4). The caption
 * is the same text with the `[audio tags]` removed, so narration and captions
 * cannot drift apart. Lines starting with `>` are notes for whoever produces the
 * audio; they are neither spoken nor shown.
 */
export interface Clip {
	/** Text for ElevenLabs, audio tags included. */
	text: string;
	/** What the learner reads on screen. */
	caption: string;
}

export function stripTags(text: string): string {
	return text
		.replace(/\[[^\]]*\]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function parseScript(markdown: string, source: string): Map<string, Clip> {
	const clips = new Map<string, Clip>();
	let id: string | null = null;
	let lines: string[] = [];

	const flush = () => {
		if (id === null) return;
		const text = lines.join('\n').trim();
		if (!text) throw new Error(`${source}: clip «${id}» has no text`);
		if (clips.has(id)) throw new Error(`${source}: clip «${id}» appears twice`);
		clips.set(id, { text, caption: stripTags(text) });
	};

	for (const line of markdown.split('\n')) {
		const heading = /^##\s+(\S+)\s*$/.exec(line);
		if (heading) {
			flush();
			id = heading[1];
			lines = [];
		} else if (id !== null && !line.startsWith('>')) {
			lines.push(line);
		}
	}
	flush();
	return clips;
}
