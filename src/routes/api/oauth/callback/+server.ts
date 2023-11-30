import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { User } from 'lucia';
import { userAuth } from '$lib/server/auth';
import { dev } from '$app/environment';
import { stringEmpty } from '$lib/utils/helpers';
import { validateGoogleCallback } from '$lib/server/auth/google';
import { validateFacebookCallback } from '$lib/server/auth/facebook';
import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema/UserSchema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
	const [oauthProvider, state, redirectUrl] = decodeURIComponent(
		url.searchParams.get('state') ?? ''
	).split('+');
	const code = url.searchParams.get('code') ?? '';

	if (!oauthProvider || !state || oauthProvider === '' || state === '') {
		throw error(400, `Invalid oauth request`);
	}

	let user: User | null = null;

	if (oauthProvider === 'google') {
		user = await validateGoogleCallback(cookies, code, state);
	} else if (oauthProvider === 'facebook') {
		user = await validateFacebookCallback(cookies, code, state);
	}

	if (!user) {
		throw error(400, `OAuth user not found`);
	}

	const [status] = await db
		.selectDistinct({ onboarded: usersTable.onboarded })
		.from(usersTable)
		.where(eq(usersTable.id, user.userId))
		.limit(1);
	locals.onboarded = status.onboarded;

	const session = await userAuth.createSession({
		userId: user.userId,
		attributes: {}
	});
	const sessionCookie = userAuth.createSessionCookie(session);
	cookies.set(sessionCookie.name, sessionCookie.value, {
		secure: !dev,
		httpOnly: true,
		path: '/'
	});

	const redirectTo = !stringEmpty(redirectUrl) ? redirectUrl : '/home';
	throw redirect(302, `/${redirectTo.slice(1)}`);
};
