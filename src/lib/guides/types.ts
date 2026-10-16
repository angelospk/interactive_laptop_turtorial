/** Which simulation a guide opens; `GuideLesson` maps each to a component. */
export type GuideSim =
	| 'browser'
	| 'desktop'
	| 'mouse-pad'
	| 'keyboard-pad'
	| 'phone'
	| 'mac'
	| 'gov';

/** What a simulation reports when the learner does something in it. */
export interface GuideEvent {
	type: string;
	[key: string]: unknown;
}

/**
 * «Δοκιμάστε το»: the step waits for this event from the demo. `where` must
 * match the event's own fields exactly.
 */
export interface GuideTask {
	type: string;
	where?: Record<string, string | number | boolean>;
}

export function taskMatches(task: GuideTask, event: GuideEvent): boolean {
	if (event.type !== task.type) return false;
	return Object.entries(task.where ?? {}).every(([key, value]) => event[key] === value);
}

export interface GuideStep {
	/** Stable id; also names the step's clips: `<guide>.step.<id>`, `<guide>.hint.<id>`. */
	id: string;
	/** `data-guide` value of the element to spotlight. */
	target: string;
	/** Exercises this step stands for: «Το ξέρω» marks them done. Empty = informational step. */
	lessonIds: string[];
	/** Practical step: doing this in the demo counts as «Το ξέρω». */
	task?: GuideTask;
}

export interface GuideDefinition {
	/** Matches the guide lesson's `config.guideId`, and prefixes the guide's own clips. */
	id: string;
	moduleId: string;
	sim: GuideSim;
	simConfig: Record<string, unknown>;
	/** The demo after a reset, for a guide whose steps need an app that starts closed. */
	resumeConfig?: Record<string, unknown>;
	steps: GuideStep[];
}

/** Clips every guide shares (`docs/guides/common.script.md`). */
export const COMMON_CLIPS = {
	intro: ['common.intro.how', 'common.intro.controls'],
	/** Said between the two intro clips when the guide has practical steps. */
	introTry: 'common.intro.try',
	done: ['common.done.1', 'common.done.2', 'common.done.3'],
	known: ['common.known.1', 'common.known.2', 'common.known.3'],
	unknown: ['common.unknown.1', 'common.unknown.2', 'common.unknown.3'],
	idle: ['common.idle.1', 'common.idle.2'],
	outro: { all: 'common.outro.all', some: 'common.outro.some', none: 'common.outro.none' }
} as const;

export const introClip = (guide: GuideDefinition) => `${guide.id}.intro`;
export const stepClip = (guide: GuideDefinition, step: GuideStep) => `${guide.id}.step.${step.id}`;
export const hintClip = (guide: GuideDefinition, step: GuideStep) => `${guide.id}.hint.${step.id}`;

export const hasTasks = (guide: GuideDefinition) => guide.steps.some((s) => s.task);

/** The guide's own intro, then the shared ones. */
export function introClips(guide: GuideDefinition): string[] {
	const [how, controls] = COMMON_CLIPS.intro;
	return [introClip(guide), how, ...(hasTasks(guide) ? [COMMON_CLIPS.introTry] : []), controls];
}

/** Every clip a guide can play, in the order it would play them. */
export function clipIdsFor(guide: GuideDefinition): string[] {
	return [
		...introClips(guide),
		...guide.steps.flatMap((s) => [stepClip(guide, s), hintClip(guide, s)]),
		...(hasTasks(guide) ? COMMON_CLIPS.done : []),
		...COMMON_CLIPS.known,
		...COMMON_CLIPS.unknown,
		...COMMON_CLIPS.idle,
		...Object.values(COMMON_CLIPS.outro)
	];
}
