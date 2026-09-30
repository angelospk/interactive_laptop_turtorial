import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ScamSpotterLesson from './ScamSpotterLesson.svelte';

const lesson = {
	id: 'scam-1',
	lessonType: 'scam-spotter',
	config: {
		cards: [
			{
				channel: 'sms',
				from: 'ELTA',
				body: 'Πληρώστε 1,20€ για το δέμα σας',
				isScam: true,
				redFlags: ['Άγνωστος σύνδεσμος'],
				explanation: 'Τα ΕΛΤΑ δεν ζητούν πληρωμή με SMS.'
			}
		]
	}
} as never;

// Leaving the result straight away used to cancel the only report of the score.
test('leaving right after finishing still reports the score, once', async () => {
	const onComplete = vi.fn();
	const onBack = vi.fn();
	const screen = render(ScamSpotterLesson, { lesson, onComplete, onBack });
	await screen.getByRole('button', { name: /Απάτη$/ }).click();
	await screen.getByRole('button', { name: 'Ολοκλήρωση' }).click();
	await screen.getByRole('button', { name: 'Επιστροφή στις ασκήσεις' }).click();

	expect(onComplete).toHaveBeenCalledExactlyOnceWith(100);
	expect(onBack).toHaveBeenCalledOnce();
	await new Promise((resolve) => setTimeout(resolve, 1600));
	expect(onComplete).toHaveBeenCalledOnce();
});
