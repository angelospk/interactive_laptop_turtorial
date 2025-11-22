import { describe, it, expect } from 'vitest';
import { getModuleProgress, isLessonLocked } from '../progress';
import type { Lesson } from '$lib/db/schema';

describe('Progress Utils', () => {
    describe('getModuleProgress', () => {
        it('should return 0 if no lessons', () => {
            expect(getModuleProgress('module1', {}, {})).toBe(0);
        });

        it('should calculate percentage correctly', () => {
            const moduleLessonIds = {
                module1: ['l1', 'l2', 'l3', 'l4']
            };
            const userProgress = {
                l1: { completed: true },
                l2: { completed: true }
            };
            // 2/4 = 50%
            expect(getModuleProgress('module1', moduleLessonIds, userProgress)).toBe(50);
        });

        it('should handle missing progress', () => {
            const moduleLessonIds = {
                module1: ['l1', 'l2']
            };
            expect(getModuleProgress('module1', moduleLessonIds, {})).toBe(0);
        });

        it('should round to nearest integer', () => {
            const moduleLessonIds = {
                module1: ['l1', 'l2', 'l3']
            };
            const userProgress = {
                l1: { completed: true }
            };
            // 1/3 = 33.33% -> 33%
            expect(getModuleProgress('module1', moduleLessonIds, userProgress)).toBe(33);
        });
    });

    describe('isLessonLocked', () => {
        const mockLessons: Lesson[] = [
            { id: 'l1', orderIndex: 0, requiredLessonId: null } as Lesson,
            { id: 'l2', orderIndex: 1, requiredLessonId: null } as Lesson,
            { id: 'l3', orderIndex: 2, requiredLessonId: 'l1' } as Lesson // Explicit requirement
        ];

        it('should unlock first lesson by default', () => {
            expect(isLessonLocked(0, mockLessons[0], mockLessons, {})).toBe(false);
        });

        it('should lock second lesson if first is incomplete (sequential)', () => {
            expect(isLessonLocked(1, mockLessons[1], mockLessons, {})).toBe(true);
        });

        it('should unlock second lesson if first is complete (sequential)', () => {
            const progress = { l1: { completed: true } };
            expect(isLessonLocked(1, mockLessons[1], mockLessons, progress)).toBe(false);
        });

        it('should lock lesson with explicit requirement if requirement incomplete', () => {
            // l3 requires l1
            expect(isLessonLocked(2, mockLessons[2], mockLessons, {})).toBe(true);
        });

        it('should unlock lesson with explicit requirement if requirement complete', () => {
            // l3 requires l1. Even if l2 is incomplete, l3 should unlock if l1 is done?
            // The function checks requiredLessonId FIRST.
            const progress = { l1: { completed: true } };
            expect(isLessonLocked(2, mockLessons[2], mockLessons, progress)).toBe(false);
        });
    });
});
