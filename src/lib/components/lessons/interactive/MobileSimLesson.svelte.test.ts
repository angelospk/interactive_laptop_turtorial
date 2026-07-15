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
