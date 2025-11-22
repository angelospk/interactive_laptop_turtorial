import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);
console.log('TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'Set' : 'Not Set');

export default defineConfig({
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    dialect: 'turso',
    dbCredentials: {
        // For development, uses local.db
        // For production migrations, set TURSO_DATABASE_URL in env
        url: process.env.TURSO_DATABASE_URL || './local.db',
        authToken: process.env.TURSO_AUTH_TOKEN,
    }
});
