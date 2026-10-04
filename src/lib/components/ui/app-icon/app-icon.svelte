<script lang="ts">
	import { cn } from '$lib/utils';

	/**
	 * Deterministic app-icon tile for the OS simulators. The lesson config still
	 * carries an emoji (`icon`) — that stays the contract and the fallback — but
	 * for the apps every lesson uses (Finder, Safari, Mail, Phone, Camera, …) a
	 * small inline SVG glyph on a platform-coloured tile replaces it, so the Dock
	 * and home screens look like the real thing instead of a row of emoji.
	 *
	 * Purely decorative: the wrapper is `aria-hidden`; the owning button keeps
	 * the accessible name. The caller passes the tile shape (squircle / circle)
	 * and size through `class`; the component owns colour and glyph.
	 */
	let {
		id,
		kind,
		emoji,
		platform,
		fallbackClass,
		class: className
	}: {
		id: string;
		kind?: string;
		/** Config emoji, rendered only when no vector glyph is known for the app. */
		emoji: string;
		platform: 'mac' | 'ios' | 'android';
		/** Tile background used with the emoji fallback (the config's `color`). */
		fallbackClass?: string;
		class?: string;
	} = $props();

	// Gradient ids must be unique per instance — two tiles on one page would
	// otherwise share (and the second silently reuse) the first one's <defs>.
	const uid = $props.id();

	type Glyph =
		| 'finder'
		| 'safari'
		| 'chrome'
		| 'mail'
		| 'notes'
		| 'settings'
		| 'calculator'
		| 'phone'
		| 'messages'
		| 'viber'
		| 'facetime'
		| 'camera'
		| 'photos'
		| 'appstore'
		| 'playstore'
		| 'assistant'
		| 'trash';

	const BY_ID: Record<string, Glyph> = {
		finder: 'finder',
		safari: 'safari',
		chrome: 'chrome',
		mail: 'mail',
		notes: 'notes',
		settings: 'settings',
		calculator: 'calculator',
		phone: 'phone',
		messages: 'messages',
		viber: 'viber',
		facetime: 'facetime',
		camera: 'camera',
		photos: 'photos',
		trash: 'trash'
	};

	const glyph = $derived.by((): Glyph | null => {
		if (BY_ID[id]) return BY_ID[id];
		switch (kind) {
			case 'browser':
				return platform === 'android' ? 'chrome' : 'safari';
			case 'store':
				return platform === 'ios' ? 'appstore' : 'playstore';
			case 'finder':
			case 'notes':
			case 'settings':
			case 'phone':
			case 'messages':
			case 'viber':
			case 'camera':
			case 'assistant':
				return kind;
			default:
				return null;
		}
	});

	// Tile colours per platform: iOS/mac use vertical gradients (Apple's icons are
	// lit from above), Android uses flat Material colours.
	const TILE: Record<Glyph, string> = $derived({
		finder: 'bg-[#1e6fe8]',
		safari: 'bg-white',
		chrome: 'bg-white',
		mail: 'bg-gradient-to-b from-[#3fa8ff] to-[#0a60ff]',
		notes: 'bg-white',
		settings:
			platform === 'android' ? 'bg-[#e8eaed]' : 'bg-gradient-to-b from-[#a9abb1] to-[#66686e]',
		calculator: 'bg-[#2c2c2e]',
		phone: platform === 'android' ? 'bg-[#1a73e8]' : 'bg-gradient-to-b from-[#5ee36d] to-[#1cb438]',
		messages:
			platform === 'android' ? 'bg-[#1a73e8]' : 'bg-gradient-to-b from-[#5ee36d] to-[#1cb438]',
		viber: 'bg-[#7360f2]',
		facetime: 'bg-gradient-to-b from-[#5ee36d] to-[#1cb438]',
		camera:
			platform === 'android' ? 'bg-[#3c4043]' : 'bg-gradient-to-b from-[#a9abb1] to-[#66686e]',
		photos: 'bg-white',
		appstore: 'bg-gradient-to-b from-[#2bb3ff] to-[#0a6cff]',
		playstore: 'bg-white',
		assistant:
			platform === 'android' ? 'bg-white' : 'bg-gradient-to-br from-[#1b1b3a] to-[#0b0b1a]',
		trash: 'bg-transparent'
	});

	const PHOTOS_PETALS = [
		'#f8c42c',
		'#f3922b',
		'#ee4a3f',
		'#d85a9c',
		'#7b61d6',
		'#3a8ef6',
		'#2db36f',
		'#9ecb3b'
	];
</script>

<span
	aria-hidden="true"
	data-app-icon={glyph ?? 'emoji'}
	class={cn(
		'relative flex items-center justify-center overflow-hidden leading-none',
		glyph ? TILE[glyph] : (fallbackClass ?? 'bg-white/90'),
		className
	)}
>
	{#if glyph === 'finder'}
		<svg viewBox="0 0 24 24" class="h-full w-full">
			<rect x="0" y="0" width="12" height="24" fill="#e9f2fc" />
			<rect x="12" y="0" width="12" height="24" fill="#1e6fe8" />
			<path
				d="M12 2.5c2.4 0 3.6 4 3.6 9.5s-1.2 9.5-3.6 9.5"
				fill="none"
				stroke="#0f4fb8"
				stroke-width=".9"
			/>
			<rect x="7.2" y="8" width="1.6" height="4" rx=".8" fill="#1a1a1a" />
			<rect x="15.2" y="8" width="1.6" height="4" rx=".8" fill="#fff" />
			<path
				d="M6.5 15.5c1.4 1.6 3.3 2.4 5.5 2.4s4.1-.8 5.5-2.4"
				fill="none"
				stroke="#1a1a1a"
				stroke-width="1.3"
				stroke-linecap="round"
			/>
		</svg>
	{:else if glyph === 'safari'}
		<svg viewBox="0 0 24 24" class="h-[82%] w-[82%]">
			<defs>
				<linearGradient id={`safari-dial-${uid}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stop-color="#3fb0ff" />
					<stop offset="1" stop-color="#0a66e4" />
				</linearGradient>
			</defs>
			<circle cx="12" cy="12" r="11" fill={`url(#safari-dial-${uid})`} />
			<circle
				cx="12"
				cy="12"
				r="9.6"
				fill="none"
				stroke="#fff"
				stroke-width="1.3"
				stroke-dasharray=".6 1.9"
				opacity=".9"
			/>
			<g transform="rotate(45 12 12)">
				<path d="M12 3.2 14 12h-4z" fill="#ff3b30" />
				<path d="M12 20.8 10 12h4z" fill="#f2f2f7" />
			</g>
		</svg>
	{:else if glyph === 'chrome'}
		<svg viewBox="0 0 24 24" class="h-[78%] w-[78%]">
			<circle cx="12" cy="12" r="11" fill="#fff" />
			<path d="M12 12 3.7 7.2A9.6 9.6 0 0 1 21.6 9.6H12z" fill="#ea4335" />
			<path d="M12 12h9.6a9.6 9.6 0 0 1-13.8 8.1z" fill="#fbbc04" />
			<path d="M12 12 7.8 20.1A9.6 9.6 0 0 1 3.7 7.2z" fill="#34a853" />
			<circle cx="12" cy="12" r="4.6" fill="#fff" />
			<circle cx="12" cy="12" r="3.6" fill="#4285f4" />
		</svg>
	{:else if glyph === 'mail'}
		<svg viewBox="0 0 24 24" class="h-[62%] w-[62%]" fill="#fff">
			<path
				d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
			/>
		</svg>
	{:else if glyph === 'notes'}
		<svg viewBox="0 0 24 24" class="h-full w-full">
			<rect x="0" y="0" width="24" height="24" fill="#fff" />
			<rect x="0" y="0" width="24" height="6.5" fill="#f7d94c" />
			<g fill="#c9c9cf">
				<rect x="3.5" y="10" width="17" height="1.1" rx=".55" />
				<rect x="3.5" y="14" width="17" height="1.1" rx=".55" />
				<rect x="3.5" y="18" width="11" height="1.1" rx=".55" />
			</g>
		</svg>
	{:else if glyph === 'settings'}
		<svg
			viewBox="0 0 24 24"
			class="h-[70%] w-[70%]"
			fill={platform === 'android' ? '#5f6368' : '#2c2c2e'}
		>
			<path
				d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"
			/>
		</svg>
	{:else if glyph === 'calculator'}
		<svg viewBox="0 0 24 24" class="h-[64%] w-[64%]">
			<rect x="4" y="4" width="16" height="4.5" rx="1" fill="#f2f2f7" />
			<g fill="#8e8e93">
				<circle cx="6.5" cy="12.5" r="1.4" />
				<circle cx="12" cy="12.5" r="1.4" />
				<circle cx="6.5" cy="17.5" r="1.4" />
				<circle cx="12" cy="17.5" r="1.4" />
			</g>
			<g fill="#ff9f0a">
				<circle cx="17.5" cy="12.5" r="1.4" />
				<circle cx="17.5" cy="17.5" r="1.4" />
			</g>
		</svg>
	{:else if glyph === 'phone'}
		<svg viewBox="0 0 24 24" class="h-[60%] w-[60%]" fill="#fff">
			<path
				d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"
			/>
		</svg>
	{:else if glyph === 'messages'}
		<svg viewBox="0 0 24 24" class="h-[62%] w-[62%]" fill="#fff">
			{#if platform === 'android'}
				<path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
			{:else}
				<path
					d="M12 3C6.5 3 2 6.6 2 11c0 2.2 1.1 4.2 2.9 5.6-.2 1.3-.8 2.6-1.9 3.6 2-.2 3.8-.9 5.1-1.9 1.2.4 2.5.7 3.9.7 5.5 0 10-3.6 10-8S17.5 3 12 3z"
				/>
			{/if}
		</svg>
	{:else if glyph === 'viber'}
		<svg viewBox="0 0 24 24" class="h-[64%] w-[64%]">
			<path
				d="M12 2.5C6.8 2.5 3 5.9 3 10.5c0 2.6 1.2 4.8 3.2 6.2V21l3.3-2.3c.8.2 1.6.3 2.5.3 5.2 0 9-3.4 9-8.5s-3.8-8-9-8z"
				fill="#fff"
			/>
			<path
				d="M9.2 8.1c.3-.3.7-.3 1 0l1 1.3c.2.3.2.7-.1 1l-.6.5c.4 1 1.2 1.8 2.2 2.3l.5-.6c.3-.3.7-.3 1-.1l1.3 1c.3.3.3.7 0 1l-.6.7c-.5.5-1.3.6-2 .3a8.3 8.3 0 0 1-4.3-4.4c-.3-.7-.2-1.5.3-2z"
				fill="#7360f2"
			/>
		</svg>
	{:else if glyph === 'facetime'}
		<svg viewBox="0 0 24 24" class="h-[62%] w-[62%]" fill="#fff">
			<path
				d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"
			/>
		</svg>
	{:else if glyph === 'camera'}
		<svg
			viewBox="0 0 24 24"
			class="h-[62%] w-[62%]"
			fill={platform === 'android' ? '#fff' : '#1c1c1e'}
		>
			<path
				d="M9 2 7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.17L15 2H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
			/>
			<circle cx="12" cy="12" r="3.2" />
		</svg>
	{:else if glyph === 'photos'}
		<svg viewBox="0 0 24 24" class="h-[80%] w-[80%]">
			{#each PHOTOS_PETALS as colour, i (colour)}
				<ellipse
					cx="12"
					cy="7.2"
					rx="2.7"
					ry="4.8"
					fill={colour}
					opacity=".85"
					transform={`rotate(${i * 45} 12 12)`}
				/>
			{/each}
		</svg>
	{:else if glyph === 'appstore'}
		<svg
			viewBox="0 0 24 24"
			class="h-[66%] w-[66%]"
			fill="none"
			stroke="#fff"
			stroke-width="2.2"
			stroke-linecap="round"
		>
			<path d="M8.2 18.5 15.5 5.5" />
			<path d="M15.8 18.5 8.5 5.5" />
			<path d="M4 15h16" />
			<path d="M6.3 18.5l1.3-2.3" />
			<path d="M17.7 18.5l-1.3-2.3" />
		</svg>
	{:else if glyph === 'playstore'}
		<svg viewBox="0 0 24 24" class="h-[64%] w-[64%]">
			<path d="M4 3.2 14.2 12 4 20.8V3.2z" fill="#2196f3" />
			<path d="M4 3.2 14.2 12l3-3L5.3 2.7A1.2 1.2 0 0 0 4 3.2z" fill="#4caf50" />
			<path d="M4 20.8 14.2 12l3 3-11.9 6.3a1.2 1.2 0 0 1-1.3-.5z" fill="#f44336" />
			<path d="M17.2 9 14.2 12l3 3 3.3-1.8c.8-.5.8-1.9 0-2.4L17.2 9z" fill="#ffc107" />
		</svg>
	{:else if glyph === 'assistant'}
		<svg viewBox="0 0 24 24" class="h-[64%] w-[64%]">
			{#if platform === 'android'}
				<circle cx="8" cy="12" r="5.5" fill="#4285f4" />
				<circle cx="17" cy="8" r="2.2" fill="#ea4335" />
				<circle cx="17.5" cy="15" r="3.3" fill="#fbbc04" />
				<circle cx="16" cy="21" r="1.6" fill="#34a853" />
			{:else}
				<defs>
					<radialGradient id={`siri-orb-${uid}`} cx=".35" cy=".35" r=".8">
						<stop offset="0" stop-color="#ff7ad9" />
						<stop offset=".5" stop-color="#7a5cff" />
						<stop offset="1" stop-color="#2bd1ff" />
					</radialGradient>
				</defs>
				<circle cx="12" cy="12" r="9.5" fill={`url(#siri-orb-${uid})`} />
			{/if}
		</svg>
	{:else if glyph === 'trash'}
		<svg viewBox="0 0 24 24" class="h-[82%] w-[82%]">
			<defs>
				<linearGradient id={`trash-body-${uid}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stop-color="#e5e5ea" />
					<stop offset="1" stop-color="#9a9aa0" />
				</linearGradient>
			</defs>
			<path
				d="M5.5 7.5h13l-1.2 12.3a1.5 1.5 0 0 1-1.5 1.4H8.2a1.5 1.5 0 0 1-1.5-1.4z"
				fill={`url(#trash-body-${uid})`}
			/>
			<rect x="4" y="4.6" width="16" height="2.4" rx="1.2" fill="#c7c7cc" />
			<rect x="9.5" y="2.8" width="5" height="2.4" rx="1.2" fill="#c7c7cc" />
			<g stroke="#6e6e73" stroke-width=".9" stroke-linecap="round">
				<path d="M9 10v8.5" />
				<path d="M12 10v8.5" />
				<path d="M15 10v8.5" />
			</g>
		</svg>
	{:else}
		<span class="relative">{emoji}</span>
	{/if}
</span>
