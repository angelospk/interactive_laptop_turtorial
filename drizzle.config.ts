import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

// console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);
// console.log('TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'Set' : 'Not Set');

const isLocal = !process.env.TURSO_DATABASE_URL?.startsWith('libsql://');

export default defineConfig({
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite', // Use sqlite dialect for file-based db
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL || 'file:local.db',
        // authToken is not needed for local file db
        ...(isLocal ? {} : { authToken: process.env.TURSO_AUTH_TOKEN }),
    }
});
