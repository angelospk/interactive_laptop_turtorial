import type { NewLesson } from '../schema';

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

// Home screen for goal-driven mobile-sim lessons (MobileHomeScreen v2):
// same apps, plus kind/color metadata and the dock row.
const simApps = [
	{ id: 'phone', label: 'Τηλέφωνο', icon: '📞', kind: 'phone', color: 'bg-green-100' },
	{ id: 'messages', label: 'Μηνύματα', icon: '💬', color: 'bg-blue-100' },
	{ id: 'viber', label: 'Viber', icon: '💜', color: 'bg-purple-100' },
	{ id: 'camera', label: 'Κάμερα', icon: '📷', color: 'bg-slate-100' },
	{ id: 'photos', label: 'Φωτογραφίες', icon: '🖼️', color: 'bg-amber-100' },
	{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️', color: 'bg-slate-200' }
];
const simDock = ['phone', 'messages', 'camera'];

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

	// Lesson 2 — first goal-driven mobile-sim lesson (CURRICULUM_PLAN B2):
	// open the Phone app and dial a number on the keypad.
	{
		id: 'android-call-number',
		moduleId: 'android',
		lessonKey: 'call-number',
		titleKey: 'android_lesson2_title',
		descriptionKey: 'android_lesson2_desc',
		difficulty: 'beginner',
		orderIndex: 2,
		lessonType: 'mobile-sim',
		config: {
			goal: 'mobile-dial-number',
			variant: 'android',
			prompt: 'Άνοιξε το Τηλέφωνο και κάλεσε το 210 1234567.',
			apps: simApps,
			dockAppIds: simDock,
			targetAppId: 'phone',
			targetNumber: '2101234567',
			successMessage: 'Μπράβο! Έκανες την πρώτη σου κλήση.',
			hint: 'Πάτησε πρώτα το πράσινο εικονίδιο «Τηλέφωνο» και μετά τα ψηφία ένα-ένα.'
		},
		enabled: true,
		requiredLessonId: 'android-open-viber'
	}
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
