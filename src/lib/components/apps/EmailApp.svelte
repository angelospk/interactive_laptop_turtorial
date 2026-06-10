<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Mail,
		Star,
		Send,
		Inbox,
		Trash2,
		AlertTriangle,
		Paperclip,
		Archive,
		Pencil,
		Download,
		FileText,
		X,
		Reply,
		Forward
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { fly } from 'svelte/transition';

	let { emails = [], onAction } = $props<{
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
		folder?: 'inbox' | 'sent' | 'trash' | 'drafts';
	};

	const defaultEmails: Email[] = [
		{
			id: '1',
			sender: 'Trapeza Piraeus <security@piraeus-alert.com>',
			subject: 'ΕΠΕΙΓΟΝ: Ο λογαριασμός σας έχει κλειδωθεί',
			body: 'Αγαπητέ πελάτη,\n\nΠαρατηρήσαμε ύποπτη δραστηριότητα στον λογαριασμό σας. Για την ασφάλειά σας, έχουμε περιορίσει προσωρινά την πρόσβαση.\n\nΠαρακαλούμε κάντε κλικ στον παρακάτω σύνδεσμο για να επιβεβαιώσετε τα στοιχεία σας και να ξεκλειδώσετε τον λογαριασμό σας άμεσα:\n\n[ΞΕΚΛΕΙΔΩΜΑ ΛΟΓΑΡΙΑΣΜΟΥ]\n\nΑν δεν το κάνετε εντός 24 ωρών, ο λογαριασμός θα διαγραφεί μόνιμα.\n\nΤμήμα Ασφαλείας',
			date: '10:30',
			isRead: false,
			isPhishing: true,
			folder: 'inbox'
		},
		{
			id: '4',
			sender: 'Netflix Support <support@netflix-verify-payment.com>',
			subject: 'Πρόβλημα με την πληρωμή σας',
			body: 'Γεια σας,\n\nΗ τελευταία πληρωμή για τη συνδρομή σας απέτυχε. Παρακαλούμε ενημερώστε τα στοιχεία της κάρτας σας για να μην διακοπεί η υπηρεσία.\n\nΠατήστε εδώ: ενημέρωση-πληρωμής.com\n\nΕυχαριστούμε,\nNetflix Team',
			date: '09:15',
			isRead: false,
			isPhishing: true,
			folder: 'inbox'
		},
		{
			id: '2',
			sender: 'Google <no-reply@accounts.google.com>',
			subject: 'Ειδοποίηση ασφαλείας',
			body: 'Συνδεθήκατε από νέα συσκευή (Windows PC). Αν ήσασταν εσείς, αγνοήστε αυτό το μήνυμα. Αν όχι, αλλάξτε τον κωδικό σας άμεσα.',
			date: 'Χθες',
			isRead: true,
			isPhishing: false,
			folder: 'inbox'
		},
		{
			id: '3',
			sender: 'Maria Papadopoulou <maria.pap@gmail.com>',
			subject: 'Φωτογραφίες από τις διακοπές',
			body: 'Γεια σου!\n\nΣου στέλνω τις φωτογραφίες που βγάλαμε στο νησί. Ήταν τέλεια, πρέπει να το ξανακανονίσουμε σύντομα!\n\nΔες το συνημμένο αρχείο.\n\nΦιλιά,\nΜαρία',
			date: 'Δευτέρα',
			isRead: true,
			isPhishing: false,
			hasAttachment: true,
			folder: 'inbox'
		}
	];

	const defaultDrafts: Email[] = [
		{
			id: 'd1',
			sender: 'Εγώ',
			subject: 'Αίτηση για άδεια',
			body: 'Αξιότιμε κ. Διευθυντά,\n\nΘα ήθελα να αιτηθώ...',
			date: 'Τρίτη',
			isRead: true,
			folder: 'drafts'
		}
	];

	let emailList = $state<Email[]>([
		...(emails.length > 0 ? emails : defaultEmails),
		...defaultDrafts
	]);
	let selectedEmailId = $state<string | null>(null);
	let currentView = $state<'inbox' | 'sent' | 'trash' | 'drafts'>('inbox');
	let isComposing = $state(false);

	// Compose State
	let composeTo = $state('');
	let composeSubject = $state('');
	let composeBody = $state('');
	let attachments = $state<{ name: string; size: string }[]>([]);

	let selectedEmail = $derived(emailList.find((e) => e.id === selectedEmailId));
	let filteredEmails = $derived(emailList.filter((e) => (e.folder || 'inbox') === currentView));
	let unreadCount = $derived(
		emailList.filter((e) => !e.isRead && (e.folder || 'inbox') === 'inbox').length
	);

	// Deterministic avatar color from sender name (Gmail-style)
	const avatarPalette = [
		'bg-red-500',
		'bg-blue-500',
		'bg-green-600',
		'bg-purple-500',
		'bg-amber-600',
		'bg-teal-600',
		'bg-pink-500',
		'bg-indigo-500'
	];

	function senderName(sender: string): string {
		return sender.split('<')[0].trim() || sender;
	}

	function senderAddress(sender: string): string {
		const match = sender.match(/<(.+)>/);
		return match ? match[1] : '';
	}

	function avatarColor(sender: string): string {
		const name = senderName(sender);
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = (hash * 31 + name.charCodeAt(i)) | 0;
		}
		return avatarPalette[Math.abs(hash) % avatarPalette.length];
	}

	function selectEmail(id: string) {
		selectedEmailId = id;
		const email = emailList.find((e) => e.id === id);
		if (email && !email.isRead) {
			email.isRead = true;
		}
		onAction('read-email', { id });

		// Check if all unread emails in inbox have been read
		const unreadInbox = emailList.filter((e) => !e.isRead && (e.folder === 'inbox' || !e.folder));
		if (unreadInbox.length === 0) {
			onAction('read-all-unread-complete', {});
		}
	}

	function deleteEmail(id: string) {
		const email = emailList.find((e) => e.id === id);
		if (email) {
			if (email.folder === 'trash') {
				emailList = emailList.filter((e) => e.id !== id);
				toast.success('Το μήνυμα διαγράφηκε οριστικά');
			} else {
				email.folder = 'trash';
				toast.success('Το μήνυμα μετακινήθηκε στον Κάδο');
			}
		}
		if (selectedEmailId === id) selectedEmailId = null;
		onAction('delete-email', { id });
	}

	function reportPhishing(id: string) {
		const email = emailList.find((e) => e.id === id);
		if (!email) return;

		if (email.isPhishing) {
			// Success scenario
			const senderDomain = email.sender.split('@')[1].replace('>', '');
			toast.success('Μπράβο! Εντόπισες σωστά το Phishing!', {
				description: `Παρατήρησε ότι ο αποστολέας "${senderDomain}" δεν είναι ο επίσημος (π.χ. piraeusbank.gr).`,
				duration: 5000
			});
			onAction('report-phishing', { id, correct: true });
		} else {
			// Fail scenario
			toast.error('Προσοχή! Αυτό το email φαίνεται ασφαλές.', {
				description:
					'Ελέγξτε τον αποστολέα και το περιεχόμενο ξανά. Δεν υπάρχουν ύποπτοι σύνδεσμοι.',
				duration: 4000
			});
			onAction('report-phishing', { id, correct: false });
		}

		// Move to trash after reporting? Or keep it? Let's move to trash if correct.
		if (email.isPhishing) {
			deleteEmail(id);
		}
	}

	function downloadAttachment() {
		toast.success('Το αρχείο κατέβηκε με ασφάλεια');
		onAction('download-attachment', { id: selectedEmailId });
	}

	function startCompose() {
		isComposing = true;
		composeTo = '';
		composeSubject = '';
		composeBody = '';
		attachments = [];
	}

	function addAttachment() {
		// Simulate file picker
		const fileName = 'document.pdf';
		if (!attachments.some((a) => a.name === fileName)) {
			attachments = [...attachments, { name: fileName, size: '450 KB' }];
			toast.success(`Επισυνάφθηκε το αρχείο: ${fileName}`);
			onAction('attach-file', { fileName });
		}
	}

	function sendEmail() {
		if (!composeTo || !composeSubject) {
			toast.error('Συμπληρώστε τον παραλήπτη και το θέμα');
			return;
		}

		const newEmail: Email = {
			id: Math.random().toString(36),
			sender: 'Εγώ',
			subject: composeSubject,
			body: composeBody,
			date: 'Τώρα',
			isRead: true,
			folder: 'sent'
		};

		emailList = [newEmail, ...emailList];
		isComposing = false;
		toast.success('Το μήνυμα στάλθηκε!');
		onAction('send-email', { to: composeTo, subject: composeSubject });
	}

	function saveDraft() {
		const newDraft: Email = {
			id: Math.random().toString(36),
			sender: 'Πρόχειρο',
			subject: composeSubject || '(Χωρίς θέμα)',
			body: composeBody,
			date: 'Τώρα',
			isRead: true,
			folder: 'drafts'
		};
		emailList = [newDraft, ...emailList];
		isComposing = false;
		toast.info('Αποθηκεύτηκε στα Πρόχειρα');
	}
</script>

<div class="relative flex h-full w-full overflow-hidden bg-white">
	<!-- Compose Modal -->
	{#if isComposing}
		<div
			class="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
			transition:fly={{ y: 20, duration: 200 }}
		>
			<div class="flex h-[500px] w-[600px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
				<div class="flex items-center justify-between bg-slate-800 px-4 py-2.5">
					<h3 class="text-sm font-medium text-white">Νέο Μήνυμα</h3>
					<button onclick={() => (isComposing = false)} class="text-slate-300 hover:text-white">
						<X class="h-5 w-5" />
					</button>
				</div>
				<div class="flex flex-col gap-1 p-4">
					<input
						type="text"
						placeholder="Προς"
						class="border-b border-slate-200 p-2 text-sm outline-none focus:border-blue-500"
						bind:value={composeTo}
					/>
					<input
						type="text"
						placeholder="Θέμα"
						class="border-b border-slate-200 p-2 text-sm outline-none focus:border-blue-500"
						bind:value={composeSubject}
					/>
					<textarea
						class="h-64 resize-none p-2 text-sm outline-none"
						placeholder="Γράψτε το μήνυμά σας εδώ..."
						bind:value={composeBody}
					></textarea>

					{#if attachments.length > 0}
						<div class="mt-2 flex flex-wrap gap-2">
							{#each attachments as att (att.name)}
								<div
									class="flex items-center gap-2 rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-600"
								>
									<Paperclip class="h-3 w-3" />
									{att.name}
									<button onclick={() => (attachments = attachments.filter((a) => a !== att))}>
										<X class="h-3 w-3 hover:text-red-500" />
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
				<div class="flex items-center justify-between border-t bg-slate-50 px-4 py-3">
					<div class="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							onclick={addAttachment}
							title="Επισύναψη αρχείου"
							class="text-slate-600"
						>
							<Paperclip class="h-5 w-5" />
						</Button>
						<Button variant="ghost" onclick={saveDraft}>Αποθήκευση</Button>
					</div>
					<div class="flex gap-2">
						<Button variant="ghost" onclick={() => (isComposing = false)}>Ακύρωση</Button>
						<Button
							class="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700"
							onclick={sendEmail}
						>
							<Send class="mr-2 h-4 w-4" /> Αποστολή
						</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Sidebar -->
	<div class="hidden w-52 border-r bg-slate-50 py-4 pr-3 md:block">
		<div class="mb-6 px-3">
			<Button
				class="h-12 w-auto gap-3 rounded-full bg-white px-5 text-slate-700 shadow-md hover:bg-slate-100 hover:shadow-lg"
				onclick={startCompose}
			>
				<Pencil class="h-4 w-4 text-red-600" /> Σύνταξη
			</Button>
		</div>
		<nav class="space-y-0.5">
			<button
				class="flex w-full items-center gap-3 rounded-r-full py-2 pr-3 pl-6 text-sm {currentView ===
				'inbox'
					? 'bg-red-100 font-bold text-red-800'
					: 'font-medium text-slate-700 hover:bg-slate-200'}"
				onclick={() => (currentView = 'inbox')}
			>
				<Inbox class="h-4 w-4" /> Εισερχόμενα
				{#if unreadCount > 0}
					<span class="ml-auto text-xs font-bold">{unreadCount}</span>
				{/if}
			</button>
			<button
				class="flex w-full items-center gap-3 rounded-r-full py-2 pr-3 pl-6 text-sm {currentView ===
				'drafts'
					? 'bg-red-100 font-bold text-red-800'
					: 'font-medium text-slate-700 hover:bg-slate-200'}"
				onclick={() => (currentView = 'drafts')}
			>
				<FileText class="h-4 w-4" /> Πρόχειρα
			</button>
			<button
				class="flex w-full items-center gap-3 rounded-r-full py-2 pr-3 pl-6 text-sm {currentView ===
				'sent'
					? 'bg-red-100 font-bold text-red-800'
					: 'font-medium text-slate-700 hover:bg-slate-200'}"
				onclick={() => (currentView = 'sent')}
			>
				<Send class="h-4 w-4" /> Απεσταλμένα
			</button>
			<button
				class="flex w-full items-center gap-3 rounded-r-full py-2 pr-3 pl-6 text-sm {currentView ===
				'trash'
					? 'bg-red-100 font-bold text-red-800'
					: 'font-medium text-slate-700 hover:bg-slate-200'}"
				onclick={() => (currentView = 'trash')}
			>
				<Trash2 class="h-4 w-4" /> Κάδος
			</button>
		</nav>
	</div>

	<!-- Email List -->
	<div class="flex w-80 flex-col overflow-y-auto border-r bg-white">
		<div class="border-b bg-slate-50 p-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
			{currentView === 'inbox'
				? 'Εισερχόμενα'
				: currentView === 'sent'
					? 'Απεσταλμένα'
					: currentView === 'drafts'
						? 'Πρόχειρα'
						: 'Κάδος'}
		</div>
		{#each filteredEmails as email (email.id)}
			<button
				class="relative flex w-full items-start gap-3 border-b p-3 text-left transition-all hover:z-10 hover:shadow-md {selectedEmailId ===
				email.id
					? 'bg-blue-50'
					: !email.isRead
						? 'bg-white'
						: 'bg-slate-50/70'} {!email.isRead ? 'font-semibold text-slate-900' : 'text-slate-600'}"
				onclick={() => selectEmail(email.id)}
			>
				<div
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white {avatarColor(
						email.sender
					)}"
				>
					{senderName(email.sender).charAt(0).toUpperCase()}
				</div>
				<div class="flex min-w-0 flex-1 flex-col gap-0.5">
					<div class="flex w-full items-baseline justify-between gap-2">
						<span class="max-w-[150px] truncate text-sm">{senderName(email.sender)}</span>
						<span class="shrink-0 text-xs {!email.isRead ? 'text-slate-700' : 'text-slate-400'}"
							>{email.date}</span
						>
					</div>
					<div class="flex items-center gap-1 truncate text-sm">
						{email.subject}
						{#if email.hasAttachment}
							<Paperclip class="h-3 w-3 shrink-0 text-slate-400" />
						{/if}
					</div>
					<div class="truncate text-xs font-normal text-slate-400">{email.body}</div>
				</div>
			</button>
		{:else}
			<div class="p-4 text-center text-sm text-slate-400">Κανένα μήνυμα</div>
		{/each}
	</div>

	<!-- Email View -->
	<div class="flex-1 overflow-y-auto bg-white p-6">
		{#if selectedEmail}
			<div class="flex h-full flex-col">
				<div class="mb-6 border-b pb-4">
					<div class="flex items-start justify-between gap-4">
						<h2 class="text-xl font-bold text-slate-900">{selectedEmail.subject}</h2>
						<div class="flex shrink-0 gap-1">
							<Button
								variant="outline"
								size="icon"
								class="rounded-full text-red-600 hover:bg-red-50"
								title="Αναφορά Phishing"
								onclick={() => reportPhishing(selectedEmail!.id)}
							>
								<AlertTriangle class="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="rounded-full"
								title="Απάντηση"
								onclick={() => {
									toast.success('Απάντηση εστάλη!');
									onAction('reply-email', { id: selectedEmail!.id });
								}}
							>
								<Reply class="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="rounded-full"
								title="Προώθηση"
								onclick={() => {
									toast.success('Προώθηση εστάλη!');
									onAction('forward-email', { id: selectedEmail!.id });
								}}
							>
								<Forward class="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="rounded-full"
								title="Διαγραφή"
								onclick={() => deleteEmail(selectedEmail!.id)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
					</div>
					<div class="mt-4 flex items-center gap-3">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-medium text-white {avatarColor(
								selectedEmail.sender
							)}"
						>
							{senderName(selectedEmail.sender).charAt(0).toUpperCase()}
						</div>
						<div class="min-w-0 text-sm">
							<div class="flex items-baseline gap-2">
								<span class="font-bold text-slate-900">{senderName(selectedEmail.sender)}</span>
								{#if senderAddress(selectedEmail.sender)}
									<span class="truncate text-xs text-slate-500"
										>&lt;{senderAddress(selectedEmail.sender)}&gt;</span
									>
								{/if}
							</div>
							<div class="text-xs text-slate-500">προς εμένα</div>
						</div>
					</div>
				</div>

				<div class="flex-1 font-sans leading-relaxed whitespace-pre-wrap text-slate-700">
					{selectedEmail.body}
				</div>

				{#if selectedEmail.hasAttachment}
					<div class="mt-6 border-t pt-4">
						<h4 class="mb-2 text-sm font-bold text-slate-700">Συνημμένα</h4>
						<button
							class="group flex w-64 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
							title="Λήψη συνημμένου"
							onclick={downloadAttachment}
						>
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600"
							>
								<FileText class="h-5 w-5" />
							</div>
							<div class="min-w-0 flex-1 text-left">
								<div class="truncate text-sm font-medium text-slate-800">photos.zip</div>
								<div class="text-xs text-slate-500">2.4 MB</div>
							</div>
							<div
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
							>
								<Download class="h-4 w-4" />
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
