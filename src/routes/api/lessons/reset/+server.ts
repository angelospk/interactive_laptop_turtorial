import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, userProgress } from '$lib/db/client';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals }) => {
    // Authentication check
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { user } = locals;

    try {
        // Delete all progress for this user
        await db.delete(userProgress).where(eq(userProgress.userId, user.id)).run();

        return json({
            success: true,
            message: 'Progress reset successfully'
        });
    } catch (err) {
        console.error('Error resetting progress:', err);
        throw error(500, 'Failed to reset progress');
    }
};
