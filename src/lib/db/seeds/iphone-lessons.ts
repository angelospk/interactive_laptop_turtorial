import type { NewLesson } from '../schema';

/**
 * iPhone track (ROADMAP Φάση 2) — vertical slice, mirrors the Android one but
 * with the iOS chrome (MobileFrame variant 'ios'). Same 'mobile-tap' lessonType.
 */

interface MobileApp {
	id: string;
	label: string;
	icon: string;
}

const homeApps: MobileApp[] = [
	{ id: 'phone', label: 'Τηλέφωνο', icon: '📞' },
	{ id: 'messages', label: 'Μηνύματα', icon: '💬' },
	{ id: 'facetime', label: 'FaceTime', icon: '📹' },
	{ id: 'camera', label: 'Κάμερα', icon: '📷' },
	{ id: 'photos', label: 'Φωτογραφίες', icon: '🌼' },
	{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️' }
];

export const iphoneLessons: NewLesson[] = [
	{
		id: 'iphone-open-facetime',
		moduleId: 'iphone',
		lessonKey: 'open-facetime',
		titleKey: 'iphone_lesson1_title',
		descriptionKey: 'iphone_lesson1_desc',
		difficulty: 'beginner',
		orderIndex: 1,
		lessonType: 'mobile-tap',
		config: {
			prompt: 'Πάτησε το εικονίδιο του FaceTime για βιντεοκλήση.',
			apps: homeApps,
			targetAppId: 'facetime',
			successMessage: 'Μπράβο! Άνοιξες το FaceTime.',
			hint: 'Το FaceTime έχει μια πράσινη κάμερα.',
			variant: 'ios'
		},
		enabled: true,
		requiredLessonId: null
	},

	// Lesson 2 — first goal-driven mobile-sim lesson, iOS variant (B2).
	{
		id: 'iphone-call-number',
		moduleId: 'iphone',
		lessonKey: 'call-number',
		titleKey: 'iphone_lesson2_title',
		descriptionKey: 'iphone_lesson2_desc',
		difficulty: 'beginner',
		orderIndex: 2,
		lessonType: 'mobile-sim',
		config: {
			goal: 'mobile-dial-number',
			variant: 'ios',
			prompt: 'Άνοιξε το Τηλέφωνο και κάλεσε το 210 1234567.',
			apps: [
				{ id: 'phone', label: 'Τηλέφωνο', icon: '📞', kind: 'phone', color: 'bg-green-100' },
				{ id: 'messages', label: 'Μηνύματα', icon: '💬', color: 'bg-blue-100' },
				{ id: 'facetime', label: 'FaceTime', icon: '📹', color: 'bg-emerald-100' },
				{ id: 'camera', label: 'Κάμερα', icon: '📷', color: 'bg-slate-100' },
				{ id: 'photos', label: 'Φωτογραφίες', icon: '🌼', color: 'bg-amber-100' },
				{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️', color: 'bg-slate-200' }
			],
			dockAppIds: ['phone', 'messages', 'camera'],
			targetAppId: 'phone',
			targetNumber: '2101234567',
			successMessage: 'Μπράβο! Έκανες την πρώτη σου κλήση.',
			hint: 'Πάτησε πρώτα το πράσινο εικονίδιο «Τηλέφωνο» και μετά τα ψηφία ένα-ένα.'
		},
		enabled: true,
		requiredLessonId: 'iphone-open-facetime'
	}
];

// Fail fast at import time if a target app is missing from its own list.
for (const lesson of iphoneLessons) {
	const config = lesson.config as { apps?: MobileApp[]; targetAppId?: string };
	const ok = config.apps?.some((a) => a.id === config.targetAppId);
	if (!ok) {
		throw new Error(
			`Seed error in "${lesson.id}": targetAppId "${config.targetAppId}" is not in apps.`
		);
	}
}
