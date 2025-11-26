import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/client';
import { userProgress } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/lessons/delete-progress
 * 
 * Deletes lesson progress for the authenticated user.
 * Used when user clicks "Try Again" to reset their progress.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    // Authentication check
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { user } = locals;

    try {
        // Parse request body
        const { lessonId } = await request.json();

        if (!lessonId) {
            throw error(400, 'Lesson ID is required');
        }

        // Delete the progress record
        await db
            .delete(userProgress)
            .where(and(eq(userProgress.userId, user.id), eq(userProgress.lessonId, lessonId)))
            .run();

        return json({
            success: true,
            message: 'Progress deleted successfully'
        });
    } catch (err) {
        // Re-throw SvelteKit errors
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }

        // Log unexpected errors
        console.error('Error deleting lesson progress:', err);
        throw error(500, 'Failed to delete lesson progress');
    }
};
