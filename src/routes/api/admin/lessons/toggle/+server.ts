import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lessons } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/admin/lessons/toggle
 * 
 * Toggles the enabled status of a lesson.
 * Requires admin authentication.
 */

export const POST: RequestHandler = async ({ request, locals }) => {
    // Admin authentication check
    if (!locals.admin) {
        throw error(401, 'Unauthorized');
    }

    const { db } = locals;

    try {
        // Parse request body
        const { lessonId, enabled } = await request.json();

        // Validate enabled is boolean
        if (typeof enabled !== 'boolean') {
            throw error(400, 'Invalid enabled value. Must be a boolean.');
        }

        // Check if lesson exists
        const existingLesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();

        if (!existingLesson) {
            throw error(404, 'Lesson not found');
        }

        // Update lesson
        const updatedLesson = await db
            .update(lessons)
            .set({ enabled })
            .where(eq(lessons.id, lessonId))
            .returning()
            .get();

        return json({
            success: true,
            lesson: updatedLesson
        });
    } catch (err) {
        // Re-throw SvelteKit errors
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }

        // Log unexpected errors
        console.error('Error toggling lesson:', err);
        throw error(500, 'Failed to toggle lesson');
    }
};
