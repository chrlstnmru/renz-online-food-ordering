import { adminExists, createAdmin } from '$lib/server/helpers';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms/server';
import { adminSetupForm } from '$lib/server/validation';
import { adminAuth } from '$lib/server/auth';
import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async ({}) => {
	const hasAdmin = await adminExists();
	if (hasAdmin) throw redirect(302, '/_admin');

	const setupForm = superValidate(adminSetupForm);
	return { setupForm };
});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, adminSetupForm);

		const hasAdmin = await adminExists();
		if (hasAdmin)
			return message(form, { type: 'error', content: 'Invalid form.' }, { status: 409 });

		if (!form.valid)
			return message(form, { type: 'error', content: 'Invalid form.' }, { status: 400 });

		try {
			const { username, email, password } = form.data;
			const admin = await createAdmin({ username, email, password });

			const session = await adminAuth.createSession({
				userId: admin.userId,
				attributes: {}
			});
			const sessionCookie = adminAuth.createSessionCookie(session);
			cookies.set(sessionCookie.name, sessionCookie.value);
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' }, { status: 500 });
		}

		return message(form, { type: 'success', content: 'Admin created.' });
	}
};
