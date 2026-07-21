import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';

// Capture toast.error calls without needing a mounted <Toaster>.
const toastError = vi.fn();
vi.mock('svelte-sonner', () => ({
	toast: { error: (...a: unknown[]) => toastError(...a), success: vi.fn() },
	Toaster: () => null
}));

import ClickLesson from './ClickLesson.svelte';

function makeLesson(config: Record<string, unknown>) {
	return {
		id: 'module1-lesson10',
		moduleId: 'module1',
		lessonType: 'click',
		titleKey: 'module1_lesson10',
		descriptionKey: 'module1_lesson10_desc',
		difficulty: 'beginner',
		config
	} as never;
}

describe('ClickLesson click-pattern validation', () => {
	beforeEach(() => {
		toastError.mockClear();
		// Deterministic randomness: Math.floor(0.5 * 3) === 1 → mixedType 'double-click'.
		vi.spyOn(Math, 'random').mockReturnValue(0.5);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('rejects a wrong click type in mixed mode: no progress, error toast, no completion', async () => {
		const onComplete = vi.fn();
		const screen = render(ClickLesson, {
			lesson: makeLesson({ targetCount: 3, timeLimit: 45, theme: 'mixed' }),
			onComplete,
			onBack: vi.fn()
		});

		await screen.getByRole('button', { name: /Έναρξη|Start/ }).click();

		// mixedType is 'double-click' → a single click is the wrong pattern.
		await screen.getByRole('button', { name: '2x CLICK' }).click();

		expect(toastError).toHaveBeenCalledTimes(1);
		expect(onComplete).not.toHaveBeenCalled();
		// Progress counter must stay at 0 successful clicks.
		await expect.element(screen.getByText(/0\/3/)).toBeInTheDocument();
	});

	it('accepts the correct click and completes the lesson', async () => {
		const onComplete = vi.fn();
		const screen = render(ClickLesson, {
			lesson: makeLesson({ targetCount: 1, timeLimit: 45, theme: 'default' }),
			onComplete,
			onBack: vi.fn()
		});

		await screen.getByRole('button', { name: /Έναρξη|Start/ }).click();
		await screen.getByRole('button', { name: 'CLICK' }).click();

		expect(toastError).not.toHaveBeenCalled();
		await vi.waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 3000 });
	});
});
