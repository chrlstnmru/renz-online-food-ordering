import { SUPABASE_DB_URI } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import pg from 'pg';
import postgres from 'postgres';

export const pool = new pg.Pool({
	connectionString: SUPABASE_DB_URI,
	ssl: {
		rejectUnauthorized: false
	}
});

const client = postgres(SUPABASE_DB_URI);
export const db = drizzle(client);
