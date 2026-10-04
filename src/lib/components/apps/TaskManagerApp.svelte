<script lang="ts">
	import { toast } from 'svelte-sonner';

	/**
	 * Windows «Διαχείριση εργασιών» (Task Manager), Processes tab only. The list
	 * comes from the lesson config so a lesson can mark one program as frozen
	 * («Δεν αποκρίνεται»). Semantic event: end-task { appId }.
	 */
	type Task = { id: string; name: string; status: string };

	let { config = {}, onAction } = $props<{
		config?: { taskManagerApps?: Task[] };
		onAction: (action: string, data?: Record<string, unknown>) => void;
	}>();

	let ended = $state<string[]>([]);
	let selectedId = $state<string | null>(null);
	const tasks = $derived((config.taskManagerApps ?? []).filter((t: Task) => !ended.includes(t.id)));

	function endTask() {
		const task = tasks.find((t: Task) => t.id === selectedId);
		if (!task) return;
		ended = [...ended, task.id];
		selectedId = null;
		onAction('end-task', { appId: task.id });
		toast.success(`Το «${task.name}» τερματίστηκε`);
	}
</script>

<div class="flex h-full flex-col bg-white text-sm">
	<div class="flex items-center justify-between border-b bg-slate-50 px-4 py-2">
		<h3 class="font-semibold">Διεργασίες</h3>
		<button
			type="button"
			disabled={!selectedId}
			onclick={endTask}
			class="rounded border px-3 py-1.5 font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
		>
			Τερματισμός εργασίας
		</button>
	</div>
	<table class="w-full">
		<thead>
			<tr class="border-b text-left text-xs text-slate-500">
				<th class="px-4 py-2 font-normal">Όνομα</th>
				<th class="px-4 py-2 font-normal">Κατάσταση</th>
			</tr>
		</thead>
		<tbody>
			{#each tasks as task (task.id)}
				<tr
					class="cursor-pointer border-b {selectedId === task.id
						? 'bg-blue-100'
						: 'hover:bg-slate-50'}"
					aria-selected={selectedId === task.id}
					tabindex="0"
					onclick={() => (selectedId = task.id)}
					onkeydown={(e) => e.key === 'Enter' && (selectedId = task.id)}
				>
					<td class="px-4 py-2">{task.name}</td>
					<td
						class="px-4 py-2 {task.status === 'Δεν αποκρίνεται'
							? 'font-semibold text-red-600'
							: 'text-slate-500'}">{task.status}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
