import type { GuideDefinition } from './types';

/**
 * «Βιντεοκλήση»: the learner opens Viber from the Start menu, starts a video
 * call, mutes the microphone and hangs up. Tips and joining a meeting are
 * told, not tried.
 */
export const module11Guide: GuideDefinition = {
	id: 'module11',
	moduleId: 'module11',
	sim: 'desktop',
	simConfig: { initialApps: [] },
	// Closed Viber by mistake? The demo comes back with it open.
	resumeConfig: { initialApps: ['viber'] },
	steps: [
		{ id: 'what', target: 'start-button', lessonIds: ['module11-lesson1'] },
		{
			id: 'open',
			target: 'start-button',
			lessonIds: ['module11-lesson2'],
			task: { type: 'open-app', where: { appId: 'viber' } }
		},
		{
			id: 'call',
			target: 'videocall-start',
			lessonIds: ['module11-lesson3'],
			task: { type: 'start-videocall' }
		},
		{
			id: 'mute',
			target: 'videocall-mute',
			lessonIds: ['module11-lesson4'],
			task: { type: 'mute-call' }
		},
		{
			id: 'end',
			target: 'videocall-end',
			lessonIds: ['module11-lesson5'],
			task: { type: 'end-call' }
		},
		{ id: 'tips', target: 'videocall-start', lessonIds: ['module11-lesson6'] },
		{ id: 'meeting', target: 'videocall-start', lessonIds: ['module11-lesson7'] }
	]
};
