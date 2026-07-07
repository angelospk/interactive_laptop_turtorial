<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import { BookOpen, ArrowRight } from '@lucide/svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import { safeRedirect } from '$lib/utils/redirect';
	import { reveal } from '$lib/actions/reveal';

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

<main
	class="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-4 py-10"
>
	<!-- Soft ambient light field (no OLED, no harsh contrast) -->
	<div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full opacity-60 blur-3xl"
			style="background: radial-gradient(circle, oklch(0.86 0.08 264 / 0.55), transparent 70%);"
		></div>
		<div
			class="absolute -right-24 -bottom-32 h-[26rem] w-[26rem] rounded-full opacity-50 blur-3xl"
			style="background: radial-gradient(circle, oklch(0.88 0.07 200 / 0.5), transparent 70%);"
		></div>
	</div>

	<div class="absolute top-5 right-5 z-10">
		<LanguageToggle />
	</div>

	<div class="relative w-full max-w-md" data-reveal use:reveal>
		<div class="bezel-shell shadow-soft-lg">
			<div class="bezel-core px-7 py-9 sm:px-9">
				<!-- Eyebrow -->
				<div class="mb-6 flex justify-center">
					<span
						class="rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase"
					>
						Ψηφιακές Δεξιότητες
					</span>
				</div>

				<header class="mb-8 text-center">
					<h1 class="text-4xl font-extrabold text-foreground sm:text-[2.75rem]">{m.app_title()}</h1>
					<p class="mt-3 text-lg text-muted-foreground">{m.app_subtitle()}</p>
				</header>

				<div class="space-y-3">
					<Label for="username" class="text-base font-semibold">{m.login_username()}</Label>
					<Input
						id="username"
						type="text"
						placeholder={m.login_username_placeholder()}
						bind:value={username}
						onkeypress={handleKeyPress}
						disabled={loading}
						class="h-14 rounded-2xl border-border/70 bg-background px-5 text-lg shadow-soft transition-all focus-visible:ring-4 focus-visible:ring-brand/15"
						autocomplete="username"
					/>
					<p class="text-sm text-muted-foreground">{m.login_help()}</p>
				</div>

				<!-- Premium CTA with nested "island" trailing icon -->
				<button
					type="button"
					onclick={handleLogin}
					disabled={loading || !username.trim()}
					class="group mt-7 flex w-full items-center justify-between gap-3 rounded-full bg-brand py-3 pr-2 pl-7 text-lg font-semibold text-brand-foreground shadow-soft transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg focus-visible:ring-4 focus-visible:ring-brand/25 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55"
				>
					<span>{loading ? m.login_loading() : m.login_button()}</span>
					<span
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-foreground/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105"
					>
						<ArrowRight class="h-5 w-5" strokeWidth={2} />
					</span>
				</button>

				<p class="mt-4 text-center text-sm text-muted-foreground">{m.login_no_password()}</p>

				<!-- Library bridge -->
				<div class="mt-7 border-t border-border/60 pt-6">
					<a
						href="/library"
						class="group flex items-center justify-between gap-3 rounded-2xl bg-secondary/60 px-5 py-4 text-base font-medium text-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-secondary focus-visible:ring-4 focus-visible:ring-brand/15 focus-visible:outline-none"
					>
						<span class="flex items-center gap-3">
							<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
								<BookOpen class="h-5 w-5 text-brand" strokeWidth={1.75} />
							</span>
							<span>
								{m.library_cta()}
								<span class="block text-xs font-normal text-muted-foreground">
									{m.library_cta_sub()}
								</span>
							</span>
						</span>
						<ArrowRight
							class="h-5 w-5 text-muted-foreground transition-transform duration-500 group-hover:translate-x-1"
							strokeWidth={1.75}
						/>
					</a>
				</div>
			</div>
		</div>
	</div>
</main>
