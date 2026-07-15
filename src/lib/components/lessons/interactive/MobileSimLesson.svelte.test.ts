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
