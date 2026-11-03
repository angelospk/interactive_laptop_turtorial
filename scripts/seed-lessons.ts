import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/lib/db/schema.ts';
import { allLessons, allModules } from '../src/lib/db/seeds/index.ts';
import { seedLessons, seedModules } from '../src/lib/db/seedUpsert.ts';
import { config } from 'dotenv';

config({ path: '.env' });

// Setup simplified client for script
const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

async function migrate() {
	console.log('🔧 Running migrations...');
	await client.execute(`
        CREATE TABLE IF NOT EXISTS modules (
            id TEXT PRIMARY KEY,
            title_key TEXT NOT NULL,
            description_key TEXT,
            icon_name TEXT,
            order_index INTEGER NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 1,
            created_at INTEGER NOT NULL DEFAULT (unixepoch())
        )
    `);
	console.log('✅ modules table ready');
}

async function seed() {
	console.log('🌱 Starting database seed...');
	await migrate();

	console.log(`\n📦 Seeding ${allModules.length} modules...`);
	const moduleResult = await seedModules(db, allModules);
	console.log(`   Modules inserted: ${moduleResult.inserted}, updated: ${moduleResult.existing}`);

	console.log(`\n📚 Total lessons to seed: ${allLessons.length}`);
	const lessonResult = await seedLessons(db, allLessons, 'update');

	console.log('\n🎉 Seeding complete!');
	console.log(`   Inserted: ${lessonResult.inserted}`);
	console.log(`   Updated: ${lessonResult.existing}`);
	console.log(`   Total: ${allLessons.length}`);
}

seed();
