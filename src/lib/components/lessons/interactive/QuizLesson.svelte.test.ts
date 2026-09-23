import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import QuizLesson from './QuizLesson.svelte';

/**
 * Every quiz lesson crashed on open: the answer started as `undefined` and was
 * bound to a RadioGroup whose `value` has a fallback, which Svelte refuses
 * (props_invalid_value). The learner saw an empty page, 20 lessons in a row.
 */
const lesson = {
	id: 'quiz-test',
	config: {
		questions: [
			{
				id: 'q1',
				text: 'Ποιο λουκέτο δείχνει ασφαλή σύνδεση;',
				options: [
					{ id: 'a', text: 'Κλειστό λουκέτο', correct: true },
					{ id: 'b', text: 'Ανοιχτό λουκέτο' }
				]
			}
		]
	}
};

describe('QuizLesson', () => {
	it('opens, and lets the learner pick an answer', async () => {
		const screen = render(QuizLesson, {
			lesson,
			onComplete: vi.fn(),
			onBack: vi.fn()
		} as never);
		await expect.element(screen.getByText('Ποιο λουκέτο δείχνει ασφαλή σύνδεση;')).toBeVisible();
		await screen.getByText('Κλειστό λουκέτο').click();
		await expect.element(screen.getByRole('radio', { name: 'Κλειστό λουκέτο' })).toBeChecked();
	});

	// The finishing button said "Finish" in English, in an all-Greek lesson.
	it('finishes in Greek and reports the score', async () => {
		const onComplete = vi.fn();
		const screen = render(QuizLesson, { lesson, onComplete, onBack: vi.fn() } as never);
		await screen.getByText('Κλειστό λουκέτο').click();
		await screen.getByRole('button', { name: 'Υποβολή' }).click();
		await screen.getByRole('button', { name: 'Τέλος' }).click();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(100), { timeout: 3000 });
	});

	// The result is reported after a short pause; a learner who has left by then
	// must not have it land on whatever lesson is on screen instead.
	it('reports nothing once the lesson is gone', async () => {
		const onComplete = vi.fn();
		const screen = render(QuizLesson, { lesson, onComplete, onBack: vi.fn() } as never);
		await screen.getByText('Κλειστό λουκέτο').click();
		await screen.getByRole('button', { name: 'Υποβολή' }).click();
		await screen.getByRole('button', { name: 'Τέλος' }).click();
		screen.unmount();
		await new Promise((resolve) => setTimeout(resolve, 2000));
		expect(onComplete).not.toHaveBeenCalled();
	});
});
