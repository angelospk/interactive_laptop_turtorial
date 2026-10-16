import { describe, it, expect } from 'vitest';
import {
	createGuide,
	begin,
	clipEnded,
	proceed,
	answer,
	nextStep,
	summary,
	act,
	help
} from './machine';
import { clipIdsFor } from './types';
import type { GuideDefinition } from './types';

const guide: GuideDefinition = {
	id: 'g',
	moduleId: 'm',
	sim: 'browser',
	simConfig: {},
	steps: [
		{ id: 'a', target: 'a', lessonIds: ['l1'] },
		{ id: 'b', target: 'b', lessonIds: [] },
		{ id: 'c', target: 'c', lessonIds: ['l2', 'l3'] }
	]
};

const throughIntro = () => proceed(begin(createGuide(guide)));

describe('guide machine', () => {
	it('starts silent on the start screen', () => {
		const s = createGuide(guide);
		expect(s.phase).toBe('start');
		expect(s.clip).toBeNull();
	});

	it('plays the guide intro, then the shared intro clips, then waits for «Πάμε»', () => {
		let s = begin(createGuide(guide));
		expect(s.phase).toBe('intro');
		expect(s.clip).toBe('g.intro');
		s = clipEnded(s);
		expect(s.clip).toBe('common.intro.how');
		s = clipEnded(s);
		expect(s.clip).toBe('common.intro.controls');
		s = clipEnded(s);
		expect(s.phase).toBe('intro');
		expect(s.clip).toBeNull();
	});

	it('«Πάμε» can skip the rest of the intro and opens the first step', () => {
		const s = throughIntro();
		expect(s.phase).toBe('step');
		expect(s.stepIndex).toBe(0);
		expect(s.clip).toBe('g.step.a');
	});

	it('an answer records it and plays feedback, rotating the variants', () => {
		let s = answer(throughIntro(), 'known');
		expect(s.phase).toBe('feedback');
		expect(s.answers).toEqual({ a: 'known' });
		expect(s.clip).toBe('common.known.1');
		s = answer(nextStep(s), 'known');
		expect(s.clip).toBe('common.known.2');
		s = answer(nextStep(s), 'unknown');
		expect(s.clip).toBe('common.unknown.3');
	});

	it('the end of feedback moves to the next step on its own', () => {
		const s = clipEnded(answer(throughIntro(), 'unknown'));
		expect(s.phase).toBe('step');
		expect(s.stepIndex).toBe(1);
		expect(s.clip).toBe('g.step.b');
	});

	it('ignores an answer outside a step', () => {
		const s = begin(createGuide(guide));
		expect(answer(s, 'known')).toBe(s);
		const fb = answer(throughIntro(), 'known');
		expect(answer(fb, 'unknown')).toBe(fb);
	});

	const finish = (kinds: ('known' | 'unknown')[]) => {
		let s = throughIntro();
		for (const k of kinds) s = nextStep(answer(s, k));
		return s;
	};

	it('ends with the outro that matches how much was known', () => {
		expect(finish(['known', 'known', 'known']).clip).toBe('common.outro.all');
		expect(finish(['known', 'unknown', 'known']).clip).toBe('common.outro.some');
		expect(finish(['unknown', 'unknown', 'unknown']).clip).toBe('common.outro.none');
		expect(finish(['known', 'known', 'known']).phase).toBe('done');
	});

	it('summary counts every step, informational ones included', () => {
		expect(summary(finish(['known', 'unknown', 'known']))).toEqual({ known: 2, total: 3 });
	});

	it('clipEnded at the end does nothing', () => {
		const s = finish(['known', 'known', 'known']);
		expect(clipEnded(s)).toBe(s);
	});

	// «Δοκιμάστε το»: a step can wait for the learner to do the thing in the demo.
	const practical: GuideDefinition = {
		...guide,
		steps: [
			{ id: 'a', target: 'a', lessonIds: ['l1'], task: { type: 'typed', where: { text: 'ok' } } },
			{ id: 'b', target: 'b', lessonIds: [] }
		]
	};
	const atTask = () => proceed(begin(createGuide(practical)));

	it('a guide with practical steps explains them in the intro', () => {
		let s = begin(createGuide(practical));
		const heard = [s.clip];
		while (s.clip) {
			s = clipEnded(s);
			heard.push(s.clip);
		}
		expect(heard).toEqual([
			'g.intro',
			'common.intro.how',
			'common.intro.try',
			'common.intro.controls',
			null
		]);
		// A guide without them keeps the short intro.
		expect(clipIdsFor(guide)).not.toContain('common.intro.try');
		expect(clipIdsFor(practical)).toContain('common.intro.try');
	});

	it('doing the task counts as known and plays a «well done» clip', () => {
		const s = act(atTask(), { type: 'typed', text: 'ok' });
		expect(s.phase).toBe('feedback');
		expect(s.answers).toEqual({ a: 'known' });
		expect(s.clip).toBe('common.done.1');
		expect(clipIdsFor(practical)).toContain('common.done.1');
	});

	it('an event that does not match the task changes nothing', () => {
		const s = atTask();
		expect(act(s, { type: 'typed', text: 'no' })).toBe(s);
		expect(act(s, { type: 'other' })).toBe(s);
		const b = clipEnded(act(s, { type: 'typed', text: 'ok' }));
		expect(b.stepIndex).toBe(1);
		expect(act(b, { type: 'typed', text: 'ok' })).toBe(b);
	});

	it('«Βοήθεια» plays the step hint and keeps waiting', () => {
		const s = help(atTask());
		expect(s.phase).toBe('step');
		expect(s.clip).toBe('g.hint.a');
		expect(clipEnded(s)).toBe(s);
		expect(act(s, { type: 'typed', text: 'ok' }).phase).toBe('feedback');
	});
});
