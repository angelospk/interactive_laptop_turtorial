<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let seeding = $state(false);
	let toggling = $state<string | null>(null);

	async function toggleLesson(lessonId: string, enabled: boolean) {
		toggling = lessonId;
		try {
			const res = await fetch('/api/admin/lessons/toggle', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId, enabled })
			});

			if (!res.ok) throw new Error('Failed to toggle lesson');

			toast.success(`Lesson ${enabled ? 'enabled' : 'disabled'}`);
			await invalidateAll();
		} catch (error) {
			console.error(error);
			toast.error('Error toggling lesson');
			// Revert UI state if needed (invalidateAll handles this)
		} finally {
			toggling = null;
		}
	}

	async function seedDatabase() {
		if (!confirm('Are you sure? This will add missing lessons.')) return;

		seeding = true;
		try {
			const res = await fetch('/api/admin/seed', {
				method: 'POST'
			});

			if (!res.ok) throw new Error('Failed to seed database');

			const result = await res.json();
			toast.success(`Seeded: ${result.inserted} inserted, ${result.skipped} skipped`);
			await invalidateAll();
		} catch (error) {
			console.error(error);
			toast.error('Error seeding database');
		} finally {
			seeding = false;
		}
	}
</script>

<div class="container mx-auto p-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Admin Dashboard</h1>
			<p class="text-slate-500">Manage lessons and content</p>
		</div>
		<div class="flex gap-4">
			<Button variant="outline" href="/admin/statistics">Στατιστικά</Button>
			<Button variant="outline" onclick={seedDatabase} disabled={seeding}>
				{seeding ? 'Seeding...' : 'Seed Database'}
			</Button>
			<form action="/admin/logout" method="POST" class="inline">
				<Button variant="ghost" type="submit">Logout</Button>
			</form>
			<Button variant="ghost" href="/">Back to App</Button>
		</div>
	</div>

	<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium text-slate-500">Total Lessons</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.totalLessons}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium text-slate-500">Enabled</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-green-600">{data.enabledCount}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium text-slate-500">Disabled</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-slate-400">
					{data.totalLessons - data.enabledCount}
				</div>
			</CardContent>
		</Card>
	</div>

	<div class="space-y-8">
		{#each Object.entries(data.lessonsByModule) as [moduleId, lessons]}
			<div class="rounded-lg border bg-card text-card-foreground shadow-sm">
				<div class="flex items-center justify-between border-b p-6">
					<h2 class="text-xl font-semibold capitalize">{moduleId}</h2>
					<span class="text-sm text-slate-500">{lessons.length} lessons</span>
				</div>
				<div class="p-6">
					<div class="grid gap-4">
						{#each lessons as lesson (lesson.id)}
							<div
								class="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50"
							>
								<div class="flex items-center gap-4">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-mono text-xs font-bold"
									>
										{lesson.orderIndex + 1}
									</div>
									<div>
										<div class="font-medium">{lesson.titleKey}</div>
										<div class="text-xs text-slate-500">{lesson.lessonType}</div>
									</div>
								</div>
								<div class="flex items-center gap-4">
									<span
										class="text-xs font-medium {lesson.enabled
											? 'text-green-600'
											: 'text-slate-400'}"
									>
										{lesson.enabled ? 'Active' : 'Disabled'}
									</span>
									<Switch
										checked={lesson.enabled}
										disabled={toggling === lesson.id}
										onCheckedChange={(checked) => toggleLesson(lesson.id, checked)}
									/>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
