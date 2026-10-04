type PracticeStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function practiceAfterCompletion(
	current: string[],
	lesson: { id: string; lessonType: string },
	guidePracticeIds?: string[]
): string[] {
	if (lesson.lessonType === 'guide') return guidePracticeIds ?? current;
	return current.filter((id) => id !== lesson.id);
}

export function readPractice(storage: PracticeStorage, key: string): string[] {
	try {
		const value: unknown = JSON.parse(storage.getItem(key) ?? '[]');
		return Array.isArray(value) && value.every((id) => typeof id === 'string') ? value : [];
	} catch {
		return [];
	}
}

export function savePractice(storage: PracticeStorage, key: string, ids: string[]) {
	try {
		if (ids.length) storage.setItem(key, JSON.stringify(ids));
		else storage.removeItem(key);
	} catch {
		// Practice still works in memory when browser storage is unavailable.
	}
}
