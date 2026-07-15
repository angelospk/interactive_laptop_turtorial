import type { NewLesson } from '../schema';
// Relative import (όχι $lib): τα seeds τρέχουν και από bun scripts (upsert)
// εκτός Vite, όπου το alias δεν είναι εγγυημένο.
import { parseMobileSimConfig, type MobileSimApp } from '../../lessons/mobileSim';

/**
 * Shared builder for the Android/iPhone tracks (CURRICULUM_PLAN B4).
 *
 * Both tracks teach the same everyday skills (research: κλήσεις → επαφές →
 * μηνύματα → Viber → ρυθμίσεις → Wi-Fi), so the lessons are generated from one
 * definition with variant-specific chrome/apps. IDs and i18n keys follow the
 * existing per-module conventions and are IMMUTABLE once shipped.
 */

export type MobileVariant = 'android' | 'ios';

const MODULE_ID: Record<MobileVariant, string> = { android: 'android', ios: 'iphone' };

/** Full home screen per variant — every app has a kind so the phone feels alive. */
function homeApps(variant: MobileVariant): MobileSimApp[] {
	return [
		{ id: 'phone', label: 'Τηλέφωνο', icon: '📞', kind: 'phone', color: 'bg-green-100' },
		{ id: 'messages', label: 'Μηνύματα', icon: '💬', kind: 'messages', color: 'bg-blue-100' },
		variant === 'ios'
			? { id: 'facetime', label: 'FaceTime', icon: '📹', kind: 'placeholder', color: 'bg-emerald-100' }
			: { id: 'viber', label: 'Viber', icon: '💜', kind: 'viber', color: 'bg-purple-100' },
		...(variant === 'ios'
			? [{ id: 'viber', label: 'Viber', icon: '💜', kind: 'viber', color: 'bg-purple-100' } as MobileSimApp]
			: []),
		{ id: 'camera', label: 'Κάμερα', icon: '📷', kind: 'placeholder', color: 'bg-slate-100' },
		{ id: 'photos', label: 'Φωτογραφίες', icon: '🖼️', kind: 'placeholder', color: 'bg-amber-100' },
		{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️', kind: 'settings', color: 'bg-slate-200' }
	];
}

const DOCK = ['phone', 'messages', 'camera'];

const CONTACTS = [
	{ id: 'eleni', name: 'Ελένη (κόρη)', number: '697 111 2233' },
	{ id: 'giorgos', name: 'Γιώργος (γιος)', number: '694 555 6677' },
	{ id: 'katerina', name: 'Κατερίνα (γειτόνισσα)', number: '210 765 4321' }
];

const CONVERSATIONS = [
	{
		id: 'eleni',
		name: 'Ελένη (κόρη)',
		messages: [{ from: 'them' as const, text: 'Καλημέρα! Τι κάνεις;' }]
	},
	{
		id: 'giorgos',
		name: 'Γιώργος (γιος)',
		messages: [{ from: 'them' as const, text: 'Θα περάσω το απόγευμα.' }]
	}
];

const WIFI_NETWORKS = ['SPITI-WIFI', 'COSMOTE-4G-1234', 'CAFE-KENTRO'];

/**
 * Goal-driven lessons 2..7 for one variant. Lesson 1 (mobile-tap) stays
 * hand-written in each track file — it predates the builder and its shape
 * must not change (data policy: shipped lessons are immutable).
 */
export function buildMobileTrackLessons(variant: MobileVariant): NewLesson[] {
	const mod = MODULE_ID[variant];
	const apps = homeApps(variant);

	const defs = [
		{
			n: 2,
			lessonKey: 'call-number',
			config: {
				goal: 'mobile-dial-number',
				prompt: 'Άνοιξε το Τηλέφωνο και κάλεσε το 210 1234567.',
				targetAppId: 'phone',
				targetNumber: '2101234567',
				successMessage: 'Μπράβο! Έκανες την πρώτη σου κλήση.',
				hint: 'Πάτησε πρώτα το πράσινο εικονίδιο «Τηλέφωνο» και μετά τα ψηφία ένα-ένα.'
			}
		},
		{
			n: 3,
			lessonKey: 'call-contact',
			config: {
				goal: 'mobile-call-contact',
				prompt: 'Βρες την «Ελένη (κόρη)» στις Επαφές και κάλεσέ την.',
				targetAppId: 'phone',
				targetContactId: 'eleni',
				contacts: CONTACTS,
				successMessage: 'Μπράβο! Κάλεσες την Ελένη από τις Επαφές.',
				hint: 'Άνοιξε το «Τηλέφωνο» και πάτησε την καρτέλα «Επαφές».'
			}
		},
		{
			n: 4,
			lessonKey: 'send-sms',
			config: {
				goal: 'mobile-send-sms',
				prompt: 'Στείλε μήνυμα (SMS) στην «Ελένη (κόρη)».',
				targetAppId: 'messages',
				targetConversationId: 'eleni',
				conversations: CONVERSATIONS,
				successMessage: 'Μπράβο! Το μήνυμα στάλθηκε.',
				hint: 'Άνοιξε τα «Μηνύματα», διάλεξε την Ελένη, γράψε και πάτησε το κουμπί αποστολής.'
			}
		},
		{
			n: 5,
			lessonKey: 'send-viber',
			config: {
				goal: 'mobile-send-chat',
				prompt: 'Στείλε μήνυμα στην «Ελένη (κόρη)» μέσα από το Viber.',
				targetAppId: 'viber',
				targetConversationId: 'eleni',
				conversations: CONVERSATIONS,
				successMessage: 'Μπράβο! Έστειλες μήνυμα στο Viber.',
				hint: 'Το Viber έχει μωβ χρώμα. Λειτουργεί όπως τα Μηνύματα.'
			}
		},
		{
			n: 6,
			lessonKey: 'font-size',
			config: {
				goal: 'mobile-change-font-size',
				prompt: 'Κάνε τα γράμματα του κινητού Μεγάλα από τις Ρυθμίσεις.',
				targetAppId: 'settings',
				targetSize: 'large',
				successMessage: 'Μπράβο! Τώρα τα γράμματα φαίνονται καλύτερα.',
				hint: 'Ρυθμίσεις → Μέγεθος γραμμάτων → Μεγάλα.'
			}
		},
		{
			n: 7,
			lessonKey: 'connect-wifi',
			config: {
				goal: 'mobile-connect-wifi',
				prompt: 'Σύνδεσε το κινητό στο δίκτυο «SPITI-WIFI».',
				targetAppId: 'settings',
				targetSsid: 'SPITI-WIFI',
				wifiNetworks: WIFI_NETWORKS,
				successMessage: 'Μπράβο! Συνδέθηκες στο Wi-Fi του σπιτιού.',
				hint: 'Ρυθμίσεις → Wi-Fi → πάτησε το όνομα του δικτύου σου.'
			}
		}
	];

	return defs.map(({ n, lessonKey, config }, i) => {
		const full = parseMobileSimConfig({
			...config,
			variant,
			apps,
			dockAppIds: DOCK
		});
		return {
			id: `${mod}-${lessonKey}`,
			moduleId: mod,
			lessonKey,
			titleKey: `${mod}_lesson${n}_title`,
			descriptionKey: `${mod}_lesson${n}_desc`,
			difficulty: 'beginner' as const,
			orderIndex: n,
			lessonType: 'mobile-sim',
			config: full,
			enabled: true,
			// Chain: lesson 2 requires the track's lesson 1 (mobile-tap), then 3→2 κ.ο.κ.
			requiredLessonId:
				i === 0
					? mod === 'android'
						? 'android-open-viber'
						: 'iphone-open-facetime'
					: `${mod}-${defs[i - 1].lessonKey}`
		};
	});
}
