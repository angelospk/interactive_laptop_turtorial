import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lessons } from '$lib/db/schema';
import { allLessons } from '$lib/db/seeds';
import { eq } from 'drizzle-orm';

/**
 * POST /api/admin/seed
 * 
 * Seeds the database with lesson data from seed files.
 * Skips lessons that already exist (by ID).
 * Requires admin authentication.
 */
export const POST: RequestHandler = async ({ locals }) => {
    // Admin authentication check
    if (!locals.admin) {
        throw error(401, 'Unauthorized');
    }

    const { db } = locals;

    try {
        let inserted = 0;
        let skipped = 0;

        // Process each lesson
        for (const lesson of allLessons) {
            // Check if lesson already exists
            const existing = await db.select().from(lessons).where(eq(lessons.id, lesson.id)).get();

            if (existing) {
                skipped++;
            } else {
                // Insert new lesson
                await db.insert(lessons).values(lesson).run();
                inserted++;
            }
        }

        return json({
            success: true,
            inserted,
            skipped,
            total: allLessons.length
        });
    } catch (err) {
        // Re-throw SvelteKit errors
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }

        // Log unexpected errors
        console.error('Error seeding database:', err);
        throw error(500, 'Failed to seed database');
    }
};
