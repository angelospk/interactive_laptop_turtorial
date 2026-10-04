import { describe, it, expect } from 'vitest';
import { parseScript, stripTags } from './script';

const MD = `# Τίτλος

Προοίμιο που δεν είναι clip.

## common.known.1

> σημείωση για τον παραγωγό
[cheerful] Ωραία!   Αυτό  [pause] το έχετε.

## module5.step.tabs
[calm, warm] Πρώτη γραμμή.
Δεύτερη γραμμή.
`;

describe('stripTags', () => {
	it('removes [tags] and collapses whitespace', () => {
		expect(stripTags('[warm] Γεια [pause]  σας. [light laugh]')).toBe('Γεια σας.');
	});
});

describe('parseScript', () => {
	it('reads one clip per ## heading, skipping the preamble and > notes', () => {
		const clips = parseScript(MD, 'test.md');
		expect([...clips.keys()]).toEqual(['common.known.1', 'module5.step.tabs']);
		expect(clips.get('common.known.1')).toEqual({
			text: '[cheerful] Ωραία!   Αυτό  [pause] το έχετε.',
			caption: 'Ωραία! Αυτό το έχετε.'
		});
	});

	it('joins a multi-line clip into one caption', () => {
		const clip = parseScript(MD, 'test.md').get('module5.step.tabs');
		expect(clip?.caption).toBe('Πρώτη γραμμή. Δεύτερη γραμμή.');
		expect(clip?.text).toBe('[calm, warm] Πρώτη γραμμή.\nΔεύτερη γραμμή.');
	});

	it('rejects a duplicate id, naming it', () => {
		expect(() => parseScript('## a.b\nένα\n## a.b\nδύο', 'x.md')).toThrow(/a\.b/);
	});

	it('rejects an empty clip', () => {
		expect(() => parseScript('## a.b\n> μόνο σημείωση\n## c.d\nκείμενο', 'x.md')).toThrow(/a\.b/);
	});
});
