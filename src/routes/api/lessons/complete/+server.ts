import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/client';
import { lessons, userProgress } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/lessons/complete
 * 
 * Saves lesson completion progress for the authenticated user.
 * Validates lesson existence to prevent foreign key violations.
 * Calculates stars based on score: 0-33: 1★, 34-66: 2★, 67-100: 3★
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    // Authentication check
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { user } = locals;

    try {
        // Parse request body
        const { lessonId, score } = await request.json();

        // Validate score range
        if (typeof score !== 'number' || score < 0 || score > 100) {
            throw error(400, 'Invalid score. Score must be between 0 and 100.');
        }

        // CRITICAL: Validate lesson exists (prevents foreign key violations)
        const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).get();

        if (!lesson) {
            throw error(404, 'Lesson not found');
        }

        // Calculate stars from score
        const stars = score <= 33 ? 1 : score <= 66 ? 2 : 3;

        // Check if progress record already exists
        const existingProgress = await db
            .select()
            .from(userProgress)
            .where(and(eq(userProgress.userId, user.id), eq(userProgress.lessonId, lessonId)))
            .get();

        const now = new Date();

        let savedProgress;

        if (existingProgress) {
            // Update existing record
            savedProgress = await db
                .update(userProgress)
                .set({
                    completed: true,
                    completedAt: now,
                    score,
                    stars,
                    attempts: existingProgress.attempts + 1,
                    lastAttemptAt: now
                })
                .where(eq(userProgress.id, existingProgress.id))
                .returning()
                .get();
        } else {
            // Insert new record
            savedProgress = await db
                .insert(userProgress)
                .values({
                    id: crypto.randomUUID(),
                    userId: user.id,
                    lessonId,
                    completed: true,
                    completedAt: now,
                    score,
                    stars,
                    attempts: 1,
                    lastAttemptAt: now
                })
                .returning()
                .get();
        }

        return json({
            success: true,
            progress: savedProgress
        });
    } catch (err) {
        // Re-throw SvelteKit errors
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }

        // Log unexpected errors
        console.error('Error saving lesson progress:', err);
        throw error(500, 'Failed to save lesson progress');
    }
};
