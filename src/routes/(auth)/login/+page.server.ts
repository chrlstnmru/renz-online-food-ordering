import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { loginFormSchema } from '$lib/formValidation';
import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema/UserSchema';
import { eq } from 'drizzle-orm';
import { userAuth } from '$lib/server/auth';
import { LuciaError } from 'lucia';

export const load: PageServerLoad = async ({ locals: { session } }) => {
	if (session) {
		throw redirect(302, '/home');
	}

	const loginForm = await superValidate(loginFormSchema);

	return { loginForm };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, loginFormSchema);

		if (!form.valid) {
			console.log(form);
			return fail(400, { form });
		}

		const { email, password } = form.data;

		const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
		if (!user) {
			console.log(user);
			form.errors.email = ['Invalid email or password'];
			return fail(400, { form });
		}

		try {
			const authUser = await userAuth.useKey('username', email, password);

			const [user] = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.email, authUser.providerUserId));

			if (!user.verified) {
				form.errors.email = ['Email is not verified. Check your email'];
				console.log(user);
				return fail(400, { form });
			}

			const session = await userAuth.createSession({
				userId: authUser.userId,
				attributes: {}
			});
			const sessionCookie = userAuth.createSessionCookie(session);
			event.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		} catch (error) {
			console.log(error);
			if (error instanceof LuciaError) {
				if (error.message === 'AUTH_INVALID_PASSWORD') {
					return fail(400, { form });
				}
				if (error.message === 'AUTH_INVALID_KEY_ID') {
					return fail(400, { form });
				}
			}
		}

		throw redirect(302, '/home');
	}
};
