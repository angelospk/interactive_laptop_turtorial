import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../+server';
import type { RequestEvent } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { lessons } from '$lib/db/schema';
import { allLessons } from '$lib/db/seeds';

describe('POST /api/admin/seed', () => {
    let db: ReturnType<typeof drizzle>;
    let sqlite: Database.Database;

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
    });

    it('should insert all lessons from seed data', async () => {
        const mockEvent = {
            locals: {
                admin: true,
                db
            }
        } as unknown as RequestEvent;

        const response = await POST(mockEvent);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.inserted).toBe(allLessons.length);
        expect(data.skipped).toBe(0);

        // Verify database
        const lessonsInDb = db.select().from(lessons).all();
        expect(lessonsInDb).toHaveLength(allLessons.length);
    });

    it('should skip already existing lessons', async () => {
        // Insert first 5 lessons
        for (let i = 0; i < 5; i++) {
            db.insert(lessons).values(allLessons[i]).run();
        }

        const mockEvent = {
            locals: {
                admin: true,
                db
            }
        } as unknown as RequestEvent;

        const response = await POST(mockEvent);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.inserted).toBe(allLessons.length - 5);
        expect(data.skipped).toBe(5);

        // Verify no duplicates
        const lessonsInDb = db.select().from(lessons).all();
        expect(lessonsInDb).toHaveLength(allLessons.length);
    });

    it('should return 401 if not admin', async () => {
        const mockEvent = {
            locals: {
                admin: false,
                db
            }
        } as unknown as RequestEvent;

        await expect(POST(mockEvent)).rejects.toMatchObject({
            status: 401
        });
    });

    it('should handle database errors gracefully', async () => {
        // Drop the table to simulate an error
        sqlite.exec('DROP TABLE lessons');

        const mockEvent = {
            locals: {
                admin: true,
                db
            }
        } as unknown as RequestEvent;

        await expect(POST(mockEvent)).rejects.toMatchObject({
            status: 500
        });
    });
});
