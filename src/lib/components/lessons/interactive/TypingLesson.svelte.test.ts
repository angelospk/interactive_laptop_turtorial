import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';

vi.mock('svelte-sonner', () => ({
	toast: { error: vi.fn(), success: vi.fn() },
	Toaster: () => null
}));

import TypingLesson from './TypingLesson.svelte';

// Beginners got stuck in two places: they typed without clicking the box first,
// so nothing appeared, and they did not know Enter submits the answer.

const lesson = {
	id: 'module2-lesson1',
	moduleId: 'module2',
	lessonType: 'typing',
	titleKey: 'module2_lesson1_title',
	descriptionKey: '',
	difficulty: 'beginner',
	config: { text: 'simple' }
} as never;

const props = () => ({ lesson, onComplete: vi.fn(), onBack: vi.fn() });

describe('TypingLesson', () => {
	it('puts the cursor in the text box on start', async () => {
		const screen = render(TypingLesson, props());
		await expect.element(screen.getByRole('textbox')).toHaveFocus();
	});

	it('asks for a click into the box when the cursor is not there, and the hint brings it back', async () => {
		const screen = render(TypingLesson, props());
		const box = screen.getByRole('textbox');
		await expect.element(box).toHaveFocus();
		(box.element() as HTMLInputElement).blur();

		const hint = screen.getByRole('button', { name: /Πατήστε μέσα στο κουτί/ });
		await expect.element(hint).toBeVisible();
		await hint.click();
		await expect.element(box).toHaveFocus();
	});

	it('shows the three steps and marks the current one', async () => {
		const screen = render(TypingLesson, props());
		const steps = screen.getByRole('list', { name: 'Βήματα' });
		await expect.element(steps).toBeVisible();
		await expect
			.element(screen.getByText('Γράψτε τη λέξη', { exact: true }).element().closest('li')!)
			.toHaveAttribute('aria-current', 'step');

		await userEvent.keyboard('καλημέρα');
		await expect
			.element(screen.getByText('Πατήστε Enter', { exact: true }).element().closest('li')!)
			.toHaveAttribute('aria-current', 'step');
	});

	it('offers an Enter button once the text is right, and it completes the lesson', async () => {
		const p = props();
		const screen = render(TypingLesson, p);
		await userEvent.keyboard('καλημέρα');
		const enter = screen.getByRole('button', { name: /Enter/ });
		await expect.element(enter).toBeVisible();
		await enter.click();
		expect(p.onComplete).toHaveBeenCalledOnce();
	});

	it('completes on the Enter key as before', async () => {
		const p = props();
		render(TypingLesson, p);
		await userEvent.keyboard('καλημέρα{Enter}');
		expect(p.onComplete).toHaveBeenCalledOnce();
	});
});
