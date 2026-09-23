import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TutorialAssistant from './TutorialAssistant.svelte';

// The assistant used to open itself on the first visit to every lesson, which —
// on a 218-lesson course — means it opens on every lesson, over the lesson, with
// text the learner had just read. It is now strictly opt-in: a labelled button
// the learner presses when they want help.

const launcher = (screen: ReturnType<typeof render>) =>
	screen.getByRole('button', { name: /Βοήθεια/ });

describe('TutorialAssistant', () => {
	it('never opens by itself, not even on a lesson never seen before', async () => {
		const screen = render(TutorialAssistant, {
			lessonId: 'lesson-a',
			instructions: 'Κάνε αυτό το βήμα.'
		});

		await expect.element(launcher(screen)).toBeInTheDocument();
		await expect.element(screen.getByText('Κάνε αυτό το βήμα.')).not.toBeInTheDocument();
	});

	it('announces whether it is open', async () => {
		const screen = render(TutorialAssistant, {
			lessonId: 'lesson-a',
			instructions: 'Κάνε αυτό το βήμα.'
		});

		await expect.element(launcher(screen)).toHaveAttribute('aria-expanded', 'false');
		await launcher(screen).click();
		await expect.element(screen.getByText('Κάνε αυτό το βήμα.')).toBeInTheDocument();
		await expect.element(launcher(screen)).toHaveAttribute('aria-expanded', 'true');
	});

	it('moves the keyboard into the panel when the learner opens it', async () => {
		const screen = render(TutorialAssistant, {
			lessonId: 'lesson-a',
			instructions: 'Κάνε αυτό το βήμα.'
		});

		await launcher(screen).click();
		await expect.element(screen.getByRole('button', { name: /Κλείσιμο/ })).toHaveFocus();
	});

	it('closes from its own button', async () => {
		const screen = render(TutorialAssistant, {
			lessonId: 'lesson-a',
			instructions: 'Κάνε αυτό το βήμα.'
		});

		await launcher(screen).click();
		await screen.getByRole('button', { name: /Κλείσιμο/ }).click();
		await expect.element(screen.getByText('Κάνε αυτό το βήμα.')).not.toBeInTheDocument();
		await expect.element(launcher(screen)).toHaveAttribute('aria-expanded', 'false');
	});

	it('closes on Escape and gives focus back to the button', async () => {
		const screen = render(TutorialAssistant, {
			lessonId: 'lesson-a',
			instructions: 'Κάνε αυτό το βήμα.'
		});

		await launcher(screen).click();
		await expect.element(screen.getByText('Κάνε αυτό το βήμα.')).toBeInTheDocument();

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

		await expect.element(screen.getByText('Κάνε αυτό το βήμα.')).not.toBeInTheDocument();
		await expect.element(launcher(screen)).toHaveFocus();
	});

	it('renders nothing at all when the lesson has no extra help to give', async () => {
		const screen = render(TutorialAssistant, { lessonId: 'lesson-a', instructions: null });
		await expect.element(screen.getByRole('button', { name: /Βοήθεια/ })).not.toBeInTheDocument();
	});

	it('renders a numbered list when the help comes as steps', async () => {
		const screen = render(TutorialAssistant, {
			lessonId: 'lesson-a',
			instructions: ['Πρώτο βήμα.', 'Δεύτερο βήμα.']
		});

		await launcher(screen).click();
		await expect.element(screen.getByRole('list')).toBeInTheDocument();
		await expect.element(screen.getByText('Πρώτο βήμα.')).toBeInTheDocument();
		await expect.element(screen.getByText('Δεύτερο βήμα.')).toBeInTheDocument();
	});

	it('closes when the learner moves to another lesson', async () => {
		const screen = render(TutorialAssistant, {
			lessonId: 'lesson-a',
			instructions: 'Πρώτο μάθημα.'
		});

		await launcher(screen).click();
		await expect.element(screen.getByText('Πρώτο μάθημα.')).toBeInTheDocument();

		await screen.rerender({ lessonId: 'lesson-b', instructions: 'Δεύτερο μάθημα.' });
		await expect.element(screen.getByText('Δεύτερο μάθημα.')).not.toBeInTheDocument();
		await expect.element(launcher(screen)).toHaveAttribute('aria-expanded', 'false');
	});
});
