import { db } from '../src/lib/db/client.js';
import { lessons } from '../src/lib/db/schema.js';
import {
    module3Lessons,
    module4Lessons,
    module5Lessons
} from '../src/lib/db/seeds/index.js';
import { eq } from 'drizzle-orm';

console.log('🔧 Upserting Module 3, 4, 5 lessons...');

const lessonsToUpsert = [...module3Lessons, ...module4Lessons, ...module5Lessons];

console.log(`📚 Total lessons to upsert: ${lessonsToUpsert.length}`);

let inserted = 0;
let updated = 0;

for (const lesson of lessonsToUpsert) {
    const existing = await db.select().from(lessons).where(eq(lessons.id, lesson.id)).get();

    if (existing) {
        // Update
        await db.update(lessons).set(lesson).where(eq(lessons.id, lesson.id)).run();
        updated++;
        console.log(`✏️  Updated: ${lesson.id} (${lesson.lessonType})`);
    } else {
        // Insert
        await db.insert(lessons).values(lesson).run();
        inserted++;
        console.log(`✅ Inserted: ${lesson.id} (${lesson.lessonType})`);
    }
}

console.log('\n🎉 Upsert complete!');
console.log(`   Inserted: ${inserted}`);
console.log(`   Updated: ${updated}`);
console.log(`   Total: ${lessonsToUpsert.length}`);
