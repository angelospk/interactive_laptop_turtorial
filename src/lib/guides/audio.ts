/**
 * Narration for a guide: one clip at a time from `static/audio/guides/<id>.mp3`.
 * Muted, missing or blocked audio is not an error: the clip "ends" after the
 * time it takes to read its caption, so the guide moves on the same way.
 */
export interface GuideAudio {
	/** Plays `id`; `onEnd` runs once, unless another clip or stop() comes first. */
	play(id: string, caption: string, onEnd: () => void): void;
	stop(): void;
	setMuted(muted: boolean): void;
}

/** Time to read a caption: 55ms a character, never under 2.5s. */
export function readingMs(caption: string): number {
	return Math.max(2500, caption.length * 55);
}

export function createGuideAudio(opts: {
	base?: string;
	muted: boolean;
	createAudio?: (src: string) => HTMLAudioElement;
}): GuideAudio {
	const base = opts.base ?? '/audio/guides/';
	const createAudio = opts.createAudio ?? ((src: string) => new Audio(src));
	let muted = opts.muted;
	let el: HTMLAudioElement | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let current: { caption: string; done: () => void } | null = null;

	const silence = () => {
		if (el) {
			el.onended = el.onerror = null;
			el.pause();
			el = null;
		}
		if (timer) clearTimeout(timer);
		timer = null;
	};

	const fallback = () => {
		const clip = current;
		if (!clip) return;
		silence();
		timer = setTimeout(clip.done, readingMs(clip.caption));
	};

	return {
		play(id, caption, onEnd) {
			silence();
			const clip = {
				caption,
				done: () => {
					if (current !== clip) return;
					current = null;
					silence();
					onEnd();
				}
			};
			current = clip;
			if (muted) return fallback();
			const audio = createAudio(`${base}${id}.mp3`);
			el = audio;
			audio.onended = clip.done;
			audio.onerror = fallback;
			// A download that stalls fires neither event; the guide must not hang on it.
			timer = setTimeout(clip.done, readingMs(caption) * 2 + 5000);
			audio.play().catch(() => {
				if (el === audio) fallback();
			});
		},
		stop() {
			current = null;
			silence();
		},
		setMuted(next) {
			muted = next;
			if (muted && el) fallback();
		}
	};
}
