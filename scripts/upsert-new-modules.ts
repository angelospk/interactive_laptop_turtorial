import { db } from '../src/lib/db/client.js';
import { seedLessons } from '../src/lib/db/seedUpsert.ts';
import { module3Lessons, module4Lessons, module5Lessons } from '../src/lib/db/seeds/index.js';

console.log('🔧 Upserting Module 3, 4, 5 lessons...');

const lessonsToUpsert = [...module3Lessons, ...module4Lessons, ...module5Lessons];

console.log(`📚 Total lessons to upsert: ${lessonsToUpsert.length}`);

const { inserted, existing } = await seedLessons(db, lessonsToUpsert, 'update');

console.log('\n🎉 Upsert complete!');
console.log(`   Inserted: ${inserted}`);
console.log(`   Updated: ${existing}`);
console.log(`   Total: ${lessonsToUpsert.length}`);
