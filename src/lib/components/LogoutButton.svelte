<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import { LogOut } from '@lucide/svelte';

	// It used to be a ghost button whose only cue was red text, sitting among the
	// navigation links. Learners looking to sign out could not find it, so it now
	// looks like a button, carries an icon, and meets the 48px target everything
	// else in the elder-facing UI is held to.
	let failed = $state(false);
	let busy = $state(false);

	async function logout() {
		busy = true;
		failed = false;
		try {
			const res = await fetch('/api/auth/logout', { method: 'POST' });
			if (!res.ok) throw new Error(`logout failed: ${res.status}`);
			// Full reload, so no stale user state survives the sign-out.
			window.location.href = '/login';
		} catch (error) {
			// Landing on /login while the session cookie is still valid would look
			// like a sign-out without being one — on a shared computer that matters.
			console.error('Logout failed:', error);
			failed = true;
			busy = false;
		}
	}
</script>

<div class="flex flex-col items-end gap-1">
	<Button
		variant="outline"
		onclick={logout}
		disabled={busy}
		class="h-12 gap-2 rounded-full border-red-200 px-5 text-base text-red-700 hover:bg-red-50 hover:text-red-800"
	>
		<LogOut class="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
		{m.logout ? m.logout() : 'Αποσύνδεση'}
	</Button>

	{#if failed}
		<p class="text-sm font-medium text-red-700" role="alert">
			Η αποσύνδεση δεν ολοκληρώθηκε. Δοκιμάστε ξανά.
		</p>
	{/if}
</div>
