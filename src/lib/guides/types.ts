/** Which simulation a guide opens. One today; the union grows with each module's guide. */
export type GuideSim = 'browser';

export interface GuideStep {
	/** Stable id; also names the step's clips: `<guide>.step.<id>`, `<guide>.hint.<id>`. */
	id: string;
	/** `data-guide` value of the element to spotlight. */
	target: string;
	/** Exercises this step stands for: «Το ξέρω» marks them done. Empty = informational step. */
	lessonIds: string[];
}

export interface GuideDefinition {
	/** Matches the guide lesson's `config.guideId`, and prefixes the guide's own clips. */
	id: string;
	moduleId: string;
	sim: GuideSim;
	simConfig: Record<string, unknown>;
	steps: GuideStep[];
}

/** Clips every guide shares (`docs/guides/common.script.md`). */
export const COMMON_CLIPS = {
	intro: ['common.intro.how', 'common.intro.controls'],
	known: ['common.known.1', 'common.known.2', 'common.known.3'],
	unknown: ['common.unknown.1', 'common.unknown.2', 'common.unknown.3'],
	idle: ['common.idle.1', 'common.idle.2'],
	outro: { all: 'common.outro.all', some: 'common.outro.some', none: 'common.outro.none' }
} as const;

export const introClip = (guide: GuideDefinition) => `${guide.id}.intro`;
export const stepClip = (guide: GuideDefinition, step: GuideStep) => `${guide.id}.step.${step.id}`;
export const hintClip = (guide: GuideDefinition, step: GuideStep) => `${guide.id}.hint.${step.id}`;

/** Every clip a guide can play, in the order it would play them. */
export function clipIdsFor(guide: GuideDefinition): string[] {
	return [
		introClip(guide),
		...COMMON_CLIPS.intro,
		...guide.steps.flatMap((s) => [stepClip(guide, s), hintClip(guide, s)]),
		...COMMON_CLIPS.known,
		...COMMON_CLIPS.unknown,
		...COMMON_CLIPS.idle,
		...Object.values(COMMON_CLIPS.outro)
	];
}
