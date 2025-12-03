import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, users, userProgress, lessons } from '$lib/db/client';
import { eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    // Check admin authentication
    if (!locals.admin) {
        throw error(403, 'Unauthorized: Admin access required');
    }

    // Get total users count
    const totalUsersResult = await db.select({ value: sql<number>`COUNT(*)` }).from(users);
    const totalUsers = totalUsersResult[0]?.value || 0;

    // Get all lessons for reference
    const allLessons = await db.select().from(lessons);
    const totalLessons = allLessons.length;

    // Get all completed lessons count
    const completedLessonsResult = await db
        .select({ value: sql<number>`COUNT(*)` })
        .from(userProgress)
        .where(eq(userProgress.completed, true));
    const totalCompletedLessons = completedLessonsResult[0]?.value || 0;

    // Calculate overall completion percentage
    const overallCompletionRate = totalUsers > 0 && totalLessons > 0
        ? ((totalCompletedLessons / (totalUsers * totalLessons)) * 100).toFixed(1)
        : '0.0';

    // Get per-module statistics
    const moduleStats = await db
        .select({
            moduleId: lessons.moduleId,
            totalLessons: sql<number>`COUNT(DISTINCT ${lessons.id})`,
            completedCount: sql<number>`SUM(CASE WHEN ${userProgress.completed} = 1 THEN 1 ELSE 0 END)`,
        })
        .from(lessons)
        .leftJoin(userProgress, eq(lessons.id, userProgress.lessonId))
        .groupBy(lessons.moduleId)
        .orderBy(lessons.moduleId);

    // Get per-lesson completion stats
    const lessonStats = await db
        .select({
            lessonId: lessons.id,
            moduleId: lessons.moduleId,
            titleKey: lessons.titleKey,
            orderIndex: lessons.orderIndex,
            enabled: lessons.enabled,
            totalCompletions: sql<number>`COUNT(CASE WHEN ${userProgress.completed} = 1 THEN 1 END)`,
            totalAttempts: sql<number>`SUM(COALESCE(${userProgress.attempts}, 0))`,
            avgScore: sql<number>`AVG(CASE WHEN ${userProgress.score} IS NOT NULL THEN ${userProgress.score} ELSE NULL END)`,
        })
        .from(lessons)
        .leftJoin(userProgress, eq(lessons.id, userProgress.lessonId))
        .groupBy(lessons.id, lessons.moduleId, lessons.titleKey, lessons.orderIndex, lessons.enabled)
        .orderBy(lessons.moduleId, lessons.orderIndex);

    // Get user engagement stats with user details
    const userEngagementStats = await db
        .select({
            userId: userProgress.userId,
            username: users.username,
            displayName: users.displayName,
            completedLessons: sql<number>`COUNT(CASE WHEN ${userProgress.completed} = 1 THEN 1 END)`,
            totalAttempts: sql<number>`SUM(${userProgress.attempts})`,
            avgScore: sql<number>`AVG(${userProgress.score})`,
        })
        .from(userProgress)
        .innerJoin(users, eq(userProgress.userId, users.id))
        .groupBy(userProgress.userId, users.username, users.displayName)
        .orderBy(sql`COUNT(CASE WHEN ${userProgress.completed} = 1 THEN 1 END) DESC`);

    return {
        totalUsers,
        totalLessons,
        totalCompletedLessons,
        overallCompletionRate,
        moduleStats,
        lessonStats,
        userEngagementStats,
    };
};
