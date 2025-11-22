import { db, users, type User, type NewUser } from '$lib/db/client';
import { eq } from 'drizzle-orm';
import type { UserSession } from '$lib/types';

/**
 * Simple username-based authentication
 * Users are auto-created on first login
 */

export async function createUser(username: string, displayName?: string): Promise<User> {
    const [user] = await db
        .insert(users)
        .values({
            username,
            displayName: displayName || username,
            lastLogin: new Date()
        })
        .returning();

    return user;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
}

export async function updateLastLogin(userId: string): Promise<void> {
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, userId));
}

export async function loginOrCreateUser(username: string): Promise<UserSession> {
    // Validate username
    const sanitized = username.trim().toLowerCase();
    if (!sanitized || sanitized.length < 2) {
        throw new Error('Username must be at least 2 characters');
    }

    // Find or create user
    let user = await getUserByUsername(sanitized);

    if (!user) {
        user = await createUser(sanitized, sanitized);
    } else {
        await updateLastLogin(user.id);
    }

    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName || undefined,
        lastLogin: user.lastLogin || undefined,
        isAdmin: user.isAdmin || false
    };
}

export async function getUserById(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user;
}
