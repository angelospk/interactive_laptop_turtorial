<script lang="ts">
	import { Phone, PhoneOff, Mic, MicOff, Video, User } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { normalizeMeetingCode } from '$lib/lessons/goalHandlers';

	let { config = {}, onAction } = $props<{
		config?: { targetContact?: string; meetingCode?: string };
		onAction: (action: string, data?: Record<string, unknown>) => void;
	}>();

	type CallState = 'idle' | 'calling' | 'active';

	let callState = $state<CallState>('idle');
	let muted = $state(false);
	let callDuration = $state(0);
	let durationInterval: ReturnType<typeof setInterval> | null = null;

	const contact = $derived(config.targetContact || 'Επαφή');

	// Scheduled meeting (Zoom/Meet/Teams style): the learner types the code from the invitation.
	const isMeeting = $derived(!!config.meetingCode);
	let codeInput = $state('');
	let codeError = $state(false);

	function joinMeeting() {
		const code = codeInput.trim();
		if (!code) return;
		onAction('join-meeting', { code });
		if (normalizeMeetingCode(code) !== normalizeMeetingCode(config.meetingCode ?? '')) {
			codeError = true;
			return;
		}
		codeError = false;
		callState = 'active';
		durationInterval = setInterval(() => {
			callDuration++;
		}, 1000);
	}

	function startCall() {
		callState = 'calling';
		toast.loading(`Κλήση προς ${contact}...`);
		setTimeout(() => {
			callState = 'active';
			toast.success(`Σύνδεση με ${contact}`);
			durationInterval = setInterval(() => {
				callDuration++;
			}, 1000);
		}, 2000);
		onAction('start-videocall', { contact });
	}

	function toggleMute() {
		muted = !muted;
		onAction('mute-call', { muted });
		toast(muted ? 'Σίγαση ενεργοποιήθηκε' : 'Σίγαση απενεργοποιήθηκε');
	}

	function endCall() {
		if (durationInterval) clearInterval(durationInterval);
		callState = 'idle';
		callDuration = 0;
		muted = false;
		onAction('end-call', {});
		toast.success('Η κλήση τερματίστηκε');
	}

	function formatDuration(secs: number) {
		const m = Math.floor(secs / 60)
			.toString()
			.padStart(2, '0');
		const s = (secs % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}
</script>

<div class="flex h-full flex-col items-center justify-center bg-slate-900 text-white">
	<!-- Contact Avatar -->
	<div class="mb-6 flex flex-col items-center gap-3">
		<div
			class="flex h-24 w-24 items-center justify-center rounded-full bg-slate-700 text-slate-300 shadow-lg"
		>
			<User class="h-12 w-12" />
		</div>
		<h2 class="text-2xl font-bold">{isMeeting ? 'Σύσκεψη' : contact}</h2>

		{#if isMeeting && callState === 'active'}
			<p class="text-green-400">Είστε στη σύσκεψη · {formatDuration(callDuration)}</p>
		{:else if isMeeting}
			<p class="text-slate-400">Συμμετοχή σε προγραμματισμένη σύσκεψη</p>
		{:else if callState === 'idle'}
			<p class="text-slate-400">Βιντεοκλήση Viber</p>
		{:else if callState === 'calling'}
			<p class="animate-pulse text-slate-400">Κλήση σε εξέλιξη...</p>
		{:else if callState === 'active'}
			<p class="text-green-400">{formatDuration(callDuration)}</p>
		{/if}
	</div>

	<!-- Simulated video area (active call) -->
	{#if callState === 'active'}
		<div
			class="mb-6 flex h-40 w-64 items-center justify-center rounded-xl border border-slate-700 bg-slate-800"
		>
			<Video class="h-12 w-12 text-slate-600" />
		</div>
	{/if}

	<!-- Call Controls -->
	<div class="flex items-center gap-6">
		{#if isMeeting && callState === 'idle'}
			<form
				class="flex flex-col items-center gap-3"
				onsubmit={(e) => {
					e.preventDefault();
					joinMeeting();
				}}
			>
				<label for="meeting-code" class="text-sm text-slate-300">Κωδικός σύσκεψης</label>
				<input
					id="meeting-code"
					bind:value={codeInput}
					inputmode="numeric"
					autocomplete="off"
					class="w-64 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-center text-xl tracking-widest"
				/>
				{#if codeError}
					<p class="text-sm text-red-400">Ο κωδικός δεν είναι σωστός</p>
				{/if}
				<button
					type="submit"
					class="rounded-full bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-700 active:scale-95"
				>
					Συμμετοχή
				</button>
			</form>
		{:else if callState === 'idle'}
			<button
				class="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg transition-transform hover:bg-green-600 active:scale-95"
				onclick={startCall}
				title="Έναρξη κλήσης"
			>
				<Phone class="h-7 w-7" />
			</button>
		{:else if callState === 'calling' || callState === 'active'}
			{#if callState === 'active'}
				<button
					class="flex h-14 w-14 items-center justify-center rounded-full transition-transform active:scale-95 {muted
						? 'bg-yellow-500 hover:bg-yellow-600'
						: 'bg-slate-700 hover:bg-slate-600'} shadow-lg"
					onclick={toggleMute}
					title={muted ? 'Άρση σίγασης' : 'Σίγαση'}
				>
					{#if muted}
						<MicOff class="h-6 w-6" />
					{:else}
						<Mic class="h-6 w-6" />
					{/if}
				</button>
			{/if}

			<button
				class="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg transition-transform hover:bg-red-600 active:scale-95"
				onclick={endCall}
				title="Τερματισμός κλήσης"
			>
				<PhoneOff class="h-7 w-7" />
			</button>
		{/if}
	</div>

	{#if callState === 'idle' && !isMeeting}
		<p class="mt-8 text-sm text-slate-500">Πατήστε το πράσινο κουμπί για να ξεκινήσετε την κλήση</p>
	{/if}
</div>
