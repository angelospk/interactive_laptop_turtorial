import type { GuideDefinition } from './types';

/**
 * «Email»: the learner opens the mail app from the taskbar, reads a message,
 * replies, forwards, deletes, and sends a new one. Attachments are told, not tried.
 */
export const module6Guide: GuideDefinition = {
	id: 'module6',
	moduleId: 'module6',
	sim: 'desktop',
	simConfig: { initialApps: [] },
	// Closed the mail by mistake? The demo comes back with it open.
	resumeConfig: { initialApps: ['email'] },
	steps: [
		{
			id: 'open',
			target: 'taskbar-email',
			lessonIds: ['module6-lesson1'],
			task: { type: 'open-app', where: { appId: 'email' } }
		},
		{
			id: 'read',
			target: 'email-list',
			lessonIds: ['module6-lesson2'],
			task: { type: 'read-email' }
		},
		{
			id: 'reply',
			target: 'email-reply',
			lessonIds: ['module6-lesson3'],
			task: { type: 'reply-email' }
		},
		{
			id: 'forward',
			target: 'email-forward',
			lessonIds: ['module6-lesson4'],
			task: { type: 'forward-email' }
		},
		{
			id: 'delete',
			target: 'email-delete',
			lessonIds: ['module6-lesson5'],
			task: { type: 'delete-email' }
		},
		{ id: 'attach', target: 'email-compose', lessonIds: ['module6-lesson6'] },
		{
			id: 'send',
			target: 'email-compose',
			lessonIds: ['module6-lesson7'],
			task: { type: 'send-email' }
		}
	]
};
