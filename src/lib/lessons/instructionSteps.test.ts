import { describe, it, expect } from 'vitest';
import { parseInstructionSteps } from './instructionSteps';

describe('parseInstructionSteps', () => {
	it('keeps a one-line instruction as plain intro text', () => {
		expect(parseInstructionSteps('Ανοίξτε το Excel.')).toEqual({
			intro: 'Ανοίξτε το Excel.',
			steps: []
		});
	});

	it('turns numbered lines into steps, without their numbers', () => {
		expect(parseInstructionSteps('1. Κάντε δεξί κλικ.\n2. Επιλέξτε «Μετονομασία».')).toEqual({
			intro: '',
			steps: ['Κάντε δεξί κλικ.', 'Επιλέξτε «Μετονομασία».']
		});
	});

	it('keeps a lead-in sentence above the steps', () => {
		expect(parseInstructionSteps('Ανοίξτε το Word:\n1. Πατήστε «Έναρξη».\n2. Πατήστε «Word».')).toEqual({
			intro: 'Ανοίξτε το Word:',
			steps: ['Πατήστε «Έναρξη».', 'Πατήστε «Word».']
		});
	});

	it('accepts "1)" numbering and stray blank lines', () => {
		expect(parseInstructionSteps('1) Ένα\n\n2) Δύο\n')).toEqual({
			intro: '',
			steps: ['Ένα', 'Δύο']
		});
	});

	it('leaves text with a number that is not a list alone', () => {
		const text = 'Γράψτε 2.5 στο κελί A1.\nΜετά πατήστε Enter.';
		expect(parseInstructionSteps(text)).toEqual({ intro: text, steps: [] });
	});
});
