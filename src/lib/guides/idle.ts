/**
 * «Μήπως κολλήσατε;»: two nudges after a stretch without input, then silence.
 * Never a time limit: nothing here moves the learner on or out (WCAG 2.2.1).
 */
export interface IdleWatcher {
	/** Activity (or a new step): start counting from zero. */
	reset(): void;
	stop(): void;
}

export function createIdleWatcher(opts: {
	firstMs: number;
	secondMs: number;
	onNudge: (level: 1 | 2) => void;
}): IdleWatcher {
	let timers: ReturnType<typeof setTimeout>[] = [];
	const stop = () => {
		timers.forEach(clearTimeout);
		timers = [];
	};
	return {
		reset() {
			stop();
			timers = [
				setTimeout(() => opts.onNudge(1), opts.firstMs),
				setTimeout(() => opts.onNudge(2), opts.secondMs)
			];
		},
		stop
	};
}
