import { describe, it, expect, beforeEach } from 'vitest';
import { lessons, users, userProgress, DEVICE_VALUES, type NewLesson } from '../schema';
import { allLessons, module1Lessons } from '../seeds';
import { eq, and } from 'drizzle-orm';
import { createTestDb, type TestDb } from './testDb';

describe('Database Schema - Lessons Table', () => {
    let db: TestDb;

    beforeEach(async () => {
        db = await createTestDb();
    });

    it('should insert lesson with all new fields', async () => {
        const lesson: NewLesson = {
            id: 'test-lesson-1',
            moduleId: 'module1',
            lessonKey: 'hover-basic',
            titleKey: 'module1_lesson1_title',
            descriptionKey: 'module1_lesson1_desc',
            difficulty: 'beginner',
            orderIndex: 1,
            lessonType: 'hover',
            config: { targetCount: 5, timeLimit: 30 },
            enabled: true,
            requiredLessonId: null
        };

        await db.insert(lessons).values(lesson).run();

        const result = await db.select().from(lessons).where(eq(lessons.id, 'test-lesson-1')).get();

        expect(result).toBeDefined();
        expect(result?.lessonType).toBe('hover');
        expect(result?.config).toEqual({ targetCount: 5, timeLimit: 30 });
        expect(result?.enabled).toBe(true);
        expect(result?.requiredLessonId).toBeNull();
    });

    it('should enforce unique constraint on (moduleId, lessonKey)', async () => {
        const lesson1: NewLesson = {
            id: 'test-lesson-1',
            moduleId: 'module1',
            lessonKey: 'hover-basic',
            titleKey: 'module1_lesson1_title',
            descriptionKey: 'module1_lesson1_desc',
            difficulty: 'beginner',
            orderIndex: 1,
            lessonType: 'hover',
            config: null,
            enabled: true,
            requiredLessonId: null
        };

        const lesson2: NewLesson = {
            id: 'test-lesson-2',
            moduleId: 'module1',
            lessonKey: 'hover-basic', // Same lessonKey
            titleKey: 'module1_lesson2_title',
            descriptionKey: 'module1_lesson2_desc',
            difficulty: 'beginner',
            orderIndex: 2,
            lessonType: 'hover',
            config: null,
            enabled: true,
            requiredLessonId: null
        };

        await db.insert(lessons).values(lesson1).run();

        // libsql wraps the driver error, so the "UNIQUE constraint failed" text
        // lives on the cause rather than the top-level message.
        let caught: unknown;
        try {
            await db.insert(lessons).values(lesson2).run();
        } catch (e) {
            caught = e;
        }
        expect(caught).toBeDefined();
        const text = `${(caught as Error)?.message ?? ''} ${String((caught as { cause?: unknown })?.cause ?? '')}`;
        expect(text).toMatch(/UNIQUE constraint failed/);
    });

    it('should allow same lessonKey in different modules', async () => {
        const lesson1: NewLesson = {
            id: 'test-lesson-1',
            moduleId: 'module1',
            lessonKey: 'hover-basic',
            titleKey: 'module1_lesson1_title',
            descriptionKey: 'module1_lesson1_desc',
            difficulty: 'beginner',
            orderIndex: 1,
            lessonType: 'hover',
            config: null,
            enabled: true,
            requiredLessonId: null
        };

        const lesson2: NewLesson = {
            id: 'test-lesson-2',
            moduleId: 'module2', // Different module
            lessonKey: 'hover-basic', // Same lessonKey
            titleKey: 'module2_lesson1_title',
            descriptionKey: 'module2_lesson1_desc',
            difficulty: 'beginner',
            orderIndex: 1,
            lessonType: 'hover',
            config: null,
            enabled: true,
            requiredLessonId: null
        };

        await db.insert(lessons).values(lesson1).run();
        await db.insert(lessons).values(lesson2).run();

        const results = await db.select().from(lessons).all();
        expect(results).toHaveLength(2);
    });

    it('should handle foreign key constraint on requiredLessonId', async () => {
        const lesson1: NewLesson = {
            id: 'test-lesson-1',
            moduleId: 'module1',
            lessonKey: 'hover-basic',
            titleKey: 'module1_lesson1_title',
            descriptionKey: 'module1_lesson1_desc',
            difficulty: 'beginner',
            orderIndex: 1,
            lessonType: 'hover',
            config: null,
            enabled: true,
            requiredLessonId: null
        };

        const lesson2: NewLesson = {
            id: 'test-lesson-2',
            moduleId: 'module1',
            lessonKey: 'click-basic',
            titleKey: 'module1_lesson2_title',
            descriptionKey: 'module1_lesson2_desc',
            difficulty: 'beginner',
            orderIndex: 2,
            lessonType: 'click',
            config: null,
            enabled: true,
            requiredLessonId: 'test-lesson-1' // References lesson1
        };

        await db.insert(lessons).values(lesson1).run();
        await db.insert(lessons).values(lesson2).run();

        const result = await db.select().from(lessons).where(eq(lessons.id, 'test-lesson-2')).get();
        expect(result?.requiredLessonId).toBe('test-lesson-1');
    });

    it('should default preferredDevice to null and round-trip each device value', async () => {
        await db.insert(users).values({ id: 'u-null', username: 'anna' }).run();
        const noPref = await db.select().from(users).where(eq(users.id, 'u-null')).get();
        expect(noPref?.preferredDevice).toBeNull();

        for (const device of DEVICE_VALUES) {
            const id = `u-${device}`;
            await db
                .insert(users)
                .values({ id, username: `user-${device}`, preferredDevice: device })
                .run();
            const row = await db.select().from(users).where(eq(users.id, id)).get();
            expect(row?.preferredDevice).toBe(device);
        }
    });

    it('should filter lessons by enabled status', async () => {
        const lesson1: NewLesson = {
            id: 'test-lesson-1',
            moduleId: 'module1',
            lessonKey: 'hover-basic',
            titleKey: 'module1_lesson1_title',
            descriptionKey: 'module1_lesson1_desc',
            difficulty: 'beginner',
            orderIndex: 1,
            lessonType: 'hover',
            config: null,
            enabled: true,
            requiredLessonId: null
        };

        const lesson2: NewLesson = {
            id: 'test-lesson-2',
            moduleId: 'module1',
            lessonKey: 'click-basic',
            titleKey: 'module1_lesson2_title',
            descriptionKey: 'module1_lesson2_desc',
            difficulty: 'beginner',
            orderIndex: 2,
            lessonType: 'click',
            config: null,
            enabled: false, // Disabled
            requiredLessonId: null
        };

        await db.insert(lessons).values([lesson1, lesson2]).run();

        const enabledLessons = await db
            .select()
            .from(lessons)
            .where(and(eq(lessons.moduleId, 'module1'), eq(lessons.enabled, true)))
            .all();

        expect(enabledLessons).toHaveLength(1);
        expect(enabledLessons[0].id).toBe('test-lesson-1');
    });
});

describe('Database Schema - Seed Data', () => {
    it('should have correct total lessons in seed data', () => {
        expect(allLessons.length).toBeGreaterThan(0);
        // Smoke check: no duplicate IDs
        const ids = new Set(allLessons.map((l) => l.id));
        expect(ids.size).toBe(allLessons.length);
    });

    it('should have Module 1 lessons with sequential order indexes', () => {
        const orderIndexes = module1Lessons.map((l) => l.orderIndex).sort((a, b) => a - b);
        const expected = Array.from({ length: module1Lessons.length }, (_, i) => i + 1);
        expect(orderIndexes).toEqual(expected);
    });

    it('should have valid lesson types', () => {
        const validTypes = new Set([
            'hover',
            'click',
            'double-click',
            'drag',
            'right-click',
            'scroll',
            'typing',
            'keyboard-action',
            'legacy-module-3',
            'legacy-module-4',
            'desktop-simulation',
            'browser',
            'quiz',
            'scam-spotter',
            'reading',
            'mobile-tap',
            'mobile-sim'
        ]);

        allLessons.forEach((lesson) => {
            expect(validTypes.has(lesson.lessonType), `Unknown lessonType: ${lesson.lessonType}`).toBe(true);
        });
    });

    it('should have valid difficulty levels', () => {
        const validDifficulties = ['beginner', 'intermediate', 'advanced'];

        allLessons.forEach((lesson) => {
            expect(validDifficulties).toContain(lesson.difficulty);
        });
    });

    it('should have unique IDs across all lessons', () => {
        const ids = allLessons.map((l) => l.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(allLessons.length);
    });

    it('should have unique (moduleId, lessonKey) combinations', () => {
        const combinations = allLessons.map((l) => `${l.moduleId}-${l.lessonKey}`);
        const uniqueCombinations = new Set(combinations);
        expect(uniqueCombinations.size).toBe(allLessons.length);
    });

    it('should have valid i18n keys', () => {
        // 'reading' lessons are seeded from the content manifest and display their
        // title/description text directly (not through i18n message keys), so the
        // key-format rules below only apply to interactive lessons.
        allLessons
            .filter((lesson) => lesson.lessonType !== 'reading')
            .forEach((lesson) => {
                // Keys must be non-empty strings without spaces
                expect(lesson.titleKey).toMatch(/^\S+$/);
                expect(lesson.titleKey).toContain('title');
                if (lesson.descriptionKey) {
                    expect(lesson.descriptionKey).toMatch(/^\S+$/);
                    expect(lesson.descriptionKey).toContain('desc');
                }
            });
    });

    it('should have first lesson without prerequisite', () => {
        const firstLessons = allLessons.filter((l) => l.orderIndex === 1);
        firstLessons.forEach((lesson) => {
            expect(lesson.requiredLessonId).toBeNull();
        });
    });

    it('should have valid prerequisite references', () => {
        allLessons.forEach((lesson) => {
            if (lesson.requiredLessonId) {
                const prerequisite = allLessons.find((l) => l.id === lesson.requiredLessonId);
                expect(prerequisite).toBeDefined();
                expect(prerequisite?.moduleId).toBe(lesson.moduleId); // Same module
            }
        });
    });
});
