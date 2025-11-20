<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Derive language from URL
	let currentLang = $derived($page.url.pathname.startsWith('/el') ? 'el' : 'en');

	function toggleLanguage() {
		const currentPath = $page.url.pathname;
		let newPath: any = currentPath;

		if (currentLang === 'el') {
			// Switch to English (remove /el)
			newPath = currentPath.replace(/^\/el/, '') || '/';
		} else {
			// Switch to Greek (add /el)
			if (currentPath === '/') {
				newPath = '/el';
			} else if (!currentPath.startsWith('/el')) {
				newPath = '/el' + currentPath;
			}
		}

		goto(newPath);
	}

	let displayText = $derived(currentLang === 'el' ? 'English' : 'Ελληνικά');
</script>

<Button
	variant="outline"
	size="lg"
	onclick={toggleLanguage}
	class="px-6 py-3 text-lg font-semibold"
>
	🌐 {displayText}
</Button>
