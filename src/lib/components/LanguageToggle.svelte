<script lang="ts">
	import { setLocale, getLocale } from '$lib/paraglide/runtime';
	import { Button } from '$lib/components/ui/button';

	const LOCALE_KEY = 'preferred-locale';

	let currentLocale = $state(getLocale());

	function switchTo(locale: 'el' | 'en') {
		setLocale(locale);
		currentLocale = locale;
		if (typeof window !== 'undefined') {
			localStorage.setItem(LOCALE_KEY, locale);
		}
	}
</script>

<div class="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
	<Button
		variant={currentLocale === 'el' ? 'default' : 'ghost'}
		size="sm"
		onclick={() => switchTo('el')}
		class="px-3 py-1 text-sm font-medium"
	>
		EL
	</Button>
	<Button
		variant={currentLocale === 'en' ? 'default' : 'ghost'}
		size="sm"
		onclick={() => switchTo('en')}
		class="px-3 py-1 text-sm font-medium"
	>
		EN
	</Button>
</div>
