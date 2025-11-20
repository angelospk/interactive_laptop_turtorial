import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: { adapter: adapter() },
	alias:{
		"@/*": "./src/*",
		"@lib/*": "./src/lib/*",
		"@components/*": "./src/components/*",
		"@routes/*": "./src/routes/*",
		"@stores/*": "./src/stores/*",
		"@types/*": "./src/types/*",
		"@utils/*": "./src/utils/*",
		"@assets/*": "./src/assets/*",
	}
};

export default config;
