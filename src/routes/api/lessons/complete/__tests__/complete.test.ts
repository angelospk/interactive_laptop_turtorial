import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../+server';
import type { RequestEvent } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { lessons, users, userProgress } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

describe('POST /api/lessons/complete', () => {
    let db: ReturnType<typeof drizzle>;
    let sqlite: Database.Database;
    let testUserId: string;
    let testLessonId: string;

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
				last_login INTEGER,
				is_admin INTEGER DEFAULT 0
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

        // Insert test user
        testUserId = crypto.randomUUID();
        db.insert(users)
            .values({
                id: testUserId,
                username: 'testuser',
                createdAt: new Date()
            })
            .run();

        // Insert test lesson
        testLessonId = 'module1-lesson1';
        db.insert(lessons)
            .values({
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
            })
            .run();
    });

    it('should save lesson completion with correct score and stars', async () => {
        const mockRequest = {
            json: vi.fn().mockResolvedValue({
                lessonId: testLessonId,
                score: 85
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                user: { id: testUserId, username: 'testuser' },
                db
            }
        } as unknown as RequestEvent;

        const response = await POST(mockEvent);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.progress.score).toBe(85);
        expect(data.progress.stars).toBe(3); // 85 is in 67-100 range
        expect(data.progress.completed).toBe(true);

        // Verify database
        const progress = db
            .select()
            .from(userProgress)
            .where(eq(userProgress.userId, testUserId))
            .get();

        expect(progress).toBeDefined();
        expect(progress?.score).toBe(85);
        expect(progress?.stars).toBe(3);
        expect(progress?.attempts).toBe(1);
    });

    it('should calculate 1 star for score 0-33', async () => {
        const mockRequest = {
            json: vi.fn().mockResolvedValue({
                lessonId: testLessonId,
                score: 25
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                user: { id: testUserId, username: 'testuser' },
                db
            }
        } as unknown as RequestEvent;

        const response = await POST(mockEvent);
        const data = await response.json();

        expect(data.progress.stars).toBe(1);
    });

    it('should calculate 2 stars for score 34-66', async () => {
        const mockRequest = {
            json: vi.fn().mockResolvedValue({
                lessonId: testLessonId,
                score: 50
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                user: { id: testUserId, username: 'testuser' },
                db
            }
        } as unknown as RequestEvent;

        const response = await POST(mockEvent);
        const data = await response.json();

        expect(data.progress.stars).toBe(2);
    });

    it('should update existing progress record', async () => {
        // Insert initial progress
        db.insert(userProgress)
            .values({
                id: crypto.randomUUID(),
                userId: testUserId,
                lessonId: testLessonId,
                completed: true,
                score: 60,
                stars: 2,
                attempts: 1,
                completedAt: new Date(),
                lastAttemptAt: new Date()
            })
            .run();

        const mockRequest = {
            json: vi.fn().mockResolvedValue({
                lessonId: testLessonId,
                score: 90
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                user: { id: testUserId, username: 'testuser' },
                db
            }
        } as unknown as RequestEvent;

        const response = await POST(mockEvent);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.progress.score).toBe(90);
        expect(data.progress.stars).toBe(3);
        expect(data.progress.attempts).toBe(2); // Incremented

        // Verify only one record exists
        const records = db.select().from(userProgress).all();
        expect(records).toHaveLength(1);
    });

    it('should return 401 if user not authenticated', async () => {
        const mockRequest = {
            json: vi.fn().mockResolvedValue({
                lessonId: testLessonId,
                score: 85
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                user: null,
                db
            }
        } as unknown as RequestEvent;

        await expect(POST(mockEvent)).rejects.toMatchObject({
            status: 401
        });
    });

    it('should return 404 if lesson does not exist', async () => {
        const mockRequest = {
            json: vi.fn().mockResolvedValue({
                lessonId: 'non-existent-lesson',
                score: 85
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                user: { id: testUserId, username: 'testuser' },
                db
            }
        } as unknown as RequestEvent;

        await expect(POST(mockEvent)).rejects.toMatchObject({
            status: 404
        });
    });

    it('should return 400 for invalid score', async () => {
        const mockRequest = {
            json: vi.fn().mockResolvedValue({
                lessonId: testLessonId,
                score: 150 // Invalid: > 100
            })
        } as unknown as Request;

        const mockEvent = {
            request: mockRequest,
            locals: {
                user: { id: testUserId, username: 'testuser' },
                db
            }
        } as unknown as RequestEvent;

        await expect(POST(mockEvent)).rejects.toMatchObject({
            status: 400
        });
    });
});
