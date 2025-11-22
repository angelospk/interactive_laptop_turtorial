import { db, users } from '../src/lib/db/client';

async function listUsers() {
    const allUsers = await db.select().from(users);
    console.log(allUsers);
}

listUsers();
