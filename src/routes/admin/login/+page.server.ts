import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ADMIN_PASSWORD } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.admin) {
        throw redirect(302, '/admin');
    }
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const password = data.get('password');

        if (!ADMIN_PASSWORD) {
            console.error('ADMIN_PASSWORD is not set in environment variables');
            return fail(500, { error: 'Server configuration error' });
        }

        if (password !== ADMIN_PASSWORD) {
            return fail(401, { error: 'Invalid password' });
        }

        // Set admin session cookie
        cookies.set('admin_session', 'true', {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        });

        throw redirect(302, '/admin');
    }
};
