import { json } from '@sveltejs/kit';
import { loginOrCreateUser } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { username } = await request.json();

        if (!username || typeof username !== 'string') {
            return json({ error: 'Username is required' }, { status: 400 });
        }

        // Login or create user
        const user = await loginOrCreateUser(username);

        // Set session cookie
        cookies.set('session', JSON.stringify(user), {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });

        return json({ success: true, user });
    } catch (error) {
        console.error('Login error:', error);
        return json(
            { error: error instanceof Error ? error.message : 'Login failed' },
            { status: 500 }
        );
    }
};
