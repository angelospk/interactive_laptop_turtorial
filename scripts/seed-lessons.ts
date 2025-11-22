import { db } from '$lib/db/client';
import { lessons } from '$lib/db/schema';
import { allLessons } from '$lib/db/seeds';
import { eq } from 'drizzle-orm';

console.log('🌱 Starting database seed...');
console.log(`📚 Total lessons to seed: ${allLessons.length}`);

let inserted = 0;
let skipped = 0;

for (const lesson of allLessons) {
    // Check if lesson already exists
    const existing = await db.select().from(lessons).where(eq(lessons.id, lesson.id)).get();

    if (existing) {
        skipped++;
        console.log(`⏭️  Skipped (already exists): ${lesson.id}`);
    } else {
        try {
            await db.insert(lessons).values(lesson).run();
            inserted++;
            console.log(`✅ Inserted: ${lesson.id}`);
        } catch (error) {
            console.error(`❌ Error inserting ${lesson.id}:`, error);
        }
    }
}

console.log('\n🎉 Seeding complete!');
console.log(`   Inserted: ${inserted}`);
console.log(`   Skipped: ${skipped}`);
console.log(`   Total: ${allLessons.length}`);
