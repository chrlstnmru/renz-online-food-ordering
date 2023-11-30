import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema/*.ts',
	out: './drizzle/public',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.SUPABASE_DB_URI as string
	},
	verbose: true
});
