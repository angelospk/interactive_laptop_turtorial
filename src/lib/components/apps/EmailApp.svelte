<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Mail, Star, Send, Inbox, Trash2, AlertTriangle, Paperclip, Archive, Menu } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let {
		emails = [],
		onAction
	} = $props<{
		emails?: any[];
		onAction: (action: string, data?: any) => void;
	}>();

	type Email = {
		id: string;
		sender: string;
		subject: string;
		body: string;
		date: string;
		isRead: boolean;
		isPhishing?: boolean;
		hasAttachment?: boolean;
	};

	const defaultEmails: Email[] = [
		{
			id: '1',
			sender: 'Trapeza Piraeus <security@piraeus-alert.com>',
			subject: 'ΕΠΕΙΓΟΝ: Ο λογαριασμός σας έχει κλειδωθεί',
			body: 'Αγαπητέ πελάτη, παρατηρήσαμε ύποπτη δραστηριότητα. Κάντε κλικ εδώ για να ξεκλειδώσετε τον λογαριασμό σας.',
			date: '10:30',
			isRead: false,
			isPhishing: true
		},
		{
			id: '2',
			sender: 'Google <no-reply@accounts.google.com>',
			subject: 'Ειδοποίηση ασφαλείας',
			body: 'Συνδεθήκατε από νέα συσκευή. Αν ήσασταν εσείς, αγνοήστε αυτό το μήνυμα.',
			date: 'Χθες',
			isRead: true,
			isPhishing: false
		},
		{
			id: '3',
			sender: 'Maria Papadopoulou <maria.pap@gmail.com>',
			subject: 'Φωτογραφίες από τις διακοπές',
			body: 'Σου στέλνω τις φωτογραφίες που βγάλαμε. Ήταν τέλεια!',
			date: 'Δευτέρα',
			isRead: true,
			isPhishing: false,
			hasAttachment: true
		}
	];

	let emailList = $state<Email[]>(emails.length > 0 ? emails : defaultEmails);
	let selectedEmailId = $state<string | null>(null);
	let currentView = $state<'inbox' | 'sent' | 'trash'>('inbox');

	let selectedEmail = $derived(emailList.find((e) => e.id === selectedEmailId));
	let filteredEmails = $derived(emailList); // Simplified for now

	function selectEmail(id: string) {
		selectedEmailId = id;
		const email = emailList.find((e) => e.id === id);
		if (email && !email.isRead) {
			email.isRead = true;
		}
		onAction('read-email', { id });
	}

	function deleteEmail(id: string) {
		emailList = emailList.filter((e) => e.id !== id);
		if (selectedEmailId === id) selectedEmailId = null;
		toast.success('Το μήνυμα διαγράφηκε');
		onAction('delete-email', { id });
	}

	function reportPhishing(id: string) {
		const email = emailList.find((e) => e.id === id);
		if (email?.isPhishing) {
			toast.success('Μπράβο! Εντόπισες σωστά το κακόβουλο email!');
			onAction('report-phishing', { id, correct: true });
		} else {
			toast.error('Προσοχή! Αυτό το email φαίνεται ασφαλές.');
			onAction('report-phishing', { id, correct: false });
		}
		deleteEmail(id);
	}

	function downloadAttachment() {
		toast.success('Το αρχείο κατέβηκε με ασφάλεια');
		onAction('download-attachment', { id: selectedEmailId });
	}
</script>

<div class="flex h-full w-full overflow-hidden bg-white">
	<!-- Sidebar -->
	<div class="w-48 border-r bg-slate-50 p-4 hidden md:block">
		<Button class="mb-6 w-full gap-2 bg-red-600 hover:bg-red-700" onclick={() => toast.info('Σύνταξη νέου μηνύματος')}>
			<Menu class="h-4 w-4" /> Σύνταξη
		</Button>
		<nav class="space-y-1">
			<button
				class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {currentView === 'inbox' ? 'bg-red-100 text-red-700' : 'text-slate-700 hover:bg-slate-200'}"
				onclick={() => (currentView = 'inbox')}
			>
				<Inbox class="h-4 w-4" /> Εισερχόμενα
			</button>
			<button
				class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {currentView === 'sent' ? 'bg-red-100 text-red-700' : 'text-slate-700 hover:bg-slate-200'}"
				onclick={() => (currentView = 'sent')}
			>
				<Send class="h-4 w-4" /> Απεσταλμένα
			</button>
			<button
				class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {currentView === 'trash' ? 'bg-red-100 text-red-700' : 'text-slate-700 hover:bg-slate-200'}"
				onclick={() => (currentView = 'trash')}
			>
				<Trash2 class="h-4 w-4" /> Κάδος
			</button>
		</nav>
	</div>

	<!-- Email List -->
	<div class="w-80 border-r bg-white overflow-y-auto">
		{#each filteredEmails as email}
			<button
				class="flex w-full flex-col gap-1 border-b p-4 text-left transition-colors hover:bg-slate-50 {selectedEmailId === email.id ? 'bg-blue-50' : ''} {!email.isRead ? 'font-semibold' : 'text-slate-600'}"
				onclick={() => selectEmail(email.id)}
			>
				<div class="flex w-full justify-between text-xs text-slate-500">
					<span class="truncate max-w-[150px]">{email.sender.split('<')[0]}</span>
					<span>{email.date}</span>
				</div>
				<div class="text-sm">{email.subject}</div>
				<div class="truncate text-xs text-slate-400">{email.body}</div>
			</button>
		{/each}
	</div>

	<!-- Email View -->
	<div class="flex-1 overflow-y-auto bg-white p-6">
		{#if selectedEmail}
			<div class="flex h-full flex-col">
				<div class="mb-6 flex items-start justify-between border-b pb-4">
					<div>
						<h2 class="text-xl font-bold text-slate-900">{selectedEmail.subject}</h2>
						<div class="mt-2 flex items-center gap-2 text-sm text-slate-600">
							<span class="font-bold text-slate-900">{selectedEmail.sender}</span>
						</div>
					</div>
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="icon"
							class="text-red-600 hover:bg-red-50"
							title="Αναφορά Phishing"
							onclick={() => reportPhishing(selectedEmail!.id)}
						>
							<AlertTriangle class="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onclick={() => deleteEmail(selectedEmail!.id)}
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div class="flex-1 text-slate-700 whitespace-pre-wrap">
					{selectedEmail.body}
				</div>

				{#if selectedEmail.hasAttachment}
					<div class="mt-6 border-t pt-4">
						<h4 class="mb-2 text-sm font-bold text-slate-700">Συνημμένα</h4>
						<button
							class="flex items-center gap-3 rounded-lg border p-3 hover:bg-slate-50"
							onclick={downloadAttachment}
						>
							<div class="flex h-10 w-10 items-center justify-center rounded bg-red-100 text-red-600">
								<Paperclip class="h-5 w-5" />
							</div>
							<div class="text-left">
								<div class="text-sm font-medium">photos.zip</div>
								<div class="text-xs text-slate-500">2.4 MB</div>
							</div>
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex h-full items-center justify-center text-slate-400">
				<div class="text-center">
					<Mail class="mx-auto mb-4 h-16 w-16 opacity-20" />
					<p>Επιλέξτε ένα μήνυμα για ανάγνωση</p>
				</div>
			</div>
		{/if}
	</div>
</div>
