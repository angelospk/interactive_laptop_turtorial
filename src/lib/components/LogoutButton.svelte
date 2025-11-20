<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			// Force reload to clear state and go to login
			window.location.href = '/login';
		} catch (error) {
			console.error('Logout failed:', error);
			// Fallback redirect
			window.location.href = '/login';
		}
	}
</script>

<Button
	variant="ghost"
	onclick={handleLogout}
	class="text-red-600 hover:bg-red-50 hover:text-red-700"
>
	{m.logout ? m.logout() : 'Αποσύνδεση'}
</Button>
