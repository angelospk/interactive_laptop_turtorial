<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import { BookOpen } from '@lucide/svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import { safeRedirect } from '$lib/utils/redirect';

	let username = $state('');
	let loading = $state(false);

	async function handleLogin() {
		const trimmed = username.trim().toLowerCase();

		if (!trimmed || trimmed.length < 2) {
			toast.error(m.login_error_username_short());
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: trimmed })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || m.login_error_failed());
			}

			const data = await response.json();
			toast.success(m.welcome_user({ displayName: data.user.displayName || data.user.username }));

			// Force re-run of all load functions to pick up the new session
			await invalidateAll();

			// Send the user back where they were heading (validated), else home.
			const target = safeRedirect($page.url.searchParams.get('redirectTo')) ?? '/';
			goto(target, { replaceState: true });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : m.login_error_failed());
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<div
	class="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
>
	<!-- Language Toggle -->
	<div class="absolute top-4 right-4">
		<LanguageToggle />
	</div>

	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<CardTitle class="text-3xl font-bold">{m.app_title()}</CardTitle>
			<CardDescription class="text-lg">{m.app_subtitle()}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-6">
			<div class="space-y-2">
				<Label for="username" class="text-lg">{m.login_username()}</Label>
				<Input
					id="username"
					type="text"
					placeholder={m.login_username_placeholder()}
					bind:value={username}
					onkeypress={handleKeyPress}
					disabled={loading}
					class="p-6 text-lg"
					autocomplete="username"
				/>
				<p class="text-sm text-muted-foreground">
					{m.login_help()}
				</p>
			</div>

			<Button
				class="w-full p-6 text-lg"
				onclick={handleLogin}
				disabled={loading || !username.trim()}
			>
				{loading ? m.login_loading() : m.login_button()}
			</Button>

			<div class="text-center text-sm text-muted-foreground">
				<p>{m.login_no_password()}</p>
			</div>

			<div class="border-t pt-4 text-center">
				<Button variant="outline" href="/library" class="w-full gap-2 p-6 text-lg">
					<BookOpen class="h-5 w-5" />
					Βιβλιοθήκη — διαβάστε υλικό
				</Button>
				<p class="mt-2 text-sm text-muted-foreground">Ελεύθερη πρόσβαση, χωρίς σύνδεση</p>
			</div>
		</CardContent>
	</Card>
</div>
