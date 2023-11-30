import { adminExists } from '$lib/server/helpers';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms/server';
import { adminLoginForm } from '$lib/server/validation';
import { loadFlash } from 'sveltekit-flash-message/server';
import { LuciaError } from 'lucia';
import { adminAuth } from '$lib/server/auth';

export const load = loadFlash(async ({ locals, url }) => {
	const hasAdmin = await adminExists();
	if (!hasAdmin) throw redirect(302, '/_admin/setup');

	if (locals.session) {
		const redirectTo = url.searchParams.get('redirectTo')?.slice(1) ?? '_admin/dashboard';
		throw redirect(302, `/${redirectTo}`);
	}

	const loginForm = superValidate(adminLoginForm);
	return { loginForm };
});

export const actions: Actions = {
	default: async ({ locals, request, cookies, url }) => {
		if (locals.session) {
			const redirectTo = url.searchParams.get('redirectTo')?.slice(1) ?? '_admin/dashboard';
			throw redirect(302, `/${redirectTo}`);
		}

		// Validate form
		const form = await superValidate(request, adminLoginForm);
		if (!form.valid)
			return message(form, { type: 'error', content: 'Invalid form.' }, { status: 400 });

		try {
			// Validate username and password
			const { username, password } = form.data;
			const key = await adminAuth.useKey('username', username, password);

			// Create session
			const session = await adminAuth.createSession({
				userId: key.userId,
				attributes: {}
			});
			const sessionCookie = adminAuth.createSessionCookie(session);
			cookies.set(sessionCookie.name, sessionCookie.value);
		} catch (error) {
			// Handle incorrect credentials
			if (error instanceof LuciaError) {
				switch (error.message) {
					case 'AUTH_INVALID_KEY_ID':
					case 'AUTH_INVALID_PASSWORD':
						return message(
							form,
							{ type: 'error', content: 'Username/Password is incorrect.' },
							{ status: 400 }
						);
				}
			}

			// Handle other errors
			console.error(error);
			return message(form, { type: 'error', content: 'Authenticated.' });
		}

		return message(form, { type: 'success', content: 'Authenticated.' });
	}
};
