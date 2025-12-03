import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, users, userProgress, lessons } from '$lib/db/client';
import { count, eq, and, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    // Check admin authentication
    if (!locals.admin) {
        throw error(403, 'Unauthorized: Admin access required');
    }

    // Get total users count
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get all lessons for reference
    const allLessons = await db.select().from(lessons);
    const totalLessons = allLessons.length;

    // Get all completed lessons count
    const completedLessonsResult = await db
        .select({ count: count() })
        .from(userProgress)
        .where(eq(userProgress.completed, true));
    const totalCompletedLessons = completedLessonsResult[0]?.count || 0;

    // Calculate overall completion percentage
    const overallCompletionRate = totalUsers > 0 && totalLessons > 0
        ? ((totalCompletedLessons / (totalUsers * totalLessons)) * 100).toFixed(1)
        : '0.0';

    // Get per-module statistics
    const moduleStats = await db
        .select({
            moduleId: lessons.moduleId,
            totalLessons: count(lessons.id),
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

    // Get user engagement stats
    const userEngagementStats = await db
        .select({
            userId: userProgress.userId,
            completedLessons: sql<number>`COUNT(CASE WHEN ${userProgress.completed} = 1 THEN 1 END)`,
            totalAttempts: sql<number>`SUM(${userProgress.attempts})`,
            avgScore: sql<number>`AVG(${userProgress.score})`,
        })
        .from(userProgress)
        .groupBy(userProgress.userId);

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
