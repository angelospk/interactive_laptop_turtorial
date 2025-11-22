import { db, users } from '../src/lib/db/client';

async function createAdmin() {
    console.log('Creating admin user "harold"...');

    await db.insert(users).values({
        username: 'harold',
        displayName: 'Harold',
        isAdmin: true,
        lastLogin: new Date()
    });

    console.log('✅ Admin user "harold" created!');
}

createAdmin();
