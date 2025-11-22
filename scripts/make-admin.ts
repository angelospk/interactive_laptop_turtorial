import { db, users } from '../src/lib/db/client';
import { eq } from 'drizzle-orm';

const username = process.argv[2];

if (!username) {
    console.error('Please provide a username');
    process.exit(1);
}

async function makeAdmin() {
    console.log(`Promoting ${username} to admin...`);

    const [user] = await db.select().from(users).where(eq(users.username, username));

    if (!user) {
        console.error('User not found');
        process.exit(1);
    }

    await db.update(users).set({ isAdmin: true }).where(eq(users.id, user.id));
    console.log(`✅ ${username} is now an admin!`);
}

makeAdmin();
