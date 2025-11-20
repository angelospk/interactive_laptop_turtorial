// Compatibility wrapper for old gameState pattern
// NOW WITH REAL DATABASE INTEGRATION

import { appState } from './appState.svelte';

// Map old module IDs to lesson IDs
const MODULE_TO_LESSON_MAP: Record<string, string> = {
  module1: 'module1-complete',
  module2: 'module2-complete',
  module3: 'module3-complete',
  module4: 'module4-complete'
};

// Create a compatible interface that mimics the old gameState
export const gameState = {
  // Subscribe method for old $gameState syntax
  subscribe(fn: (state: any) => void) {
    // Return a simple unsubscribe function
    return () => { };
  },

  // Update progress method - NOW SAVES TO DATABASE
  async updateProgress(module: string, value: number) {
    const lessonId = MODULE_TO_LESSON_MAP[module] || module;
    const completed = value >= 100;

    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          score: value,
          completed
        })
      });

      if (!response.ok) {
        console.error('Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  },

  // Reset method - TODO: Implement reset endpoint
  async reset() {
    console.log('Reset progress - TODO: implement API endpoint');
  },

  // Get current state (for $gameState.progress syntax)
  get progress() {
    // Return empty progress for now - will be loaded from server
    return {
      module1: 0,
      module2: 0,
      module3: 0,
      module4: 0
    };
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

// Export as default for compatibility
export default storeProxy;
