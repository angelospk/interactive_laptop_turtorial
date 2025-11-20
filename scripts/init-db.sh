#!/bin/bash

# Initialize local SQLite database with Drizzle schema
echo "Initializing local database..."

# Generate migration files
echo "Generating migrations..."
bun run drizzle-kit generate

# Push schema to database  
echo "Pushing schema to local.db..."
bun run drizzle-kit push

echo "✅ Database initialized successfully!"
echo "Local database created at: ./local.db"
echo ""
echo "To view and manage your database, run:"
echo "  bun run db:studio"
