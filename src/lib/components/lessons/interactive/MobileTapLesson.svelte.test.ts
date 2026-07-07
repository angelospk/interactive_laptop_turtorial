import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MobileTapLesson from './MobileTapLesson.svelte';

const lesson = {
	id: 'android-open-viber',
	moduleId: 'android',
	lessonType: 'mobile-tap',
	config: {
		prompt: 'Πάτησε το Viber.',
		apps: [
			{ id: 'phone', label: 'Τηλέφωνο', icon: '📞' },
			{ id: 'viber', label: 'Viber', icon: '💜' },
			{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️' }
		],
		targetAppId: 'viber',
		successMessage: 'Μπράβο! Άνοιξες το Viber.',
		hint: 'Το Viber έχει μωβ χρώμα.'
	}
} as never;

describe('MobileTapLesson', () => {
	it('renders each app as a labelled, accessible button', async () => {
		const screen = render(MobileTapLesson, { lesson, onComplete: vi.fn(), onBack: vi.fn() });
		await expect.element(screen.getByRole('button', { name: 'Άνοιγμα Viber' })).toBeInTheDocument();
		await expect
			.element(screen.getByRole('button', { name: 'Άνοιγμα Τηλέφωνο' }))
			.toBeInTheDocument();
	});

	it('gives calm feedback on a wrong tap without completing', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileTapLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Τηλέφωνο' }).click();
		await expect.element(screen.getByText(/Όχι αυτό/)).toBeInTheDocument();
		expect(onComplete).not.toHaveBeenCalled();
	});

	it('completes with full score when the correct app is tapped first', async () => {
		const onComplete = vi.fn();
		const screen = render(MobileTapLesson, { lesson, onComplete, onBack: vi.fn() });
		await screen.getByRole('button', { name: 'Άνοιγμα Viber' }).click();
		await expect.element(screen.getByText('Μπράβο! Άνοιξες το Viber.')).toBeInTheDocument();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 2000 });
	});
});
