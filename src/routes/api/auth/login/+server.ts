import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { loginOrCreateUser } from '$lib/server/auth';
import { signSessionCookie } from '$lib/server/session';
import { getSessionSecret } from '$lib/server/sessionSecret';
import type { RequestHandler } from './$types';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { username } = await request.json();

        if (!username || typeof username !== 'string') {
            return json({ error: 'Username is required' }, { status: 400 });
        }

        // Login or create user
        const user = await loginOrCreateUser(username);

        // Set signed session cookie (HMAC — tamper-proof, cannot forge isAdmin)
        cookies.set('session', signSessionCookie(user, getSessionSecret(), SESSION_MAX_AGE), {
            path: '/',
            httpOnly: true,
            secure: !dev,
            sameSite: 'strict',
            maxAge: SESSION_MAX_AGE
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
