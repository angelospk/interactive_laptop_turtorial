import type { NewLesson } from '../schema';
import { buildMobileTrackLessons } from './mobile-track';

/**
 * Android track (ROADMAP Φάση 2) — vertical slice.
 *
 * First interactive mobile lesson: the learner taps the correct app on a
 * simulated Android home screen (rendered inside MobileFrame). Uses the
 * 'mobile-tap' lessonType. Config shape (validated below):
 *   { prompt, apps: [{id,label,icon}], targetAppId, successMessage?, hint? }
 */

interface MobileApp {
	id: string;
	label: string;
	icon: string;
}

const homeApps: MobileApp[] = [
	{ id: 'phone', label: 'Τηλέφωνο', icon: '📞' },
	{ id: 'messages', label: 'Μηνύματα', icon: '💬' },
	{ id: 'viber', label: 'Viber', icon: '💜' },
	{ id: 'camera', label: 'Κάμερα', icon: '📷' },
	{ id: 'photos', label: 'Φωτογραφίες', icon: '🖼️' },
	{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️' }
];

export const androidLessons: NewLesson[] = [
	{
		id: 'android-open-viber',
		moduleId: 'android',
		lessonKey: 'open-viber',
		titleKey: 'android_lesson1_title',
		descriptionKey: 'android_lesson1_desc',
		difficulty: 'beginner',
		orderIndex: 1,
		lessonType: 'mobile-tap',
		config: {
			prompt: 'Πάτησε το εικονίδιο του Viber για να το ανοίξεις.',
			apps: homeApps,
			targetAppId: 'viber',
			successMessage: 'Μπράβο! Άνοιξες το Viber.',
			hint: 'Το Viber έχει μωβ χρώμα.',
			variant: 'android'
		},
		enabled: true,
		requiredLessonId: null
	},

	// Lessons 2..7 — goal-driven mobile-sim lessons (κλήση, επαφές, SMS,
	// Viber, γράμματα, Wi-Fi) από τον κοινό builder (CURRICULUM_PLAN B4).
	...buildMobileTrackLessons('android')
];

/**
 * Fail fast at import time if a mobile-tap lesson points at a target app that is
 * not in its own list (codex review): a broken lesson should never seed.
 */
for (const lesson of androidLessons) {
	const config = lesson.config as { apps?: MobileApp[]; targetAppId?: string };
	const ok = config.apps?.some((a) => a.id === config.targetAppId);
	if (!ok) {
		throw new Error(
			`Seed error in "${lesson.id}": targetAppId "${config.targetAppId}" is not in apps.`
		);
	}
}
