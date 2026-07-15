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
			? {
					id: 'facetime',
					label: 'FaceTime',
					icon: '📹',
					kind: 'placeholder',
					color: 'bg-emerald-100'
				}
			: { id: 'viber', label: 'Viber', icon: '💜', kind: 'viber', color: 'bg-purple-100' },
		...(variant === 'ios'
			? [
					{
						id: 'viber',
						label: 'Viber',
						icon: '💜',
						kind: 'viber',
						color: 'bg-purple-100'
					} as MobileSimApp
				]
			: []),
		{ id: 'camera', label: 'Κάμερα', icon: '📷', kind: 'camera', color: 'bg-slate-100' },
		{ id: 'photos', label: 'Φωτογραφίες', icon: '🖼️', kind: 'placeholder', color: 'bg-amber-100' },
		variant === 'ios'
			? { id: 'store', label: 'App Store', icon: '🛍️', kind: 'store', color: 'bg-sky-100' }
			: { id: 'store', label: 'Play Store', icon: '🛍️', kind: 'store', color: 'bg-green-100' },
		{
			id: 'assistant',
			label: 'Ψηφιακός βοηθός',
			icon: '✨',
			kind: 'assistant',
			color: 'bg-indigo-100'
		},
		variant === 'ios'
			? { id: 'browser', label: 'Safari', icon: '🧭', kind: 'browser', color: 'bg-blue-100' }
			: { id: 'browser', label: 'Chrome', icon: '🌐', kind: 'browser', color: 'bg-blue-100' },
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
		},
		// «Καθημερινή χρήση» — πρώτο intermediate μάθημα (wave 3, digital tips).
		{
			n: 8,
			difficulty: 'intermediate' as const,
			lessonKey: 'videocall-viber',
			config: {
				goal: 'mobile-start-videocall',
				prompt: 'Κάνε βιντεοκλήση στην «Ελένη (κόρη)» μέσα από το Viber.',
				targetAppId: 'viber',
				targetConversationId: 'eleni',
				conversations: CONVERSATIONS,
				successMessage: 'Μπράβο! Η βιντεοκλήση ξεκίνησε — βλέπεις και ακούς την Ελένη.',
				hint: 'Άνοιξε τη συνομιλία με την Ελένη και πάτησε το εικονίδιο της κάμερας πάνω δεξιά.'
			}
		},
		{
			n: 9,
			difficulty: 'intermediate' as const,
			lessonKey: 'screenshot',
			config: {
				goal: 'mobile-screenshot',
				prompt:
					variant === 'ios'
						? 'Τράβηξε στιγμιότυπο οθόνης: πάτησε μαζί το Πλαϊνό κουμπί και το «Ένταση πάνω».'
						: 'Τράβηξε στιγμιότυπο οθόνης: πάτησε μαζί το Κουμπί λειτουργίας και το «Ένταση κάτω».',
				successMessage: 'Μπράβο! Τράβηξες στιγμιότυπο της οθόνης.',
				hint:
					variant === 'ios'
						? 'Στο iPhone: Πλαϊνό κουμπί (δεξιά) + Ένταση πάνω (αριστερά), ταυτόχρονα.'
						: 'Στο Android: Κουμπί λειτουργίας (δεξιά) + Ένταση κάτω (αριστερά), ταυτόχρονα.'
			}
		},
		{
			n: 10,
			difficulty: 'intermediate' as const,
			lessonKey: 'force-close',
			config: {
				goal: 'mobile-force-close',
				prompt: 'Η «Κάμερα» κόλλησε. Άνοιξε τις πρόσφατες εφαρμογές και κλείσ’ την.',
				targetAppId: 'camera',
				recentAppIds: ['messages', 'camera', 'settings'],
				successMessage: 'Μπράβο! Έκλεισες την εφαρμογή που κόλλησε.',
				hint: 'Πάτησε το τετράγωνο κουμπί κάτω δεξιά· βρες την «Κάμερα» και πάτησε «Κλείσιμο».'
			}
		},
		{
			n: 11,
			difficulty: 'intermediate' as const,
			lessonKey: 'scan-qr',
			config: {
				goal: 'mobile-scan-qr',
				prompt:
					'Σκάναρε τον κωδικό QR με την Κάμερα και άνοιξε τον σύνδεσμο — αφού βεβαιωθείς ότι είναι το επίσημο gov.gr.',
				targetAppId: 'camera',
				qrUrl: 'https://www.gov.gr/ipiresies/polites-kai-kathimerinotita',
				targetHost: 'gov.gr',
				successMessage: 'Μπράβο! Έλεγξες τη διεύθυνση και άνοιξες τον επίσημο σύνδεσμο.',
				hint: 'Άνοιξε την «Κάμερα», πάτησε «Σάρωση» και διάβασε τη διεύθυνση: πρέπει να λέει gov.gr.'
			}
		},
		{
			n: 12,
			difficulty: 'advanced' as const,
			lessonKey: 'night-mode',
			config: {
				goal: 'mobile-night-mode',
				prompt:
					'Άνοιξε τη «Νυχτερινή λειτουργία» από τις Ρυθμίσεις για να ξεκουράζονται τα μάτια σου το βράδυ.',
				targetAppId: 'settings',
				successMessage: 'Μπράβο! Άνοιξες τη νυχτερινή λειτουργία.',
				hint: 'Ρυθμίσεις → Νυχτερινή λειτουργία → πάτησε τον διακόπτη ώστε να γίνει πράσινος.'
			}
		},
		{
			n: 13,
			difficulty: 'advanced' as const,
			lessonKey: 'find-device',
			config: {
				goal: 'mobile-find-device',
				prompt:
					'Ενεργοποίησε την «Εύρεση συσκευής» από τις Ρυθμίσεις, για να βρίσκεις το κινητό αν χαθεί.',
				targetAppId: 'settings',
				successMessage: 'Μπράβο! Τώρα μπορείς να εντοπίσεις το κινητό αν χαθεί.',
				hint: 'Ρυθμίσεις → Εύρεση συσκευής → πάτησε τον διακόπτη ώστε να γίνει πράσινος.'
			}
		},
		{
			n: 14,
			difficulty: 'advanced' as const,
			lessonKey: 'update-app',
			config: {
				goal: 'mobile-update-app',
				prompt: `Ενημέρωσε το «Viber» από το ${variant === 'ios' ? 'App Store' : 'Play Store'} (το επίσημο κατάστημα).`,
				targetAppId: 'store',
				storeName: variant === 'ios' ? 'App Store' : 'Play Store',
				targetUpdateId: 'viber',
				storeItems: [
					{ id: 'viber', label: 'Viber', icon: '💜', hasUpdate: true },
					{ id: 'maps', label: 'Χάρτες', icon: '🗺️', hasUpdate: true },
					{ id: 'weather', label: 'Καιρός', icon: '⛅' }
				],
				successMessage: 'Μπράβο! Ενημέρωσες το Viber από το επίσημο κατάστημα.',
				hint: 'Άνοιξε το κατάστημα, βρες το «Viber» και πάτησε «Ενημέρωση».'
			}
		},
		{
			n: 15,
			difficulty: 'advanced' as const,
			lessonKey: 'assistant-alarm',
			config: {
				goal: 'mobile-assistant-task',
				prompt:
					'Άνοιξε τον «Ψηφιακό βοηθό» και ζήτα του να βάλει ξυπνητήρι — διάλεξε την πιο ξεκάθαρη διατύπωση.',
				targetAppId: 'assistant',
				intent: 'alarm',
				assistantGreeting: 'Γεια σου! Τι θέλεις να κάνω; Διάλεξε πώς θα το έλεγες:',
				assistantConfirm: 'Έβαλα ξυπνητήρι για τις 7 το πρωί. (εκπαιδευτική προσομοίωση)',
				phrases: [
					{ id: 'clear', text: 'Βάλε ξυπνητήρι για τις 7 το πρωί', correct: true },
					{ id: 'vague', text: 'Ξυπνητήρι' },
					{ id: 'off', text: 'Πρέπει να ξυπνήσω νωρίς αύριο' }
				],
				successMessage: 'Μπράβο! Έδωσες μια ξεκάθαρη εντολή στον βοηθό.',
				hint: 'Ο βοηθός καταλαβαίνει καλύτερα όταν λες ΤΙ και ΠΟΤΕ: «Βάλε ξυπνητήρι για τις 7».'
			}
		},
		{
			n: 16,
			difficulty: 'advanced' as const,
			lessonKey: 'assistant-reminder',
			config: {
				goal: 'mobile-assistant-task',
				prompt:
					'Ζήτα από τον «Ψηφιακό βοηθό» να σου θυμίσει να πάρεις το χάπι σου — διάλεξε τη σωστή διατύπωση.',
				targetAppId: 'assistant',
				intent: 'reminder',
				assistantConfirm:
					'Θα σου θυμίσω να πάρεις το χάπι σου στις 9 το βράδυ. (εκπαιδευτική προσομοίωση)',
				phrases: [
					{ id: 'clear', text: 'Θύμισέ μου να πάρω το χάπι μου στις 9 το βράδυ', correct: true },
					{ id: 'vague', text: 'Χάπι' },
					{ id: 'off', text: 'Ξεχνάω συνέχεια τα φάρμακά μου' }
				],
				successMessage: 'Μπράβο! Ζήτησες με σαφήνεια υπενθύμιση.',
				hint: 'Πες ΤΙ να θυμηθείς και ΠΟΤΕ: «Θύμισέ μου να πάρω το χάπι στις 9».'
			}
		},
		{
			n: 17,
			difficulty: 'advanced' as const,
			lessonKey: 'assistant-ask',
			config: {
				goal: 'mobile-assistant-task',
				prompt:
					'Ρώτα σωστά τον «Ψηφιακό βοηθό» ποια φαρμακεία είναι ανοιχτά — διάλεξε την πιο ξεκάθαρη ερώτηση.',
				targetAppId: 'assistant',
				intent: 'ask',
				assistantGreeting: 'Ρώτησέ με κάτι. Διάλεξε πώς θα το έλεγες:',
				assistantConfirm:
					'Να τα φαρμακεία που είναι ανοιχτά κοντά σου τώρα… (εκπαιδευτική προσομοίωση)',
				phrases: [
					{ id: 'clear', text: 'Ποια φαρμακεία είναι ανοιχτά κοντά μου τώρα;', correct: true },
					{ id: 'vague', text: 'Φαρμακείο' },
					{ id: 'off', text: 'Δεν νιώθω καλά' }
				],
				successMessage: 'Μπράβο! Έκανες μια καθαρή, συγκεκριμένη ερώτηση.',
				hint: 'Μια καλή ερώτηση λέει ΤΙ ψάχνεις και ΠΟΥ/ΠΟΤΕ: «ανοιχτά φαρμακεία κοντά μου τώρα».'
			}
		},
		{
			n: 18,
			difficulty: 'advanced' as const,
			lessonKey: 'scam-sms',
			config: {
				goal: 'mobile-spot-scam-sms',
				prompt:
					'Άνοιξε τα Μηνύματα, διάβασε το SMS από άγνωστο αριθμό και κρίνε: ασφαλές ή ύποπτο;',
				targetAppId: 'messages',
				targetConversationId: 'unknown',
				smsIsScam: true,
				conversations: [
					{
						id: 'unknown',
						name: 'Άγνωστος αριθμός',
						messages: [
							{
								from: 'them' as const,
								text: 'ΕΛΤΑ: Το δέμα σας εκκρεμεί. Πληρώστε 1,99€ τελωνείου εδώ: http://elta-parcel.info/pay'
							}
						]
					}
				],
				successMessage: 'Μπράβο! Το αναγνώρισες ως ύποπτο — μην πατήσεις τον σύνδεσμο.',
				hint: 'Άγνωστος αριθμός, βιασύνη για πληρωμή και περίεργη διεύθυνση = σημάδια απάτης.'
			}
		},
		{
			n: 19,
			difficulty: 'advanced' as const,
			lessonKey: 'two-factor',
			config: {
				goal: 'mobile-enter-2fa',
				prompt:
					'Συνδέσου με ασφάλεια: διάβασε τον κωδικό μιας χρήσης από το SMS και γράψ’ τον στη σελίδα.',
				targetAppId: 'browser',
				loginUrl: 'https://www.mybank.gr/login',
				twofaCode: '482913',
				serviceName: 'MyBank',
				successMessage: 'Μπράβο! Χρησιμοποίησες σωστά τον κωδικό μιας χρήσης.',
				hint: 'Πάτησε «Άνοιξε το SMS», δες τα 6 ψηφία και γράψ’ τα. Μην τα πεις ποτέ σε άλλον.'
			}
		}
	];

	return defs.map(({ n, lessonKey, config, difficulty }, i) => {
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
			difficulty: difficulty ?? ('beginner' as const),
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
