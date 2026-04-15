import 'dotenv/config';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleLibSQL } from 'drizzle-orm/libsql';
import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Check if we're in production (Vercel)
const isProduction = process.env.NODE_ENV === 'production';

// Create database connection based on environment
const env = {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN
};

/**
 * Helper to validate Turso URL
 * Checks if the URL uses libsql: or https: protocol
 */
function isValidTursoUrl(url: string | undefined): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'libsql:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

// Use Turso if credentials are valid, otherwise use local SQLite
let dbInstance;

console.log('Debug Env:', {
    url: env.TURSO_DATABASE_URL ? 'Set' : 'Unset',
    token: env.TURSO_AUTH_TOKEN ? 'Set' : 'Unset',
    validUrl: isValidTursoUrl(env.TURSO_DATABASE_URL)
});

if (env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN && isValidTursoUrl(env.TURSO_DATABASE_URL)) {
    try {
        dbInstance = createClient({
            url: env.TURSO_DATABASE_URL,
            authToken: env.TURSO_AUTH_TOKEN
        });
        console.log('✅ Using Turso database:', env.TURSO_DATABASE_URL);
    } catch (error) {
        console.warn('⚠️ Turso connection failed, falling back to local SQLite:', error);
        dbInstance = new Database('local.db');
    }
} else {
    console.log('✅ Using local SQLite database: local.db');
    dbInstance = new Database('local.db');
}

// Determine which drizzle function to use and create db
export const db = dbInstance instanceof Database
    ? drizzleSQLite(dbInstance, { schema })
    : drizzleLibSQL(dbInstance, { schema });

export { modules, users, lessons, userProgress, lessonViews, type Module, type NewModule, type User, type NewUser, type Lesson, type NewLesson, type UserProgress, type NewUserProgress, type LessonView, type NewLessonView } from './schema';
