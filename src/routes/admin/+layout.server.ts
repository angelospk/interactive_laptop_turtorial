import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    // Skip check for login page to avoid redirect loop
    if (url.pathname === '/admin/login') {
        return {
            user: locals.user,
            isAdmin: locals.admin || false
        };
    }

    // Check if user is admin (either via user record or admin session cookie)
    if (!locals.admin) {
        // If not admin, redirect to admin login
        throw redirect(302, '/admin/login');
    }

    return {
        user: locals.user,
        isAdmin: true
    };
};
