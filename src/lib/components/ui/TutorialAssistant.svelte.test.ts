import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TutorialAssistant from './TutorialAssistant.svelte';

const key = (lessonId: string) => `tutorial-assistant-${lessonId}-seen`;

describe('TutorialAssistant persistence', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('shows expanded on the first visit to a lesson and marks it seen', async () => {
		const screen = render(TutorialAssistant, {
			lessonId: 'lesson-a',
			instructions: 'Κάνε αυτό το βήμα.'
		});
		// Expanded panel renders the instructions text.
		await expect.element(screen.getByText('Κάνε αυτό το βήμα.')).toBeInTheDocument();
		expect(localStorage.getItem(key('lesson-a'))).toBe('true');
	});

	it('starts minimized on a subsequent visit to the same lesson', async () => {
		localStorage.setItem(key('lesson-a'), 'true');
		const screen = render(TutorialAssistant, {
			lessonId: 'lesson-a',
			instructions: 'Κάνε αυτό το βήμα.'
		});
		// Minimized: only the open-assistant button shows; instructions fly out.
		await expect
			.element(screen.getByRole('button', { name: 'Άνοιγμα Βοηθού' }))
			.toBeInTheDocument();
		await expect.element(screen.getByText('Κάνε αυτό το βήμα.')).not.toBeInTheDocument();
	});

	it('scopes persistence per lesson: a new lesson still opens expanded', async () => {
		localStorage.setItem(key('lesson-a'), 'true');
		const screen = render(TutorialAssistant, {
			lessonId: 'lesson-b',
			instructions: 'Δεύτερο μάθημα.'
		});
		await expect.element(screen.getByText('Δεύτερο μάθημα.')).toBeInTheDocument();
		expect(localStorage.getItem(key('lesson-b'))).toBe('true');
	});
});
