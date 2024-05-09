import { SECRET_KEY } from '$env/static/private';
import { db } from '$lib/server/db';
import { tokensTable, usersTable } from '$lib/server/db/schema/UserSchema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import jwt from 'jsonwebtoken';
import { userAuth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return new Response('Invalid token', { status: 400 });
	}

	try {
		const validToken = jwt.verify(token, SECRET_KEY) as { userId: string };
		const [dbToken] = await db
			.selectDistinct()
			.from(tokensTable)
			.where(eq(tokensTable.token, token));

		if (!dbToken) {
			return new Response('Invalid token', { status: 400 });
		}

		await db.update(usersTable).set({ verified: true }).where(eq(usersTable.id, validToken.userId));

		const session = await userAuth.createSession({ userId: validToken.userId, attributes: {} });
		const sessionCookie = userAuth.createSessionCookie(session);
		cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return new Response('Token expired', { status: 400 });
		}
	}

	throw redirect(302, '/home');
};
