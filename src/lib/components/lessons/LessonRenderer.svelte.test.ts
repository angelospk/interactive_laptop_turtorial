import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LessonRenderer from './LessonRenderer.svelte';

/**
 * Regression (codex review): SvelteKit preserves the component across
 * same-route param navigation, so LessonRenderer must re-mount the lesson
 * component when lesson.id changes — otherwise local state (feedback, done,
 * config snapshot) leaks from the previous lesson.
 */

const mkLesson = (id: string, prompt: string, targetAppId: string) =>
	({
		id,
		moduleId: 'android',
		lessonType: 'mobile-sim',
		config: {
			goal: 'mobile-open-app',
			variant: 'android',
			prompt,
			apps: [
				{ id: 'viber', label: 'Viber', icon: '💜' },
				{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️' }
			],
			targetAppId,
			successMessage: 'ΟΚ.'
		}
	}) as never;

describe('LessonRenderer', () => {
	it('resets lesson-local state when the lesson prop changes id', async () => {
		const props = {
			lesson: mkLesson('l1', 'Πρώτο μάθημα.', 'viber'),
			onComplete: vi.fn(),
			onBack: vi.fn()
		};
		const screen = render(LessonRenderer, props);

		// Make a mistake in lesson 1 so local state (feedback) is non-empty.
		await screen.getByRole('button', { name: 'Άνοιγμα Ρυθμίσεις' }).click();
		await expect.element(screen.getByText(/Όχι αυτό/)).toBeInTheDocument();

		// Navigate to lesson 2 (same component, new lesson prop).
		await screen.rerender({ lesson: mkLesson('l2', 'Δεύτερο μάθημα.', 'settings') });

		await expect.element(screen.getByText('Δεύτερο μάθημα.')).toBeInTheDocument();
		// The previous lesson's feedback must NOT survive the switch.
		await expect.element(screen.getByText(/Όχι αυτό/)).not.toBeInTheDocument();
	});

	it('an unknown lesson type explains itself in Greek, without technical words', async () => {
		const onBack = vi.fn();
		const screen = render(LessonRenderer, {
			lesson: { id: 'x', moduleId: 'm', lessonType: 'no-such-type', config: {} } as never,
			onComplete: () => {},
			onBack
		});
		await expect
			.element(screen.getByRole('heading', { name: 'Αυτό το μάθημα δεν άνοιξε' }))
			.toBeInTheDocument();
		await expect.element(screen.getByText(/no-such-type/)).not.toBeInTheDocument();
		await screen.getByRole('button', { name: 'Πίσω στα μαθήματα' }).click();
		expect(onBack).toHaveBeenCalledOnce();
	});
});
