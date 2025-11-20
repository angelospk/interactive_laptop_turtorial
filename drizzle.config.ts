import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        // For development, uses local.db
        // For production migrations, set TURSO_DATABASE_URL in env
        url: process.env.TURSO_DATABASE_URL || './local.db'
    }
});
