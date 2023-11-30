import { dev } from '$app/environment';
import { pool } from '$lib/server/db';
import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { pg } from '@lucia-auth/adapter-postgresql';

export type UserAuth = typeof userAuth;
export type AdminAuth = typeof adminAuth;

export const userAuth = lucia({
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	adapter: pg(pool, {
		user: 'users',
		session: 'user_sessions',
		key: 'user_keys'
	}),
	sessionCookie: {
		expires: false,
		name: 'user-auth-session'
	},
	getUserAttributes: (data) => {
		return { image: data.image, onboarded: data.onboarded };
	}
});

export const adminAuth = lucia({
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	adapter: pg(pool, {
		user: '"admin"."users"',
		session: '"admin"."sessions"',
		key: '"admin"."keys"'
	}),
	getUserAttributes: (data) => {
		return {
			username: data.username,
			email: data.email
		};
	},
	sessionCookie: {
		expires: false,
		name: 'admin-auth-session'
	}
});
