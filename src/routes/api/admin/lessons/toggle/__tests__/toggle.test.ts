import { describe, it, expect, beforeEach, vi } from 'vitest';
import { lessons, type NewLesson } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { createTestDb, type TestDb } from '$lib/db/__tests__/testDb';

// This handler talks to the module-level `db` from $lib/db/client (not locals.db),
// so we mock that module to point at a fresh in-memory db per test. The getter is
// re-read on every access, so it always returns the current test db.
let currentDb: TestDb;
vi.mock('$lib/db/client', async () => {
    const schema = await import('$lib/db/schema');
    return {
        get db() {
            return currentDb;
        },
        ...schema
    };
});

const { POST } = await import('../+server');
type RequestEvent = import('@sveltejs/kit').RequestEvent;

describe('POST /api/admin/lessons/toggle', () => {
    let db: TestDb;
    let testLessonId: string;

    beforeEach(async () => {
        db = await createTestDb();
        currentDb = db;

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

        await db.insert(lessons).values(testLesson).run();
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
        const lesson = await db.select().from(lessons).where(eq(lessons.id, testLessonId)).get();
        expect(lesson?.enabled).toBe(false);
    });

    it('should toggle lesson enabled status to true', async () => {
        // First disable the lesson
        await db.update(lessons).set({ enabled: false }).where(eq(lessons.id, testLessonId)).run();

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
        const lesson = await db.select().from(lessons).where(eq(lessons.id, testLessonId)).get();
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
