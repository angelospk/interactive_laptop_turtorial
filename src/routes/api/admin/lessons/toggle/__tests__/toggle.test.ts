import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../+server';
import type { RequestEvent } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { lessons, type NewLesson } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

describe('POST /api/admin/lessons/toggle', () => {
    let db: ReturnType<typeof drizzle>;
    let sqlite: Database.Database;
    let testLessonId: string;

    beforeEach(() => {
        // Create in-memory database for testing
        sqlite = new Database(':memory:');
        db = drizzle(sqlite);

        // Create tables
        sqlite.exec(`
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
		`);

        // Insert test lesson
        testLessonId = 'module1-lesson1';
        const testLesson: NewLesson = {
            id: testLessonId,
            moduleId: 'module1',
            lessonKey: 'hover-basic',
            titleKey: 'module1_lesson1_title',
            descriptionKey: 'module1_lesson1_desc',
            difficulty: 'beginner',
            orderIndex: 1,
            lessonType: 'hover',
            config: { targetCount: 5, timeLimit: 30 },
            enabled: true,
            requiredLessonId: null,
            createdAt: new Date()
        };

        db.insert(lessons).values(testLesson).run();
    });

    it('should toggle lesson enabled status to false', async () => {
        const mockRequest = {
            json: async () => ({
                lessonId: testLessonId,
                enabled: false
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                admin: true,
                db
            }
        } as unknown as RequestEvent;

        const response = await POST(mockEvent);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.lesson.id).toBe(testLessonId);
        expect(data.lesson.enabled).toBe(false);

        // Verify database
        const lesson = db.select().from(lessons).where(eq(lessons.id, testLessonId)).get();
        expect(lesson?.enabled).toBe(false);
    });

    it('should toggle lesson enabled status to true', async () => {
        // First disable the lesson
        db.update(lessons).set({ enabled: false }).where(eq(lessons.id, testLessonId)).run();

        const mockRequest = {
            json: async () => ({
                lessonId: testLessonId,
                enabled: true
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                admin: true,
                db
            }
        } as unknown as RequestEvent;

        const response = await POST(mockEvent);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.lesson.enabled).toBe(true);

        // Verify database
        const lesson = db.select().from(lessons).where(eq(lessons.id, testLessonId)).get();
        expect(lesson?.enabled).toBe(true);
    });

    it('should return 401 if not admin', async () => {
        const mockRequest = {
            json: async () => ({
                lessonId: testLessonId,
                enabled: false
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                admin: false,
                db
            }
        } as unknown as RequestEvent;

        await expect(POST(mockEvent)).rejects.toMatchObject({
            status: 401
        });
    });

    it('should return 404 if lesson not found', async () => {
        const mockRequest = {
            json: async () => ({
                lessonId: 'non-existent-lesson',
                enabled: false
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                admin: true,
                db
            }
        } as unknown as RequestEvent;

        await expect(POST(mockEvent)).rejects.toMatchObject({
            status: 404
        });
    });

    it('should return 400 if enabled is not boolean', async () => {
        const mockRequest = {
            json: async () => ({
                lessonId: testLessonId,
                enabled: 'invalid' // Not a boolean
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                admin: true,
                db
            }
        } as unknown as RequestEvent;

        await expect(POST(mockEvent)).rejects.toMatchObject({
            status: 400
        });
    });
});
