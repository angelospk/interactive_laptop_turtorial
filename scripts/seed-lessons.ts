// @ts-nocheck
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/lib/db/schema.ts';
import { allLessons } from '../src/lib/db/seeds/index.ts';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';

config({ path: '.env' });

// Setup simplified client for script
const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

async function seed() {
    console.log('🌱 Starting database seed...');
    console.log(`📚 Total lessons to seed: ${allLessons.length}`);

    let inserted = 0;
    let skipped = 0;
    let updated = 0;

    for (const lesson of allLessons) {
        try {
            // Check if lesson already exists
            const existing = await db.query.lessons.findFirst({
                where: eq(schema.lessons.id, lesson.id)
            });

            if (existing) {
                // Update existing lesson to ensure new config/type is applied
                await db.update(schema.lessons)
                    .set(lesson)
                    .where(eq(schema.lessons.id, lesson.id));
                updated++;
                console.log(`🔄 Updated: ${lesson.id}`);
            } else {
                await db.insert(schema.lessons).values(lesson);
                inserted++;
                console.log(`✅ Inserted: ${lesson.id}`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${lesson.id}:`, error);
        }
    }

    console.log('\n🎉 Seeding complete!');
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Total: ${allLessons.length}`);
}

seed();
