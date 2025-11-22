import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { lessons, users, userProgress, type NewLesson } from '../schema';
import { allLessons, module1Lessons } from '../seeds';
import { eq, and } from 'drizzle-orm';

describe('Database Schema - Lessons Table', () => {
    let db: ReturnType<typeof drizzle>;
    let sqlite: Database.Database;

    beforeEach(() => {
        // Create in-memory database for testing
        sqlite = new Database(':memory:');
        db = drizzle(sqlite);

        // Create tables
        sqlite.exec(`
			CREATE TABLE users (
				id TEXT PRIMARY KEY,
				username TEXT UNIQUE NOT NULL,
				display_name TEXT,
				created_at INTEGER NOT NULL,
				last_login INTEGER
			);

			CREATE TABLE lessons (
				id TEXT PRIMARY KEY,
				module_id TEXT NOT NULL,
				lesson_key TEXT NOT NULL,
				title_key TEXT NOT NULL,
				description_key TEXT,
				difficulty TEXT NOT NULL CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
				order_index INTEGER NOT NULL,
				lesson_type TEXT NOT NULL,
				config TEXT,
				enabled INTEGER NOT NULL DEFAULT 1,
				required_lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL,
				created_at INTEGER NOT NULL,
				UNIQUE(module_id, lesson_key)
			);

			CREATE TABLE user_progress (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
				completed INTEGER NOT NULL DEFAULT 0,
				completed_at INTEGER,
				score INTEGER,
				stars INTEGER,
				attempts INTEGER NOT NULL DEFAULT 0,
				last_attempt_at INTEGER,
				UNIQUE(user_id, lesson_id)
			);
		`);
    });

    it('should insert lesson with all new fields', () => {
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

        db.insert(lessons).values(lesson).run();

        const result = db.select().from(lessons).where(eq(lessons.id, 'test-lesson-1')).get();

        expect(result).toBeDefined();
        expect(result?.lessonType).toBe('hover');
        expect(result?.config).toEqual({ targetCount: 5, timeLimit: 30 });
        expect(result?.enabled).toBe(true);
        expect(result?.requiredLessonId).toBeNull();
    });

    it('should enforce unique constraint on (moduleId, lessonKey)', () => {
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

        db.insert(lessons).values(lesson1).run();

        expect(() => {
            db.insert(lessons).values(lesson2).run();
        }).toThrow(/UNIQUE constraint failed/);
    });

    it('should allow same lessonKey in different modules', () => {
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

        db.insert(lessons).values(lesson1).run();
        db.insert(lessons).values(lesson2).run();

        const results = db.select().from(lessons).all();
        expect(results).toHaveLength(2);
    });

    it('should handle foreign key constraint on requiredLessonId', () => {
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

        db.insert(lessons).values(lesson1).run();
        db.insert(lessons).values(lesson2).run();

        const result = db.select().from(lessons).where(eq(lessons.id, 'test-lesson-2')).get();
        expect(result?.requiredLessonId).toBe('test-lesson-1');
    });

    it('should filter lessons by enabled status', () => {
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

        db.insert(lessons).values([lesson1, lesson2]).run();

        const enabledLessons = db
            .select()
            .from(lessons)
            .where(and(eq(lessons.moduleId, 'module1'), eq(lessons.enabled, true)))
            .all();

        expect(enabledLessons).toHaveLength(1);
        expect(enabledLessons[0].id).toBe('test-lesson-1');
    });
});

describe('Database Schema - Seed Data', () => {
    it('should have 24 total lessons in seed data', () => {
        expect(allLessons).toHaveLength(24);
    });

    it('should have 11 Module 1 lessons', () => {
        expect(module1Lessons).toHaveLength(11);
    });

    it('should have sequential order indexes in Module 1', () => {
        const orderIndexes = module1Lessons.map((l) => l.orderIndex).sort((a, b) => a - b);
        expect(orderIndexes).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it('should have valid lesson types', () => {
        const validTypes = [
            'hover',
            'click',
            'double-click',
            'drag',
            'right-click',
            'scroll',
            'typing',
            'keyboard-action',
            'legacy-module-3',
            'legacy-module-4'
        ];

        allLessons.forEach((lesson) => {
            expect(validTypes).toContain(lesson.lessonType);
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
        allLessons.forEach((lesson) => {
            expect(lesson.titleKey).toMatch(/^module\d+_lesson\d+_title$/);
            expect(lesson.descriptionKey).toMatch(/^module\d+_lesson\d+_desc$/);
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
