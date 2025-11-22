import type { NewLesson } from '../schema';

/**
 * Module 5: Web Browser & Internet Navigation
 * Refactored to use desktop-simulation
 */
export const module5Lessons: NewLesson[] = [
    // Lesson 1: Opening Browser & New Tabs
    {
        id: 'module5-lesson1',
        moduleId: 'module5',
        lessonKey: 'new-tab',
        titleKey: 'module5_lesson1_title',
        descriptionKey: 'module5_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'new-tab',
            initialApps: ['browser']
        },
        enabled: true,
        requiredLessonId: null
    },

    // Lesson 2: Address Bar Navigation
    {
        id: 'module5-lesson2',
        moduleId: 'module5',
        lessonKey: 'address-bar',
        titleKey: 'module5_lesson2_title',
        descriptionKey: 'module5_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'navigate',
            targetUrl: 'news',
            initialApps: ['browser']
        },
        enabled: true,
        requiredLessonId: 'module5-lesson1'
    },

    // Lesson 3: Search Using Google
    {
        id: 'module5-lesson3',
        moduleId: 'module5',
        lessonKey: 'search-google',
        titleKey: 'module5_lesson3_title',
        descriptionKey: 'module5_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'search',
            initialApps: ['browser']
        },
        enabled: true,
        requiredLessonId: 'module5-lesson2'
    },

    // Lesson 4: Switching Between Tabs
    {
        id: 'module5-lesson4',
        moduleId: 'module5',
        lessonKey: 'switch-tabs',
        titleKey: 'module5_lesson4_title',
        descriptionKey: 'module5_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'switch-tab',
            initialApps: ['browser']
        },
        enabled: true,
        requiredLessonId: 'module5-lesson3'
    },

    // Lesson 5: Closing Tabs
    {
        id: 'module5-lesson5',
        moduleId: 'module5',
        lessonKey: 'close-tabs',
        titleKey: 'module5_lesson5_title',
        descriptionKey: 'module5_lesson5_desc',
        difficulty: 'beginner',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'close-tab',
            initialApps: ['browser']
        },
        enabled: true,
        requiredLessonId: 'module5-lesson4'
    },

    // Lesson 6: Bookmarks & Favorites
    {
        id: 'module5-lesson6',
        moduleId: 'module5',
        lessonKey: 'bookmarks',
        titleKey: 'module5_lesson6_title',
        descriptionKey: 'module5_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'bookmark',
            targetSite: 'gov',
            initialApps: ['browser']
        },
        enabled: true,
        requiredLessonId: 'module5-lesson5'
    }
];
