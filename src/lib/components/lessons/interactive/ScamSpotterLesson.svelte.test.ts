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

// The score used to be reported 1.4s after the result appeared, so any way of
// leaving in that window — Back here, or the lesson runner's Next/Previous —
// lost it. It is reported the moment the drill is finished.
test('the score is reported the moment the drill is finished, once', async () => {
	const onComplete = vi.fn();
	const onBack = vi.fn();
	const screen = render(ScamSpotterLesson, { lesson, onComplete, onBack });
	await screen.getByRole('button', { name: /Απάτη$/ }).click();
	await screen.getByRole('button', { name: 'Ολοκλήρωση' }).click();
	expect(onComplete).toHaveBeenCalledExactlyOnceWith(100);
	await screen.getByRole('button', { name: 'Επιστροφή στις ασκήσεις' }).click();

	expect(onComplete).toHaveBeenCalledExactlyOnceWith(100);
	expect(onBack).toHaveBeenCalledOnce();
	await new Promise((resolve) => setTimeout(resolve, 1600));
	expect(onComplete).toHaveBeenCalledOnce();
});
