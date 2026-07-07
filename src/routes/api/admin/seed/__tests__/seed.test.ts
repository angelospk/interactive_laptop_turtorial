import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../+server';
import type { RequestEvent } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { lessons } from '$lib/db/schema';
import { allLessons } from '$lib/db/seeds';
import { createTestDb, type TestDb } from '$lib/db/__tests__/testDb';

describe('POST /api/admin/seed', () => {
    let db: TestDb;

    beforeEach(async () => {
        db = await createTestDb();
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
        const lessonsInDb = await db.select().from(lessons).all();
        expect(lessonsInDb).toHaveLength(allLessons.length);
    });

    it('should skip already existing lessons', async () => {
        // Insert first 5 lessons
        for (let i = 0; i < 5; i++) {
            await db.insert(lessons).values(allLessons[i]).run();
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
        const lessonsInDb = await db.select().from(lessons).all();
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
        await db.run(sql`DROP TABLE lessons`);

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
