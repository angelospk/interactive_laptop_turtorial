import { db, lessons } from '../src/lib/db/client';
import { allLessons } from '../src/lib/db/seeds';
import { sql } from 'drizzle-orm';

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        // Clear existing lessons
        console.log('Deleting existing lessons...');
        await db.delete(lessons);

        // Insert new lessons
        console.log(`Inserting ${allLessons.length} lessons...`);
        await db.insert(lessons).values(allLessons);

        console.log('✅ Seeding complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
