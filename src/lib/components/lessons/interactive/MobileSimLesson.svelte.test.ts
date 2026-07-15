import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MobileSimLesson from './MobileSimLesson.svelte';

const baseApps = [
	{ id: 'phone', label: 'Τηλέφωνο', icon: '📞', kind: 'phone' },
	{ id: 'viber', label: 'Viber', icon: '💜' },
	{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️' }
];

const openLesson = {
	id: 'android-open-app-v2',
	moduleId: 'android',
	lessonType: 'mobile-sim',
	config: {
		goal: 'mobile-open-app',
		variant: 'android',
		prompt: 'Άνοιξε το Viber.',
		apps: baseApps,
		dockAppIds: ['phone'],
		targetAppId: 'viber',
		successMessage: 'Μπράβο! Άνοιξες το Viber.'
	}
} as never;

const dialLesson = {
	id: 'android-call-number',
	moduleId: 'android',
	lessonType: 'mobile-sim',
	config: {
		goal: 'mobile-dial-number',
		variant: 'android',
		prompt: 'Κάλεσε το 210.',
		apps: baseApps,
		targetAppId: 'phone',
		targetNumber: '210',
		successMessage: 'Μπράβο! Έκανες την κλήση.'
	}
} as never;

describe('MobileSimLesson — home screen', () => {
	it('renders every app as a labelled button on the home screen', async () => {
		const screen = render(MobileSimLesson, { lesson: openLesson, onComplete: vi.fn(), onBack: vi.fn() });
		await expect.element(screen.getByRole('button', { name: 'Άνοιγμα Viber' })).toBeInTheDocument();
		await expect
			.element(screen.getByRole('button', { name: 'Άνοιγμα Τηλέφωνο' }))
			.toBeInTheDocument();
	});

	it('completes an open-app goal with full score on a first correct tap', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson: openLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Viber' }).click();
		await expect.element(screen.getByText('Μπράβο! Άνοιξες το Viber.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('gives calm feedback on a wrong app without completing', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson: openLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Ρυθμίσεις' }).click();
		await expect.element(screen.getByText(/Όχι αυτό/)).toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
	});
});

describe('MobileSimLesson — dialer flow', () => {
	it('opens the phone app and completes when the target number is called', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson: dialLesson, onComplete, onBack: vi.fn() });

		await screen.getByRole('button', { name: 'Άνοιγμα Τηλέφωνο' }).click();
		await screen.getByRole('button', { name: 'Ψηφίο 2' }).click();
		await screen.getByRole('button', { name: 'Ψηφίο 1' }).click();
		await screen.getByRole('button', { name: 'Ψηφίο 0' }).click();
		await screen.getByRole('button', { name: 'Κλήση' }).click();

		await expect.element(screen.getByText('Μπράβο! Έκανες την κλήση.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('does not complete on a wrong number and offers gentle feedback', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson: dialLesson, onComplete, onBack: vi.fn() });

		await screen.getByRole('button', { name: 'Άνοιγμα Τηλέφωνο' }).click();
		await screen.getByRole('button', { name: 'Ψηφίο 9' }).click();
		await screen.getByRole('button', { name: 'Κλήση' }).click();

		await expect.element(screen.getByText(/λάθος αριθμό/i)).toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
	});

	it('can return to the home screen from inside an app', async () => {
		const screen = render(MobileSimLesson, { lesson: dialLesson, onComplete: vi.fn(), onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Ρυθμίσεις' }).click();
		await screen.getByRole('button', { name: 'Αρχική οθόνη' }).click();
		await expect.element(screen.getByRole('button', { name: 'Άνοιγμα Viber' })).toBeInTheDocument();
	});
});

const mkLesson = (config: Record<string, unknown>) =>
	({
		id: 'test-lesson',
		moduleId: 'android',
		lessonType: 'mobile-sim',
		config: { variant: 'android', apps: baseApps, ...config }
	}) as never;

describe('MobileSimLesson — contacts flow', () => {
	const lesson = mkLesson({
		goal: 'mobile-call-contact',
		prompt: 'Κάλεσε τη Μαρία.',
		targetAppId: 'phone',
		targetContactId: 'maria',
		contacts: [
			{ id: 'maria', name: 'Μαρία', number: '6971111111' },
			{ id: 'nikos', name: 'Νίκος', number: '6972222222' }
		],
		successMessage: 'Μπράβο! Κάλεσες τη Μαρία.'
	});

	it('completes when the target contact is called from the contacts tab', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Τηλέφωνο' }).click();
		await screen.getByRole('button', { name: 'Επαφές' }).click();
		await screen.getByRole('button', { name: 'Κλήση Μαρία' }).click();
		await expect.element(screen.getByText('Μπράβο! Κάλεσες τη Μαρία.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});
});

describe('MobileSimLesson — messaging flow', () => {
	const messagingApps = [
		{ id: 'messages', label: 'Μηνύματα', icon: '💬', kind: 'messages' },
		{ id: 'viber', label: 'Viber', icon: '💜', kind: 'viber' }
	];
	const conversations = [
		{ id: 'kori', name: 'Ελένη (κόρη)', messages: [{ from: 'them', text: 'Καλημέρα μαμά!' }] }
	];

	it('completes an SMS goal by typing and sending a message', async () => {
		const onComplete = vi.fn();
		const lesson = mkLesson({
			goal: 'mobile-send-sms',
			prompt: 'Στείλε SMS στην Ελένη.',
			apps: messagingApps,
			targetAppId: 'messages',
			targetConversationId: 'kori',
			conversations,
			successMessage: 'Μπράβο! Το SMS στάλθηκε.'
		});
		const screen = render(MobileSimLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Μηνύματα' }).click();
		await screen.getByRole('button', { name: 'Συνομιλία με Ελένη (κόρη)' }).click();
		await screen.getByRole('textbox', { name: 'Γράψε μήνυμα' }).fill('Γεια σου!');
		await screen.getByRole('button', { name: 'Αποστολή' }).click();
		await expect.element(screen.getByText('Μπράβο! Το SMS στάλθηκε.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('completes a video-call goal from the Viber conversation header', async () => {
		const onComplete = vi.fn();
		const lesson = mkLesson({
			goal: 'mobile-start-videocall',
			prompt: 'Κάνε βιντεοκλήση στην Ελένη.',
			apps: messagingApps,
			targetAppId: 'viber',
			targetConversationId: 'kori',
			conversations,
			successMessage: 'Μπράβο! Η βιντεοκλήση ξεκίνησε.'
		});
		const screen = render(MobileSimLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Viber' }).click();
		await screen.getByRole('button', { name: 'Συνομιλία με Ελένη (κόρη)' }).click();
		await screen.getByRole('button', { name: 'Βιντεοκλήση με Ελένη (κόρη)' }).click();
		await expect.element(screen.getByText('Μπράβο! Η βιντεοκλήση ξεκίνησε.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('a viber goal is not satisfied from the SMS app', async () => {
		const onComplete = vi.fn();
		const lesson = mkLesson({
			goal: 'mobile-send-chat',
			prompt: 'Στείλε μήνυμα στο Viber.',
			apps: messagingApps,
			targetAppId: 'viber',
			conversations
		});
		const screen = render(MobileSimLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Μηνύματα' }).click();
		await screen.getByRole('button', { name: 'Συνομιλία με Ελένη (κόρη)' }).click();
		await screen.getByRole('textbox', { name: 'Γράψε μήνυμα' }).fill('Γεια!');
		await screen.getByRole('button', { name: 'Αποστολή' }).click();
		expect(onComplete).not.toHaveBeenCalled();
	});
});

describe('MobileSimLesson — force close (recent apps)', () => {
	const forceCloseLesson = mkLesson({
		goal: 'mobile-force-close',
		prompt: 'Κλείσε την εφαρμογή που κόλλησε.',
		targetAppId: 'settings',
		recentAppIds: ['phone', 'viber', 'settings'],
		successMessage: 'Μπράβο! Έκλεισες την εφαρμογή που κόλλησε.'
	});

	it('opens recents and completes when the frozen app is dismissed', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson: forceCloseLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Πρόσφατες εφαρμογές' }).click();
		await expect.element(screen.getByTestId('recent-apps')).toBeInTheDocument();
		await screen.getByRole('button', { name: 'Κλείσιμο Ρυθμίσεις' }).click();
		await expect
			.element(screen.getByText('Μπράβο! Έκλεισες την εφαρμογή που κόλλησε.'))
			.toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('does not complete when a different app is closed', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson: forceCloseLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Πρόσφατες εφαρμογές' }).click();
		await screen.getByRole('button', { name: 'Κλείσιμο Viber' }).click();
		await expect.element(screen.getByText(/Έκλεισες άλλη εφαρμογή/)).toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
	});
});

describe('MobileSimLesson — digital assistant (phrase chips)', () => {
	const assistantLesson = mkLesson({
		goal: 'mobile-assistant-task',
		prompt: 'Ζήτα να μπει ξυπνητήρι.',
		apps: [{ id: 'assistant', label: 'Ψηφιακός βοηθός', icon: '✨', kind: 'assistant' }],
		targetAppId: 'assistant',
		intent: 'alarm',
		assistantConfirm: 'Έβαλα ξυπνητήρι.',
		phrases: [
			{ id: 'clear', text: 'Βάλε ξυπνητήρι για τις 7 το πρωί', correct: true },
			{ id: 'vague', text: 'Ξυπνητήρι' }
		],
		successMessage: 'Μπράβο! Έδωσες ξεκάθαρη εντολή.'
	});

	it('completes when the well-formed phrase is chosen', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson: assistantLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Ψηφιακός βοηθός' }).click();
		await screen.getByRole('button', { name: '«Βάλε ξυπνητήρι για τις 7 το πρωί»' }).click();
		await expect.element(screen.getByText('Μπράβο! Έδωσες ξεκάθαρη εντολή.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('does not complete on a vague phrase and nudges to rephrase', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson: assistantLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Ψηφιακός βοηθός' }).click();
		await screen.getByRole('button', { name: '«Ξυπνητήρι»' }).click();
		await expect.element(screen.getByText(/δεν το κατάλαβε/)).toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
	});
});

describe('MobileSimLesson — store app update', () => {
	const storeLesson = mkLesson({
		goal: 'mobile-update-app',
		prompt: 'Ενημέρωσε το Viber.',
		apps: [{ id: 'store', label: 'Play Store', icon: '🛍️', kind: 'store' }],
		targetAppId: 'store',
		storeName: 'Play Store',
		targetUpdateId: 'viber',
		storeItems: [
			{ id: 'viber', label: 'Viber', icon: '💜', hasUpdate: true },
			{ id: 'maps', label: 'Χάρτες', icon: '🗺️', hasUpdate: true }
		],
		successMessage: 'Μπράβο! Ενημέρωσες το Viber.'
	});

	it('completes when the target app is updated from the official store', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson: storeLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Play Store' }).click();
		await screen.getByRole('button', { name: 'Ενημέρωση Viber' }).click();
		await expect.element(screen.getByText('Μπράβο! Ενημέρωσες το Viber.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('does not complete when the wrong app is updated', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, { lesson: storeLesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Play Store' }).click();
		await screen.getByRole('button', { name: 'Ενημέρωση Χάρτες' }).click();
		await expect.element(screen.getByText(/Ενημέρωσες άλλη εφαρμογή/)).toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
	});
});

describe('MobileSimLesson — QR scan + link check', () => {
	const qrLesson = (qrUrl: string) =>
		({
			id: 'android-scan-qr',
			moduleId: 'android',
			lessonType: 'mobile-sim',
			config: {
				goal: 'mobile-scan-qr',
				variant: 'android',
				prompt: 'Σκάναρε τον κωδικό QR.',
				apps: [{ id: 'camera', label: 'Κάμερα', icon: '📷', kind: 'camera' }],
				targetAppId: 'camera',
				qrUrl,
				targetHost: 'gov.gr',
				successMessage: 'Μπράβο! Άνοιξες τον επίσημο σύνδεσμο.'
			}
		}) as never;

	it('completes when the official gov.gr link is scanned and opened', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, {
			lesson: qrLesson('https://www.gov.gr/ipiresies'),
			onComplete,
			onBack: vi.fn()
		});
		await screen.getByRole('button', { name: 'Άνοιγμα Κάμερα' }).click();
		await screen.getByRole('button', { name: 'Σάρωση κωδικού' }).click();
		await screen.getByRole('button', { name: 'Άνοιγμα συνδέσμου' }).click();
		await expect.element(screen.getByText('Μπράβο! Άνοιξες τον επίσημο σύνδεσμο.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('warns and does not complete for a lookalike domain', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, {
			lesson: qrLesson('https://gov.gr.evil.com/login'),
			onComplete,
			onBack: vi.fn()
		});
		await screen.getByRole('button', { name: 'Άνοιγμα Κάμερα' }).click();
		await screen.getByRole('button', { name: 'Σάρωση κωδικού' }).click();
		await screen.getByRole('button', { name: 'Άνοιγμα συνδέσμου' }).click();
		await expect.element(screen.getByText(/δεν είναι το επίσημο gov.gr/)).toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
	});
});

describe('MobileSimLesson — screenshot chord', () => {
	const screenshotLesson = (variant: 'android' | 'ios') =>
		({
			id: `${variant}-screenshot`,
			moduleId: variant === 'ios' ? 'iphone' : 'android',
			lessonType: 'mobile-sim',
			config: {
				goal: 'mobile-screenshot',
				variant,
				prompt: 'Τράβηξε στιγμιότυπο οθόνης.',
				apps: baseApps,
				successMessage: 'Μπράβο! Τράβηξες στιγμιότυπο.'
			}
		}) as never;

	it('completes on the correct Android chord (power + volume-down)', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, {
			lesson: screenshotLesson('android'),
			onComplete,
			onBack: vi.fn()
		});
		await screen.getByTestId('bezel-power').click();
		await screen.getByTestId('bezel-volume-down').click();
		await expect.element(screen.getByText('Μπράβο! Τράβηξες στιγμιότυπο.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('rejects the iOS chord on an Android lesson (wrong combination)', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, {
			lesson: screenshotLesson('android'),
			onComplete,
			onBack: vi.fn()
		});
		await screen.getByTestId('bezel-power').click();
		await screen.getByTestId('bezel-volume-up').click();
		await expect.element(screen.getByText(/Άλλος συνδυασμός/)).toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
	});

	it('completes on the correct iOS chord (side + volume-up)', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileSimLesson, {
			lesson: screenshotLesson('ios'),
			onComplete,
			onBack: vi.fn()
		});
		await screen.getByTestId('bezel-power').click();
		await screen.getByTestId('bezel-volume-up').click();
		await expect.element(screen.getByText('Μπράβο! Τράβηξες στιγμιότυπο.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});
});

describe('MobileSimLesson — settings flows', () => {
	const settingsApps = [{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️', kind: 'settings' }];

	it('completes the font-size goal', async () => {
		const onComplete = vi.fn();
		const lesson = mkLesson({
			goal: 'mobile-change-font-size',
			prompt: 'Κάνε τα γράμματα Μεγάλα.',
			apps: settingsApps,
			targetAppId: 'settings',
			targetSize: 'large',
			successMessage: 'Μπράβο! Μεγάλωσες τα γράμματα.'
		});
		const screen = render(MobileSimLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Ρυθμίσεις' }).click();
		await screen.getByRole('button', { name: 'Μέγεθος γραμμάτων' }).click();
		await screen.getByRole('button', { name: 'Μεγάλα' }).click();
		await expect.element(screen.getByText('Μπράβο! Μεγάλωσες τα γράμματα.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('completes the night-mode goal by toggling it on', async () => {
		const onComplete = vi.fn();
		const lesson = mkLesson({
			goal: 'mobile-night-mode',
			prompt: 'Άνοιξε τη νυχτερινή λειτουργία.',
			apps: settingsApps,
			targetAppId: 'settings',
			successMessage: 'Μπράβο! Άνοιξες τη νυχτερινή λειτουργία.'
		});
		const screen = render(MobileSimLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Ρυθμίσεις' }).click();
		await screen.getByRole('button', { name: 'Νυχτερινή λειτουργία' }).click();
		await screen.getByRole('switch', { name: 'Νυχτερινή λειτουργία' }).click();
		await expect
			.element(screen.getByText('Μπράβο! Άνοιξες τη νυχτερινή λειτουργία.'))
			.toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('completes the find-device goal by toggling it on', async () => {
		const onComplete = vi.fn();
		const lesson = mkLesson({
			goal: 'mobile-find-device',
			prompt: 'Ενεργοποίησε την εύρεση συσκευής.',
			apps: settingsApps,
			targetAppId: 'settings',
			successMessage: 'Μπράβο! Ενεργοποίησες την εύρεση.'
		});
		const screen = render(MobileSimLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Ρυθμίσεις' }).click();
		await screen.getByRole('button', { name: 'Εύρεση συσκευής' }).click();
		await screen.getByRole('switch', { name: 'Εύρεση συσκευής' }).click();
		await expect.element(screen.getByText('Μπράβο! Ενεργοποίησες την εύρεση.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});

	it('completes the wifi goal only on the target network', async () => {
		const onComplete = vi.fn();
		const lesson = mkLesson({
			goal: 'mobile-connect-wifi',
			prompt: 'Συνδέσου στο σπίτι.',
			apps: settingsApps,
			targetAppId: 'settings',
			targetSsid: 'SPITI-WIFI',
			wifiNetworks: ['SPITI-WIFI', 'CAFE-NET'],
			successMessage: 'Μπράβο! Συνδέθηκες στο Wi-Fi.'
		});
		const screen = render(MobileSimLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Ρυθμίσεις' }).click();
		await screen.getByRole('button', { name: 'Wi-Fi' }).click();
		await screen.getByRole('button', { name: 'Σύνδεση στο δίκτυο CAFE-NET' }).click();
		expect(onComplete).not.toHaveBeenCalled();
		await screen.getByRole('button', { name: 'Σύνδεση στο δίκτυο SPITI-WIFI' }).click();
		await expect.element(screen.getByText('Μπράβο! Συνδέθηκες στο Wi-Fi.')).toBeInTheDocument();
		// Wrong network first → gentle penalty score (80), never a fail.
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(80), { timeout: 2000 });
	});
});
