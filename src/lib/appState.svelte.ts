// Re-built with Svelte 5 runes pattern
// This store manages user session and progress using runes instead of writable stores

import { eq, and } from 'drizzle-orm';
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

    reset() {
        this.currentUser = null;
        this.progressMap = new Map();
        this.loading = false;
    }
}

// Export singleton instance
export const appState = new AppState();
