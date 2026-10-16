import type { GuideDefinition } from './types';

/**
 * «Τράπεζα online»: in the browser, the learner opens the bank's site, logs
 * in with a strong password and sends money. The padlock and the fake bank
 * SMS are told, not tried.
 */
export const bankGuide: GuideDefinition = {
	id: 'bank',
	moduleId: 'bank',
	sim: 'browser',
	simConfig: { initialTabs: ['home'] },
	// A reset after the bank opened: the demo comes back on the bank's page.
	resumeConfig: { initialTabs: ['mybank.gr'] },
	steps: [
		{ id: 'padlock', target: 'address-bar', lessonIds: ['bank-padlock-quiz'] },
		{
			id: 'open',
			target: 'address-bar',
			lessonIds: ['bank-open-secure'],
			task: { type: 'navigate', where: { page: 'banking' } }
		},
		{
			id: 'login',
			target: 'bank-login',
			lessonIds: ['bank-secure-login'],
			task: { type: 'bank-login', where: { success: true } }
		},
		{
			id: 'transfer',
			target: 'bank-transfer',
			lessonIds: ['bank-transfer'],
			task: { type: 'bank-transfer' }
		},
		{ id: 'fake-sms', target: 'page', lessonIds: ['bank-fake-sms-quiz'] }
	]
};
