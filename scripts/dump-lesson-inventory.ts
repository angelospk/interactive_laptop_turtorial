// Dev utility: dump a JSON inventory of all seeded modules + lessons (id, module, type, title).
import { allModules } from '../src/lib/db/seeds/modules.js';
import { allLessons } from '../src/lib/db/seeds/index.js';

import el from '../messages/el.json';

const t = (key: string | null | undefined) =>
	key ? ((el as Record<string, string>)[key] ?? key) : null;

const modules = allModules.map((m) => ({
	id: m.id,
	title: t(m.titleKey),
	orderIndex: m.orderIndex
}));

const lessons = allLessons.map((l) => ({
	id: l.id,
	moduleId: l.moduleId,
	lessonType: l.lessonType,
	difficulty: l.difficulty,
	title: t(l.titleKey),
	orderIndex: l.orderIndex
}));

console.log(JSON.stringify({ moduleCount: modules.length, lessonCount: lessons.length, modules, lessons }, null, 1));
