import { sqliteTable, text, integer, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table - simple username-based authentication
export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    username: text('username').unique().notNull(),
    displayName: text('display_name'),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
    lastLogin: integer('last_login', { mode: 'timestamp' }),
    isAdmin: integer('is_admin', { mode: 'boolean' }).default(false)
});

// Lessons table - dynamic lesson repository
export const lessons = sqliteTable('lessons', {
    id: text('id').primaryKey(),
    moduleId: text('module_id').notNull(), // module1, module2, etc.
    lessonKey: text('lesson_key').notNull(), // unique key for this lesson (e.g., 'hover-basic')
    titleKey: text('title_key').notNull(), // i18n message key
    descriptionKey: text('description_key'), // i18n message key
    difficulty: text('difficulty', { enum: ['beginner', 'intermediate', 'advanced'] }).notNull(),
    orderIndex: integer('order_index').notNull(),

    // NEW FIELDS for dynamic lesson system
    lessonType: text('lesson_type').notNull(), // 'hover', 'click', 'drag', 'legacy-module-3', etc.
    config: text('config', { mode: 'json' }), // JSON configuration for lesson-specific settings
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true), // Admin can disable lessons
    requiredLessonId: text('required_lesson_id').references((): any => lessons.id, { onDelete: 'set null' }), // Prerequisite lesson

    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date())
}, (table) => ({
    unq: unique().on(table.moduleId, table.lessonKey),
    moduleIdIdx: index('module_id_idx').on(table.moduleId),
    enabledIdx: index('enabled_idx').on(table.enabled),
    lessonTypeIdx: index('lesson_type_idx').on(table.lessonType)
}));

// User progress tracking - per user, per lesson
export const userProgress = sqliteTable('user_progress', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    score: integer('score'), // 0-100
    stars: integer('stars'), // 1-3
    attempts: integer('attempts').notNull().default(0),
    lastAttemptAt: integer('last_attempt_at', { mode: 'timestamp' })
}, (table) => ({
    unq: unique().on(table.userId, table.lessonId)
}));

// Lesson views - tracks when user first saw a lesson (for "NEW" badge)
export const lessonViews = sqliteTable('lesson_views', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    firstViewedAt: integer('first_viewed_at', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date())
}, (table) => ({
    unq: unique().on(table.userId, table.lessonId)
}));

// Types inferred from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

export type LessonView = typeof lessonViews.$inferSelect;
export type NewLessonView = typeof lessonViews.$inferInsert;
