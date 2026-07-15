<script lang="ts">
	import MobileSimLesson from '$lib/components/lessons/interactive/MobileSimLesson.svelte';

	/**
	 * Dev playground for the mobile simulator (no DB involved): renders the
	 * dial-a-number lesson in both variants side by side. Not linked anywhere.
	 */
	const apps = (variant: 'android' | 'ios') => [
		{ id: 'phone', label: 'Τηλέφωνο', icon: '📞', kind: 'phone', color: 'bg-green-100' },
		{ id: 'messages', label: 'Μηνύματα', icon: '💬', color: 'bg-blue-100' },
		variant === 'ios'
			? { id: 'facetime', label: 'FaceTime', icon: '📹', color: 'bg-emerald-100' }
			: { id: 'viber', label: 'Viber', icon: '💜', color: 'bg-purple-100' },
		{ id: 'camera', label: 'Κάμερα', icon: '📷', color: 'bg-slate-100' },
		{ id: 'photos', label: 'Φωτογραφίες', icon: '🖼️', color: 'bg-amber-100' },
		{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️', color: 'bg-slate-200' }
	];

	const lesson = (variant: 'android' | 'ios') =>
		({
			id: `demo-${variant}-call`,
			moduleId: variant === 'ios' ? 'iphone' : 'android',
			lessonKey: 'demo-call',
			titleKey: variant === 'ios' ? 'iphone_lesson2_title' : 'android_lesson2_title',
			descriptionKey: null,
			difficulty: 'beginner',
			orderIndex: 0,
			lessonType: 'mobile-sim',
			enabled: true,
			requiredLessonId: null,
			createdAt: new Date(),
			config: {
				goal: 'mobile-dial-number',
				variant,
				prompt: 'Άνοιξε το Τηλέφωνο και κάλεσε το 210 1234567.',
				apps: apps(variant),
				dockAppIds: ['phone', 'messages', 'camera'],
				targetAppId: 'phone',
				targetNumber: '2101234567',
				successMessage: 'Μπράβο! Έκανες την πρώτη σου κλήση.',
				hint: 'Πάτησε πρώτα το πράσινο εικονίδιο «Τηλέφωνο».'
			}
		}) as never;

	const noop = () => {};
</script>

<div class="grid gap-8 p-6 lg:grid-cols-2">
	<section>
		<h2 class="mb-2 text-center text-lg font-bold">Android</h2>
		<MobileSimLesson lesson={lesson('android')} onComplete={noop} onBack={noop} />
	</section>
	<section>
		<h2 class="mb-2 text-center text-lg font-bold">iOS</h2>
		<MobileSimLesson lesson={lesson('ios')} onComplete={noop} onBack={noop} />
	</section>
</div>
