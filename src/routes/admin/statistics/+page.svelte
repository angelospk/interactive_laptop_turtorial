<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	// Calculate module completion rates
	const moduleCompletionRates = $derived(
		data.moduleStats.map((mod: any) => ({
			...mod,
			completionRate:
				mod.totalLessons > 0
					? ((mod.completedCount / (mod.totalLessons * data.totalUsers || 1)) * 100).toFixed(1)
					: '0.0'
		}))
	);

	// Get top performing lesson and lowest performing lesson
	const sortedLessons = $derived(
		[...data.lessonStats].sort((a: any, b: any) => b.totalCompletions - a.totalCompletions)
	);
	const mostCompletedLesson = $derived(sortedLessons[0]);
	const leastCompletedLesson = $derived(sortedLessons.filter((l: any) => l.enabled).reverse()[0]);

	// Calculate average user progress
	const avgLessonsPerUser = $derived(
		data.totalUsers > 0 ? (data.totalCompletedLessons / data.totalUsers).toFixed(1) : '0.0'
	);
</script>

<div class="container mx-auto p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Στατιστικά Χρηστών</h1>
		<p class="text-slate-500">Συνολική πρόοδος και αναλυτικά στοιχεία μαθημάτων</p>
	</div>

	<!-- Overall Stats Cards -->
	<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium text-slate-500">Σύνολο Χρηστών</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.totalUsers}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium text-slate-500">Σύνολο Μαθημάτων</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.totalLessons}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium text-slate-500">Ποσοστό Ολοκλήρωσης</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-green-600">{data.overallCompletionRate}%</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium text-slate-500">Μέσος Όρος Μαθημάτων</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{avgLessonsPerUser} <span class="text-sm text-slate-500">ανά χρήστη</span>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Per-Module Statistics -->
	<div class="mb-8">
		<h2 class="mb-4 text-2xl font-bold">Στατιστικά ανά Ενότητα</h2>
		<div class="grid gap-4">
			{#each moduleCompletionRates as module}
				<Card>
					<CardHeader>
						<CardTitle class="capitalize">{module.moduleId}</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="grid grid-cols-3 gap-4">
							<div>
								<div class="text-sm text-slate-500">Μαθήματα</div>
								<div class="text-xl font-bold">{module.totalLessons}</div>
							</div>
							<div>
								<div class="text-sm text-slate-500">Ολοκληρώθηκαν</div>
								<div class="text-xl font-bold text-green-600">{module.completedCount}</div>
							</div>
							<div>
								<div class="text-sm text-slate-500">Ποσοστό</div>
								<div class="text-xl font-bold">{module.completionRate}%</div>
							</div>
						</div>
						<div class="mt-2 h-2 w-full rounded-full bg-slate-200">
							<div
								class="h-2 rounded-full bg-green-600 transition-all"
								style="width: {module.completionRate}%"
							></div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>

	<!-- Top/Bottom Lessons -->
	{#if mostCompletedLesson && leastCompletedLesson}
		<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle class="text-lg">Πιο Δημοφιλές Μάθημα</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="font-medium">{mostCompletedLesson.titleKey}</div>
					<div class="text-sm text-slate-500">{mostCompletedLesson.moduleId}</div>
					<div class="mt-2 text-2xl font-bold text-green-600">
						{mostCompletedLesson.totalCompletions} ολοκληρώσεις
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle class="text-lg">Λιγότερο Ολοκληρωμένο Μάθημα</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="font-medium">{leastCompletedLesson.titleKey}</div>
					<div class="text-sm text-slate-500">{leastCompletedLesson.moduleId}</div>
					<div class="mt-2 text-2xl font-bold text-orange-600">
						{leastCompletedLesson.totalCompletions} ολοκληρώσεις
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}

	<!-- Detailed Lesson Table -->
	<div>
		<h2 class="mb-4 text-2xl font-bold">Αναλυτικά Μαθήματα</h2>
		<div class="overflow-x-auto rounded-lg border">
			<table class="w-full">
				<thead class="bg-slate-100">
					<tr>
						<th class="px-4 py-3 text-left text-sm font-medium">Ενότητα</th>
						<th class="px-4 py-3 text-left text-sm font-medium">Μάθημα</th>
						<th class="px-4 py-3 text-center text-sm font-medium">Κατάσταση</th>
						<th class="px-4 py-3 text-center text-sm font-medium">Ολοκληρώσεις</th>
						<th class="px-4 py-3 text-center text-sm font-medium">Προσπάθειες</th>
						<th class="px-4 py-3 text-center text-sm font-medium">Μέσος Βαθμός</th>
					</tr>
				</thead>
				<tbody>
					{#each data.lessonStats as lesson}
						<tr class="border-t hover:bg-slate-50">
							<td class="px-4 py-3 text-sm capitalize">{lesson.moduleId}</td>
							<td class="px-4 py-3 text-sm">{lesson.titleKey}</td>
							<td class="px-4 py-3 text-center">
								<span
									class="rounded-full px-2 py-1 text-xs font-medium {lesson.enabled
										? 'bg-green-100 text-green-700'
										: 'bg-slate-100 text-slate-500'}"
								>
									{lesson.enabled ? 'Ενεργό' : 'Ανενεργό'}
								</span>
							</td>
							<td class="px-4 py-3 text-center text-sm">{lesson.totalCompletions}</td>
							<td class="px-4 py-3 text-center text-sm">{lesson.totalAttempts}</td>
							<td class="px-4 py-3 text-center text-sm">
								{lesson.avgScore ? lesson.avgScore.toFixed(1) : '-'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
