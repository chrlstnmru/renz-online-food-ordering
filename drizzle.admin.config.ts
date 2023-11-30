import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema/AdminSchema.ts',
	out: './drizzle/admin',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.SUPABASE_DB_URI as string
	},
	verbose: true,
	schemaFilter: ['admin']
});
