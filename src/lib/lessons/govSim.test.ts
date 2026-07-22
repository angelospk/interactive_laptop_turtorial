import { describe, it, expect } from 'vitest';
import { parseGovSimConfig } from './govSim';
import { govLessons } from '$lib/db/seeds/gov-lessons';

/**
 * Isolated contract for the gov-simulation config parser + seed. Run in isolation:
 *   bunx vitest run src/lib/lessons/govSim.test.ts
 */
describe('parseGovSimConfig', () => {
	it('accepts every seeded gov lesson config', () => {
		expect(govLessons.length).toBeGreaterThan(0);
		for (const l of govLessons) {
			expect(() => parseGovSimConfig(l.config), `lesson ${l.id}`).not.toThrow();
		}
	});

	it('every seeded gov lesson uses the gov-simulation lessonType', () => {
		for (const l of govLessons) {
			expect(l.lessonType, `lesson ${l.id}`).toBe('gov-simulation');
		}
	});

	it('seeds form one chained prerequisite line', () => {
		expect(govLessons[0].requiredLessonId).toBeNull();
		for (let i = 1; i < govLessons.length; i++) {
			expect(govLessons[i].requiredLessonId, `lesson ${govLessons[i].id}`).toBe(
				govLessons[i - 1].id
			);
		}
	});

	it('rejects a non-object config', () => {
		expect(() => parseGovSimConfig(null)).toThrow();
		expect(() => parseGovSimConfig('nope')).toThrow();
	});

	it('rejects an unsupported goal', () => {
		expect(() =>
			parseGovSimConfig({ goal: 'mac-quit-app', startScreen: 'login', prompt: 'x' })
		).toThrow(/supported goal/);
	});

	it('rejects a missing prompt', () => {
		expect(() =>
			parseGovSimConfig({ goal: 'gov-login', startScreen: 'login', prompt: '  ' })
		).toThrow(/non-empty prompt/);
	});

	it('enforces goal ↔ startScreen reachability', () => {
		expect(() =>
			parseGovSimConfig({ goal: 'gov-login', startScreen: 'services', prompt: 'x' })
		).toThrow(/reachable/);
	});

	it('requires a targetServiceId present in services for gov-find-service', () => {
		expect(() =>
			parseGovSimConfig({
				goal: 'gov-find-service',
				startScreen: 'services',
				prompt: 'x',
				services: [{ id: 'a', label: 'A' }],
				targetServiceId: 'missing'
			})
		).toThrow(/targetServiceId/);
	});

	it('rejects duplicate service ids', () => {
		expect(() =>
			parseGovSimConfig({
				goal: 'gov-find-service',
				startScreen: 'services',
				prompt: 'x',
				services: [
					{ id: 'a', label: 'A' },
					{ id: 'a', label: 'B' }
				],
				targetServiceId: 'a'
			})
		).toThrow(/duplicate service id/);
	});

	it('requires a certificate with title & filename for the download screen', () => {
		expect(() =>
			parseGovSimConfig({ goal: 'download-file', startScreen: 'certificate', prompt: 'x' })
		).toThrow(/certificate/);
		expect(() =>
			parseGovSimConfig({
				goal: 'download-file',
				startScreen: 'certificate',
				prompt: 'x',
				certificate: { title: 'T', filename: 'f.pdf' }
			})
		).not.toThrow();
	});
});
