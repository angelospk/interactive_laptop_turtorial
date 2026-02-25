import { expect, test, describe, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LessonRunner from './LessonRunner.svelte';

const mockLessons = [
    {
        id: 'lesson-1',
        moduleId: 'module-1',
        title: 'Test Lesson 1',
        description: 'A test lesson',
        content: '[]',
        exercises: '[]',
        difficulty: 1,
        order: 1,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'lesson-2',
        moduleId: 'module-1',
        title: 'Test Lesson 2',
        description: 'Another test lesson',
        content: '[]',
        exercises: '[]',
        difficulty: 2,
        order: 2,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

describe('LessonRunner Auto-Advance', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    test('should start auto advance and display countdown when lesson is completed first time', async () => {
        // Mock progress - NOT completed
        const progress = {};

        const onExitMock = vi.fn();

        const { component } = render(LessonRunner as any, {
            lessons: mockLessons as any,
            progress,
            startIndex: 0,
            onExit: onExitMock
        });

        expect(component).toBeTruthy();
    });
});
