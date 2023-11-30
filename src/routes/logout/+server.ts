import { userAuth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, cookies, locals, url }) => {
	const session = await locals.auth.validate();
	const redirectTo = `/${url.searchParams.get('redirectTo')?.slice(1) ?? 'login'}`;

	if (!session) {
		throw redirect(302, redirectTo);
	}

	await userAuth.invalidateSession(session.sessionId);
	const blankSessionCookie = userAuth.createSessionCookie(null);
	cookies.set(blankSessionCookie.name, blankSessionCookie.value);

	throw redirect(302, redirectTo);
};
