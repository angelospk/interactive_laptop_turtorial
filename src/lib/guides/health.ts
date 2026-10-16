import type { GuideDefinition } from './types';
import { healthGuideConfig } from '$lib/db/seeds/health-lessons';

/**
 * «Υγεία online»: the learner reads the e-prescription code from the official
 * SMS, logs in to MyHealth to see the prescriptions and books an appointment.
 * What an e-prescription is, and what the pharmacy needs, are told, not tried.
 */
export const healthGuide: GuideDefinition = {
	id: 'health',
	moduleId: 'health',
	sim: 'health',
	simConfig: healthGuideConfig(),
	steps: [
		{ id: 'eprescription', target: 'health-sms', lessonIds: ['health-lesson1', 'health-lesson2'] },
		{
			id: 'code',
			target: 'health-sms',
			lessonIds: ['health-lesson3'],
			task: { type: 'health-code-revealed' }
		},
		{
			id: 'prescriptions',
			target: 'health-portal',
			lessonIds: ['health-lesson4'],
			task: { type: 'health-prescriptions-viewed' }
		},
		{
			id: 'appointment',
			target: 'health-appointments',
			lessonIds: ['health-lesson5'],
			task: { type: 'health-appointment-booked' }
		},
		{ id: 'pharmacy', target: 'health-appointments', lessonIds: ['health-lesson6'] }
	]
};
