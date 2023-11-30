import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminAuth } from '$lib/server/auth';

export const GET: RequestHandler = async ({ locals, cookies }) => {
	const session = await locals.auth.validate();

	if (!session) {
		throw redirect(302, '/_admin');
	}

	await adminAuth.invalidateSession(session.sessionId);
	cookies.delete('admin-auth-session');

	throw redirect(302, '/_admin');
};
