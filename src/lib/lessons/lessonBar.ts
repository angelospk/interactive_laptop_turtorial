/**
 * The bar over a lesson: title, instruction and the way to other lessons, laid
 * over the top edge of a lesson that otherwise takes the whole screen.
 *
 * Why it opened decides what closes it. A bar the learner peeked at (mouse to
 * the top, scroll up) goes away when they move off it; one they asked for, or
 * one that asked them "Κόλλησες;", stays until they act.
 */

export type BarReason = 'arrival' | 'peek' | 'pinned' | 'stuck';
export type BarState = { open: false } | { open: true; reason: BarReason };
export type BarEvent =
	/** A lesson came on screen. */
	| 'arrive'
	/** The learner pressed or typed inside the lesson. */
	| 'stage-interact'
	/** Mouse at the top edge, scroll up, swipe down from the top. */
	| 'peek'
	/** The pointer left the bar it had peeked at. */
	| 'leave'
	/** The Menu / hide button. */
	| 'toggle'
	| 'dismiss'
	| 'stuck';

const CLOSED: BarState = { open: false };

export function barReducer(state: BarState, event: BarEvent): BarState {
	switch (event) {
		case 'arrive':
			return { open: true, reason: 'arrival' };
		case 'stage-interact':
		case 'dismiss':
			return state.open ? CLOSED : state;
		case 'peek':
			return state.open ? state : { open: true, reason: 'peek' };
		case 'leave':
			return state.open && state.reason === 'peek' ? CLOSED : state;
		case 'toggle':
			return state.open ? CLOSED : { open: true, reason: 'pinned' };
		case 'stuck':
			return { open: true, reason: 'stuck' };
	}
}

type LessonLike = {
	lessonType: string;
	difficulty?: string | null;
	config?: unknown;
};

// Taking a long time is the exercise here, not a sign of being lost.
const NEVER_ASK = new Set(['guide', 'reading', 'quiz', 'typing', 'scam-spotter']);
const SECONDS_BY_DIFFICULTY: Record<string, number> = {
	beginner: 40,
	intermediate: 60,
	advanced: 90
};

/**
 * How long a lesson may go unfinished before the bar asks "Κόλλησες;", or null
 * for never. A lesson's `config.stuckAfterSeconds` wins; 0 turns it off.
 */
export function stuckDelayMs(lesson: LessonLike): number | null {
	if (lesson.lessonType === 'guide' || lesson.lessonType === 'reading') return null;
	const own = (lesson.config as { stuckAfterSeconds?: unknown } | null | undefined)
		?.stuckAfterSeconds;
	if (typeof own === 'number' && Number.isFinite(own) && own >= 0) {
		return own === 0 ? null : own * 1000;
	}
	if (NEVER_ASK.has(lesson.lessonType)) return null;
	return (SECONDS_BY_DIFFICULTY[lesson.difficulty ?? ''] ?? SECONDS_BY_DIFFICULTY.beginner) * 1000;
}

/**
 * Whether a scroll up at `target` would move something inside the lesson. Only
 * when nothing would does scrolling up mean "show me the bar".
 */
export function canScrollUp(target: EventTarget | null, boundary: Element): boolean {
	for (let el = target as Element | null; el && el !== boundary; el = el.parentElement) {
		if (el.scrollTop > 0) {
			const { overflowY } = getComputedStyle(el);
			if (overflowY === 'auto' || overflowY === 'scroll') return true;
		}
	}
	return false;
}
