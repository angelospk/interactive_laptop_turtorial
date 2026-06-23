import type { PageServerLoad } from './$types';
import { module10Lessons } from '$lib/db/seeds/module10-lessons';

export interface ScamCard {
	id: string;
	channel: 'email' | 'sms';
	from: string;
	fromAddress?: string;
	subject?: string;
	body: string;
	link?: string;
	isScam: boolean;
	redFlags: string[];
	explanation: string;
	takeaway?: string;
}

export interface ScamExercise {
	id: string;
	lessonType: string;
	config: { instructions?: string; cards: ScamCard[] };
}

/**
 * Public "Απάτη ή Όχι;" practice page.
 *
 * Serves the `scam-spotter` exercises straight from the seed data — no account,
 * no login, no progress tracking. The whole point is that anyone can land here
 * (e.g. via a QR code on a printed cheat-sheet) and practice spotting scams.
 *
 * The route is whitelisted in hooks.server.ts so it bypasses the auth redirect.
 */
export const load: PageServerLoad = async () => {
	const exercises: ScamExercise[] = module10Lessons
		.filter((lesson) => lesson.lessonType === 'scam-spotter' && lesson.enabled !== false)
		.map((lesson) => ({
			id: lesson.id as string,
			lessonType: lesson.lessonType as string,
			config: lesson.config as ScamExercise['config']
		}));

	return { exercises };
};
