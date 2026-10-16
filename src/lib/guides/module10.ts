import type { GuideDefinition } from './types';

/**
 * «Αναγνώριση Phishing & Απατών»: in the mail app, the learner reads a message,
 * learns the warning signs and reports a phishing email. Attachments,
 * passwords and the other kinds of scam are told, not tried.
 */
export const module10Guide: GuideDefinition = {
	id: 'module10',
	moduleId: 'module10',
	sim: 'desktop',
	// The default inbox has two phishing emails and two safe ones.
	simConfig: { initialApps: ['email'] },
	steps: [
		{ id: 'inbox', target: 'email-list', lessonIds: [], task: { type: 'read-email' } },
		{ id: 'signs', target: 'email-list', lessonIds: ['module10-lesson7'] },
		{
			id: 'report',
			target: 'email-report',
			lessonIds: [
				'module10-lesson1',
				'module10-lesson2',
				'module10-lesson4',
				'module10-lesson5',
				'module10-lesson6'
			],
			task: { type: 'report-phishing', where: { correct: true } }
		},
		{ id: 'attachments', target: 'email-list', lessonIds: ['module10-lesson3'] },
		{ id: 'passwords', target: 'email-list', lessonIds: ['module10-lesson8'] },
		{
			id: 'other-scams',
			target: 'email-list',
			lessonIds: ['module10-lesson9', 'module10-lesson10', 'module10-lesson11', 'module10-lesson12']
		}
	]
};
