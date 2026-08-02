import { describe, it, expect, vi, beforeEach } from 'vitest';

// The server-progress mutations (merged from the old gameStore, issue C1) call
// invalidateAll after a successful request — mock it so the test stays isolated.
const invalidateAll = vi.fn(() => Promise.resolve());
vi.mock('$app/navigation', () => ({ invalidateAll: () => invalidateAll() }));

import { appState } from './appState.svelte';

describe('appState — server progress mutations (merged from gameStore)', () => {
	beforeEach(() => {
		invalidateAll.mockClear();
		appState.reset();
	});

	it('updateProgress POSTs the result and refreshes on success', async () => {
		const fetchSpy = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response(null, { status: 200 }));

		await appState.updateProgress('module1', 80);

		expect(fetchSpy).toHaveBeenCalledWith(
			'/api/lessons/complete',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ lessonId: 'module1', score: 80 })
			})
		);
		expect(invalidateAll).toHaveBeenCalledOnce();
		fetchSpy.mockRestore();
	});

	it('updateProgress does NOT refresh when the server responds with an error', async () => {
		const fetchSpy = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response(null, { status: 500 }));

		await appState.updateProgress('module1', 80);

		expect(invalidateAll).not.toHaveBeenCalled();
		fetchSpy.mockRestore();
	});

	it('resetProgress POSTs to the reset endpoint and refreshes', async () => {
		const fetchSpy = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response(null, { status: 200 }));

		await appState.resetProgress();

		expect(fetchSpy).toHaveBeenCalledWith('/api/lessons/reset', { method: 'POST' });
		expect(invalidateAll).toHaveBeenCalledOnce();
		fetchSpy.mockRestore();
	});

	it('reset() clears in-memory client state without any network call', () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch');
		appState.setProgress('x', { completed: true } as never);
		appState.reset();
		expect(appState.totalLessonsCompleted).toBe(0);
		expect(appState.isAuthenticated).toBe(false);
		expect(fetchSpy).not.toHaveBeenCalled();
		fetchSpy.mockRestore();
	});
});
