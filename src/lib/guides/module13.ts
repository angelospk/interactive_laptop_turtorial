import type { GuideDefinition } from './types';

/**
 * «Βοηθοί Τεχνητής Νοημοσύνης»: in an AI chat page, the learner asks a
 * question. Voice input, AI versus Google and the limits of AI are told, not
 * tried.
 */
export const module13Guide: GuideDefinition = {
	id: 'module13',
	moduleId: 'module13',
	sim: 'browser',
	simConfig: { initialTabs: ['chatgpt.com'] },
	steps: [
		{ id: 'what', target: 'page', lessonIds: ['module13-lesson1'] },
		{
			id: 'ask',
			target: 'ai-question',
			lessonIds: ['module13-lesson2'],
			task: { type: 'type-ai-question' }
		},
		{ id: 'voice', target: 'ai-question', lessonIds: ['module13-lesson3'] },
		{ id: 'ai-or-google', target: 'page', lessonIds: ['module13-lesson4'] },
		{ id: 'limits', target: 'page', lessonIds: ['module13-lesson5'] }
	]
};
