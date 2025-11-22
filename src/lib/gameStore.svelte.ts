import { invalidateAll } from '$app/navigation';

// Compatibility wrapper for old gameState pattern
// NOW INTEGRATED WITH DYNAMIC LESSON SYSTEM

export const gameState = {
  // Subscribe method for old $gameState syntax (noop for compatibility)
  subscribe(fn: (state: any) => void) {
    return () => { };
  },

  // Update progress method
  async updateProgress(lessonId: string, score: number) {
    try {
      const response = await fetch('/api/lessons/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          score
        })
      });

      if (!response.ok) {
        console.error('Failed to save progress');
      } else {
        await invalidateAll();
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  },

  // Reset progress
  async reset() {
    try {
      const response = await fetch('/api/lessons/reset', {
        method: 'POST'
      });

      if (response.ok) {
        await invalidateAll();
      } else {
        console.error('Failed to reset progress');
      }
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  },

  // Get current state (placeholder)
  get progress() {
    return {};
  }
};

// Create a store-like object that can be used with $ syntax
const storeProxy = new Proxy(gameState, {
  get(target, prop) {
    if (prop === 'progress') {
      return target.progress;
    }
    return (target as any)[prop];
  }
});

export default storeProxy;
