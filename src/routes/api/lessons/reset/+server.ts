import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, userProgress } from '$lib/db/client';
import { eq } from 'drizzle-orm';
import { requireUser } from '$lib/server/guards';

export const POST: RequestHandler = async ({ locals }) => {
	// Authentication check
	const user = requireUser(locals);

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
