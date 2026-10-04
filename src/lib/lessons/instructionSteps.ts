/**
 * Splits a lesson instruction into an optional lead-in and numbered steps, so
 * «1. … 2. …» is shown as a real list instead of one block of text.
 *
 * Steps only count when every line after the first «1.» is numbered; anything
 * else stays plain text, exactly as written.
 */
export interface InstructionSteps {
	intro: string;
	steps: string[];
}

const STEP = /^\s*\d+[.)]\s+(.*)$/;

export function parseInstructionSteps(text: string): InstructionSteps {
	const lines = text.split('\n').filter((line) => line.trim() !== '');
	const first = lines.findIndex((line) => STEP.test(line));
	if (first === -1) return { intro: text, steps: [] };

	const stepLines = lines.slice(first);
	if (!stepLines.every((line) => STEP.test(line))) return { intro: text, steps: [] };

	return {
		intro: lines.slice(0, first).join('\n'),
		steps: stepLines.map((line) => line.match(STEP)![1].trim())
	};
}
