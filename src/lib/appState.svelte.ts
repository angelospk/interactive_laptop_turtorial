// Svelte 5 runes store for user session + progress.
// Also owns the server-progress mutations that used to live in the legacy
// `gameStore.svelte.ts` compatibility wrapper (merged — issue C1).

import { invalidateAll } from '$app/navigation';
import type { UserSession, UserLessonProgress } from '$lib/types';

// Reactive state using Svelte 5 $state rune
class AppState {
	currentUser = $state<UserSession | null>(null);
	progressMap = $state<Map<string, UserLessonProgress>>(new Map());
	loading = $state(false);

	// Derived states using $derived
	get isAuthenticated() {
		return this.currentUser !== null;
	}

	get totalLessonsCompleted() {
		return Array.from(this.progressMap.values()).filter((p) => p.completed).length;
	}

	get totalStarsEarned() {
		return Array.from(this.progressMap.values()).reduce((sum, p) => sum + (p.stars || 0), 0);
	}

	// Methods
	setUser(user: UserSession | null) {
		this.currentUser = user;
	}

	setProgress(lessonId: string, progress: UserLessonProgress) {
		const newMap = new Map(this.progressMap);
		newMap.set(lessonId, progress);
		this.progressMap = newMap;
	}

	clearProgress() {
		this.progressMap = new Map();
	}

	getProgressForLesson(lessonId: string): UserLessonProgress | undefined {
		return this.progressMap.get(lessonId);
	}

	/**
	 * Persist a lesson result to the server, then refresh loaded data so the UI
	 * reflects the new progress. (Formerly `gameState.updateProgress`.)
	 */
	async updateProgress(lessonId: string, score: number) {
		try {
			const response = await fetch('/api/lessons/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId, score })
			});
			if (!response.ok) {
				console.error('Failed to save progress');
			} else {
				await invalidateAll();
			}
		} catch (error) {
			console.error('Error saving progress:', error);
		}
	}

	/**
	 * Reset ALL of the user's progress on the server, then refresh.
	 * (Formerly `gameState.reset`.) Named `resetProgress` to stay distinct from
	 * `reset()` below, which only clears in-memory client state.
	 */
	async resetProgress() {
		try {
			const response = await fetch('/api/lessons/reset', { method: 'POST' });
			if (response.ok) {
				await invalidateAll();
			} else {
				console.error('Failed to reset progress');
			}
		} catch (error) {
			console.error('Error resetting progress:', error);
		}
	}

	/** Clear in-memory client state (sign-out / teardown). */
	reset() {
		this.currentUser = null;
		this.progressMap = new Map();
		this.loading = false;
	}
}

// Export singleton instance
export const appState = new AppState();
