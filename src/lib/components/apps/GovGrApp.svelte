<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Lock, ShieldCheck, Download, FileText, UserPlus, LogIn } from 'lucide-svelte';
	import type { GovSimConfig } from '$lib/lessons/govSim';

	/**
	 * Isolated gov.gr / TaxisNet screen used by the `gov-simulation` lessonType.
	 * It renders exactly ONE screen (config.startScreen) and emits the semantic
	 * event the goal handlers expect, via `onEvent`:
	 *   login       → 'gov-login'            { success }
	 *   services    → 'gov-service-selected' { serviceId }
	 *   certificate → 'download-file'        { filename }
	 *   authorize   → 'gov-authorize'        { name, afm }
	 *
	 * Purely presentational otherwise. Realistic-but-not-photoreal, big targets,
	 * Greek-only copy — tuned for the ΚΑΠΗ / senior audience.
	 */
	let {
		config,
		onEvent,
		done = false
	} = $props<{
		config: GovSimConfig;
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		done?: boolean;
	}>();

	// ── Login screen state ──────────────────────────────────────────────────
	let username = $state('');
	let password = $state('');
	let loginError = $state('');

	function submitLogin() {
		if (done) return;
		const ok = username.trim().length > 0 && password.trim().length > 0;
		loginError = ok ? '' : 'Συμπληρώστε και το Όνομα χρήστη και τον Κωδικό.';
		onEvent('gov-login', { success: ok });
	}

	// ── Services screen ─────────────────────────────────────────────────────
	function selectService(serviceId: string) {
		if (done) return;
		onEvent('gov-service-selected', { serviceId });
	}

	// ── Certificate (download) screen ───────────────────────────────────────
	function downloadCertificate() {
		if (done) return;
		onEvent('download-file', { filename: config.certificate?.filename ?? 'vevaiosi.pdf' });
	}

	// ── Authorization screen ────────────────────────────────────────────────
	let authName = $state('');
	let authAfm = $state('');
	let authError = $state('');

	function submitAuthorization() {
		if (done) return;
		if (authName.trim().length === 0 || authAfm.trim().length === 0) {
			authError = 'Συμπληρώστε το Ονοματεπώνυμο και το ΑΦΜ του ατόμου.';
			return;
		}
		authError = '';
		onEvent('gov-authorize', { name: authName.trim(), afm: authAfm.trim() });
	}
</script>

<div class="flex h-full w-full flex-col overflow-y-auto bg-slate-50">
	<!-- gov.gr header (shared visual language with the browser sim) -->
	<header class="flex items-center gap-3 border-b-4 border-[#003476] bg-white px-6 py-4">
		<span class="rounded bg-[#003476] px-2.5 py-1.5 text-xl font-bold text-white">ΓΔ</span>
		<div>
			<h1 class="text-2xl font-bold text-[#003476] lowercase">gov.gr</h1>
			<p class="text-sm text-slate-600">Ενιαία Ψηφιακή Πύλη της Δημόσιας Διοίκησης</p>
		</div>
	</header>

	<div class="flex-1 p-6">
		{#if config.startScreen === 'login'}
			<!-- ── TaxisNet login ─────────────────────────────────────────── -->
			<div class="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
				<div class="mb-6 flex items-center gap-3">
					<span class="rounded-full bg-blue-100 p-2 text-[#003476]"><LogIn class="h-6 w-6" /></span>
					<h2 class="text-xl font-bold text-slate-900">Σύνδεση με κωδικούς TaxisNet</h2>
				</div>

				<div class="space-y-5">
					<div>
						<label for="gov-username" class="mb-1.5 block text-base font-medium text-slate-800">
							Όνομα χρήστη
						</label>
						<input
							id="gov-username"
							type="text"
							class="w-full rounded-lg border border-slate-300 p-3 text-lg outline-none focus:border-[#003476] focus:ring-2 focus:ring-blue-200"
							bind:value={username}
							disabled={done}
							autocomplete="off"
						/>
					</div>
					<div>
						<label for="gov-password" class="mb-1.5 block text-base font-medium text-slate-800">
							Κωδικός
						</label>
						<input
							id="gov-password"
							type="password"
							class="w-full rounded-lg border border-slate-300 p-3 text-lg outline-none focus:border-[#003476] focus:ring-2 focus:ring-blue-200"
							bind:value={password}
							disabled={done}
							autocomplete="off"
						/>
					</div>

					{#if config.demoUsername || config.demoPassword}
						<div class="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
							<p class="font-medium">Δοκιμαστικοί κωδικοί για την άσκηση:</p>
							<p>Όνομα χρήστη: <strong>{config.demoUsername ?? 'kaph'}</strong></p>
							<p>Κωδικός: <strong>{config.demoPassword ?? '123456'}</strong></p>
						</div>
					{/if}

					{#if loginError}
						<p class="text-sm font-medium text-red-600" role="alert" aria-live="assertive">
							{loginError}
						</p>
					{/if}

					<Button
						class="w-full bg-[#003476] py-6 text-lg text-white hover:bg-[#00285c]"
						disabled={done}
						onclick={submitLogin}
					>
						Σύνδεση
					</Button>

					<p class="flex items-start gap-2 text-xs text-slate-500">
						<Lock class="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
						Οι κωδικοί σας ταξιδεύουν κρυπτογραφημένα. Ποτέ μην τους δίνετε σε άλλον.
					</p>
				</div>
			</div>
		{:else if config.startScreen === 'services'}
			<!-- ── Service catalogue ──────────────────────────────────────── -->
			<div class="mx-auto max-w-3xl">
				<div class="mb-5 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-green-800">
					<ShieldCheck class="h-5 w-5 shrink-0" />
					<p class="text-base font-medium">Είστε συνδεδεμένος. Επιλέξτε την υπηρεσία που θέλετε.</p>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each config.services ?? [] as service (service.id)}
						<button
							class="flex items-start gap-4 rounded-xl border-2 border-slate-200 bg-white p-5 text-left transition-colors hover:border-[#003476] hover:bg-blue-50 focus:border-[#003476] focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:opacity-60"
							disabled={done}
							onclick={() => selectService(service.id)}
						>
							<span class="text-3xl" aria-hidden="true">{service.icon ?? '📄'}</span>
							<span>
								<span class="block text-lg font-bold text-slate-900">{service.label}</span>
								{#if service.description}
									<span class="mt-1 block text-sm text-slate-600">{service.description}</span>
								{/if}
							</span>
						</button>
					{/each}
				</div>
			</div>
		{:else if config.startScreen === 'certificate'}
			<!-- ── Certificate download ───────────────────────────────────── -->
			<div class="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
				<div class="mb-6 flex items-center gap-3">
					<span class="rounded-full bg-blue-100 p-2 text-[#003476]"
						><FileText class="h-6 w-6" /></span
					>
					<div>
						<h2 class="text-xl font-bold text-slate-900">
							{config.certificate?.title ?? 'Βεβαίωση'}
						</h2>
						{#if config.certificate?.authority}
							<p class="text-sm text-slate-600">{config.certificate.authority}</p>
						{/if}
					</div>
				</div>

				<!-- Faux document preview -->
				<div
					class="mb-6 space-y-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6"
				>
					<div class="h-3 w-2/3 rounded bg-slate-300"></div>
					<div class="h-3 w-full rounded bg-slate-200"></div>
					<div class="h-3 w-5/6 rounded bg-slate-200"></div>
					<div class="h-3 w-1/2 rounded bg-slate-200"></div>
					<div class="mt-4 flex items-center gap-2 text-sm text-green-700">
						<ShieldCheck class="h-4 w-4" /> Έγκυρο ψηφιακό έγγραφο
					</div>
				</div>

				<Button
					class="flex w-full items-center justify-center gap-2 bg-[#003476] py-6 text-lg text-white hover:bg-[#00285c]"
					disabled={done}
					onclick={downloadCertificate}
				>
					<Download class="h-5 w-5" /> Λήψη εγγράφου ({config.certificate?.filename ??
						'vevaiosi.pdf'})
				</Button>
			</div>
		{:else if config.startScreen === 'authorize'}
			<!-- ── Grant an authorization ─────────────────────────────────── -->
			<div class="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
				<div class="mb-6 flex items-center gap-3">
					<span class="rounded-full bg-blue-100 p-2 text-[#003476]"
						><UserPlus class="h-6 w-6" /></span
					>
					<h2 class="text-xl font-bold text-slate-900">Χορήγηση εξουσιοδότησης</h2>
				</div>
				<p class="mb-5 text-base text-slate-600">
					Δώστε το δικαίωμα σε ένα άτομο εμπιστοσύνης να διεκπεραιώνει υποθέσεις για εσάς.
				</p>

				<div class="space-y-5">
					<div>
						<label for="gov-auth-name" class="mb-1.5 block text-base font-medium text-slate-800">
							Ονοματεπώνυμο ατόμου
						</label>
						<input
							id="gov-auth-name"
							type="text"
							class="w-full rounded-lg border border-slate-300 p-3 text-lg outline-none focus:border-[#003476] focus:ring-2 focus:ring-blue-200"
							bind:value={authName}
							disabled={done}
							placeholder="π.χ. Μαρία Παπαδοπούλου"
						/>
					</div>
					<div>
						<label for="gov-auth-afm" class="mb-1.5 block text-base font-medium text-slate-800">
							ΑΦΜ ατόμου
						</label>
						<input
							id="gov-auth-afm"
							type="text"
							inputmode="numeric"
							class="w-full rounded-lg border border-slate-300 p-3 text-lg outline-none focus:border-[#003476] focus:ring-2 focus:ring-blue-200"
							bind:value={authAfm}
							disabled={done}
							placeholder="9 ψηφία"
						/>
					</div>

					{#if authError}
						<p class="text-sm font-medium text-red-600" role="alert" aria-live="assertive">
							{authError}
						</p>
					{/if}

					<Button
						class="w-full bg-[#003476] py-6 text-lg text-white hover:bg-[#00285c]"
						disabled={done}
						onclick={submitAuthorization}
					>
						Χορήγηση εξουσιοδότησης
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
