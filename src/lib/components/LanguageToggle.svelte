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

<!-- Language names, not codes: "EL/EN" meant nothing to the people this is for. -->
<div
	class="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
	role="group"
	aria-label="Γλώσσα / Language"
>
	<Button
		variant={currentLocale === 'el' ? 'default' : 'ghost'}
		onclick={() => switchTo('el')}
		aria-pressed={currentLocale === 'el'}
		lang="el"
		class="min-h-11 px-3 text-base font-medium"
	>
		Ελληνικά
	</Button>
	<Button
		variant={currentLocale === 'en' ? 'default' : 'ghost'}
		onclick={() => switchTo('en')}
		aria-pressed={currentLocale === 'en'}
		lang="en"
		class="min-h-11 px-3 text-base font-medium"
	>
		English
	</Button>
</div>
