<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Check, Download, AlertCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let {
		config = {},
		onAction
	} = $props<{
		config?: any;
		onAction: (action: string, data?: any) => void;
	}>();

	let step = $state(1);
	let isInstalling = $state(false);
	let progress = $state(0);
	let isComplete = $state(false);
	let eulaAccepted = $state(false);

	const appName = config.appName || 'Super Browser';

	function nextStep() {
		if (step === 1 && !eulaAccepted) {
			toast.error('Πρέπει να αποδεχτείτε τους όρους χρήσης.');
			return;
		}
		step++;
		if (step === 3) {
			startInstall();
		}
	}

	function startInstall() {
		isInstalling = true;
		const interval = setInterval(() => {
			progress += 5;
			if (progress >= 100) {
				clearInterval(interval);
				isInstalling = false;
				step = 4;
				isComplete = true;
				toast.success('Η εγκατάσταση ολοκληρώθηκε!');
				onAction('install-complete', { appName });
			}
		}, 100);
	}

	function finish() {
		onAction('finish');
	}
</script>

<div class="flex h-full flex-col bg-slate-50 p-6">
	<div class="mx-auto w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
		<!-- Header -->
		<div class="mb-6 flex items-center gap-4 border-b pb-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
				<Download class="h-6 w-6" />
			</div>
			<div>
				<h2 class="text-lg font-bold">Εγκατάσταση {appName}</h2>
				<p class="text-sm text-slate-500">Οδηγός εγκατάστασης</p>
			</div>
		</div>

		<!-- Content -->
		<div class="mb-6 min-h-[200px]">
			{#if step === 1}
				<h3 class="mb-4 font-semibold">Βήμα 1: Όροι Χρήσης</h3>
				<div class="mb-4 h-32 overflow-y-auto rounded border bg-slate-50 p-2 text-xs text-slate-600">
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
					<p class="mt-2">1. Αποδέχεστε να χρησιμοποιείτε το λογισμικό νόμιμα.</p>
					<p>2. Δεν φέρουμε ευθύνη για τυχόν απώλεια δεδομένων.</p>
					<p>3. Η άδεια χρήσης είναι προσωπική.</p>
				</div>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" bind:checked={eulaAccepted} class="rounded border-slate-300" />
					<span class="text-sm">Αποδέχομαι τους όρους χρήσης</span>
				</label>
			{:else if step === 2}
				<h3 class="mb-4 font-semibold">Βήμα 2: Επιλογή Τοποθεσίας</h3>
				<div class="mb-4">
					<label class="mb-2 block text-sm text-slate-600">Φάκελος εγκατάστασης:</label>
					<div class="flex gap-2">
						<input type="text" value="C:\Program Files\{appName}" readonly class="w-full rounded border p-2 text-sm text-slate-500 bg-slate-100" />
						<Button variant="outline" size="sm">Αλλαγή...</Button>
					</div>
				</div>
				<div class="rounded bg-yellow-50 p-3 text-xs text-yellow-700 flex gap-2 items-start">
					<AlertCircle class="h-4 w-4 shrink-0 mt-0.5" />
					<p>Βεβαιωθείτε ότι έχετε αρκετό χώρο στον δίσκο (Απαιτείται: 150MB)</p>
				</div>
			{:else if step === 3}
				<h3 class="mb-4 font-semibold">Εγκατάσταση σε εξέλιξη...</h3>
				<div class="mb-2 flex justify-between text-sm text-slate-600">
					<span>Αντιγραφή αρχείων...</span>
					<span>{progress}%</span>
				</div>
				<div class="h-4 w-full overflow-hidden rounded-full bg-slate-100">
					<div class="h-full bg-blue-600 transition-all duration-200" style="width: {progress}%"></div>
				</div>
			{:else if step === 4}
				<div class="flex flex-col items-center justify-center py-4 text-center">
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
						<Check class="h-8 w-8" />
					</div>
					<h3 class="text-xl font-bold text-green-700">Επιτυχία!</h3>
					<p class="text-slate-600">Το {appName} εγκαταστάθηκε με επιτυχία στον υπολογιστή σας.</p>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="flex justify-end gap-2 border-t pt-4">
			{#if step < 3}
				<Button variant="ghost" onclick={() => onAction('cancel')}>Άκυρο</Button>
				<Button onclick={nextStep} disabled={step === 1 && !eulaAccepted}>Επόμενο</Button>
			{:else if step === 3}
				<Button disabled>Εγκατάσταση...</Button>
			{:else}
				<Button onclick={finish}>Τέλος</Button>
			{/if}
		</div>
	</div>
</div>
