import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The dialog wrapper used to re-export bits-ui primitives with a top-level
// `const Root = DialogPrimitive.Root`. Under SSR with circular module eval the
// primitive is still undefined at that point, so the alias froze as undefined
// and the route 500'd. The fix was a local `dialog-root.svelte` wrapper.
// These wrappers share the same latent pattern; this test freezes the invariant.
const UI_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

const WRAPPERS = [
	'alert-dialog',
	'command',
	'context-menu',
	'drawer',
	'dropdown-menu',
	'form',
	'hover-card',
	'menubar',
	'popover',
	'range-calendar',
	'select',
	'sheet',
	'tooltip'
];

// `const X = SomethingPrimitive.Y;` at the top level of an index.ts
const TOP_LEVEL_ALIAS = /^const\s+\w+(?::[^=]+)?\s*=\s*\w*Primitive\./m;

describe('shadcn-svelte ui wrappers are SSR-safe', () => {
	for (const name of WRAPPERS) {
		it(`${name}: no top-level primitive alias in index.ts`, () => {
			const source = readFileSync(join(UI_DIR, name, 'index.ts'), 'utf8');
			expect(TOP_LEVEL_ALIAS.test(source)).toBe(false);
		});

		// Generous timeout: the first import in each dir compiles a dozen .svelte
		// files, which can exceed the 5s default on a cold transform cache.
		it(`${name}: index.ts imports and every export resolves`, { timeout: 30_000 }, async () => {
			const mod = await import(`../${name}/index.ts`);
			const exported = Object.entries(mod).filter(([key]) => key !== 'default');
			expect(exported.length).toBeGreaterThan(0);
			for (const [key, value] of exported) {
				expect(value, `${name} export ${key} is undefined`).toBeDefined();
			}
		});
	}
});
