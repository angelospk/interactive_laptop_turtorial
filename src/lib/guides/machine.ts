import { COMMON_CLIPS, introClip, stepClip, type GuideDefinition } from './types';

export type Answer = 'known' | 'unknown';
export type GuidePhase = 'start' | 'intro' | 'step' | 'feedback' | 'done';

/**
 * Where a guide is, as plain data: the component renders it and plays `clip`,
 * these functions move it. A transition that does not apply returns the same
 * state object, so a double click or a late audio `ended` is harmless.
 */
export interface GuideState {
	guide: GuideDefinition;
	phase: GuidePhase;
	introIndex: number;
	stepIndex: number;
	answers: Record<string, Answer>;
	/** Clip to play now; null = silence. */
	clip: string | null;
}

const introClips = (guide: GuideDefinition) => [introClip(guide), ...COMMON_CLIPS.intro];

export function createGuide(guide: GuideDefinition): GuideState {
	return { guide, phase: 'start', introIndex: 0, stepIndex: 0, answers: {}, clip: null };
}

/** «Ξεκινάμε»: the click that also unlocks audio. */
export function begin(s: GuideState): GuideState {
	if (s.phase !== 'start') return s;
	return { ...s, phase: 'intro', introIndex: 0, clip: introClips(s.guide)[0] };
}

/** «Πάμε»: from the intro (finished or not) to the first step. */
export function proceed(s: GuideState): GuideState {
	if (s.phase !== 'intro') return s;
	return toStep(s, 0);
}

export function answer(s: GuideState, kind: Answer): GuideState {
	if (s.phase !== 'step') return s;
	const step = s.guide.steps[s.stepIndex];
	const answers = { ...s.answers, [step.id]: kind };
	// Rotate the variants so the learner does not hear the same line every time.
	const variants = kind === 'known' ? COMMON_CLIPS.known : COMMON_CLIPS.unknown;
	const clip = variants[(Object.keys(answers).length - 1) % variants.length];
	return { ...s, phase: 'feedback', answers, clip };
}

/** After the feedback: the next step, or the end. */
export function nextStep(s: GuideState): GuideState {
	if (s.phase !== 'feedback') return s;
	const next = s.stepIndex + 1;
	if (next < s.guide.steps.length) return toStep(s, next);
	const { known, total } = summary(s);
	const outro = COMMON_CLIPS.outro;
	return { ...s, phase: 'done', clip: known === total ? outro.all : known === 0 ? outro.none : outro.some };
}

/** The current clip finished playing. */
export function clipEnded(s: GuideState): GuideState {
	if (s.phase === 'intro') {
		const clips = introClips(s.guide);
		const i = s.introIndex + 1;
		return i < clips.length ? { ...s, introIndex: i, clip: clips[i] } : { ...s, introIndex: i, clip: null };
	}
	if (s.phase === 'feedback') return nextStep(s);
	return s;
}

export function summary(s: GuideState): { known: number; total: number } {
	const known = Object.values(s.answers).filter((a) => a === 'known').length;
	return { known, total: s.guide.steps.length };
}

function toStep(s: GuideState, index: number): GuideState {
	return { ...s, phase: 'step', stepIndex: index, clip: stepClip(s.guide, s.guide.steps[index]) };
}
