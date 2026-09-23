// The app reads its configuration from .env; without this the admin test runs
// against a password the server does not have.
import 'dotenv/config';
import { defineConfig } from '@playwright/test';

// When E2E_BASE_URL is set, run against an already-running server (e.g. `bun run dev`)
// instead of building+previewing. Useful where the prod build can't run locally.
const externalBase = process.env.E2E_BASE_URL;

export default defineConfig({
	testDir: 'e2e',
	use: { baseURL: externalBase ?? 'http://localhost:4173' },
	webServer: externalBase
		? undefined
		: {
				command: 'npm run build && npm run preview',
				port: 4173
			}
});
