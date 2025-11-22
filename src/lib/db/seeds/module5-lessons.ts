import type { NewLesson } from '../schema';

/**
 * Module 5: Web Browser & Internet Navigation
 * 6 comprehensive lessons covering web browsing fundamentals
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
        lessonType: 'browser',
        config: { action: 'new-tab' },
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
        lessonType: 'browser',
        config: { action: 'navigate', targetUrl: 'news.gr' },
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
        lessonType: 'browser',
        config: { action: 'search', searchQuery: 'καιρός' },
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
        lessonType: 'browser',
        config: { action: 'switch-tabs', tabCount: 3 },
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
        lessonType: 'browser',
        config: { action: 'close-tab' },
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
        lessonType: 'browser',
        config: { action: 'bookmark', targetSite: 'gov.gr' },
        enabled: true,
        requiredLessonId: 'module5-lesson5'
    }
];
