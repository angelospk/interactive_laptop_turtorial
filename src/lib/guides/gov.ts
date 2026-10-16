import type { GuideDefinition } from './types';
import { govGuideConfig } from '$lib/db/seeds/gov-lessons';

/**
 * «Δημόσιες υπηρεσίες online»: the learner logs in to gov.gr with the TaxisNet
 * codes, finds a certificate, downloads it and authorises a trusted person.
 * The everyday services (unemployment card, citizen mailbox) are told, not tried.
 */
export const govGuide: GuideDefinition = {
	id: 'gov',
	moduleId: 'gov',
	sim: 'gov',
	simConfig: govGuideConfig(),
	steps: [
		{ id: 'intro', target: 'gov-header', lessonIds: [] },
		{
			id: 'login',
			target: 'gov-login-button',
			lessonIds: ['gov-login'],
			task: { type: 'gov-login', where: { success: true } }
		},
		{
			id: 'find',
			target: 'gov-service-family-cert',
			lessonIds: ['gov-find-family-cert', 'gov-find-birth-cert'],
			task: { type: 'gov-service-selected', where: { serviceId: 'family-cert' } }
		},
		{
			id: 'download',
			target: 'gov-download',
			lessonIds: ['gov-download-cert'],
			task: { type: 'download-file' }
		},
		{
			id: 'authorize',
			target: 'gov-authorize',
			lessonIds: ['gov-authorize'],
			task: { type: 'gov-authorize' }
		},
		{
			id: 'everyday',
			target: 'gov-service-citizen-mailbox',
			lessonIds: [
				'gov-find-unemployment-card',
				'gov-download-unemployment-card',
				'gov-find-citizen-mailbox'
			]
		}
	]
};
