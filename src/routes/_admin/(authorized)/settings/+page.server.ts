import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { changeAdminInfoSchema, changeAdminPasswordSchema } from '$lib/server/validation';
import { fail } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/auth';
import { LuciaError } from 'lucia';
import { db } from '$lib/server/db';
import { adminsTable } from '$lib/server/db/schema/AdminSchema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals: { session } }) => {
	const changePasswordForm = superValidate(changeAdminPasswordSchema);
	const changeAdminInfoForm = superValidate(changeAdminInfoSchema);

	return { changePasswordForm, changeAdminInfoForm, session };
};

export const actions: Actions = {
	changePassword: async ({ request, locals: { session } }) => {
		const form = await superValidate(request, changeAdminPasswordSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await adminAuth.useKey('username', session!.user.username, form.data.oldPassword);
			await adminAuth.updateKeyPassword('username', session!.user.username, form.data.newPassword);
		} catch (error) {
			if (error instanceof LuciaError) {
				if (error.message === 'AUTH_INVALID_PASSWORD') {
					return message(form, { type: 'error', content: 'Invalid old password.' });
				}
				if (error.message === 'AUTH_INVALID_KEY_ID') {
					return message(form, { type: 'error', content: 'Invalid user data.' });
				}
			}
			console.error(error);
			return message(form, {
				type: 'error',
				content: 'Something went wrong. Please try again later.'
			});
		}

		return message(form, { type: 'success', content: 'Password changed successfully.' });
	},
	updateAdminInfo: async ({ request, locals: { session } }) => {
		const form = await superValidate(request, changeAdminInfoSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const { username, email, password } = form.data;
			await adminAuth.useKey('username', session!.user.username, password);

			await db
				.update(adminsTable)
				.set({ username, email })
				.where(eq(adminsTable.id, session!.user.userId));
		} catch (error) {
			if (error instanceof LuciaError) {
				if (error.message === 'AUTH_INVALID_PASSWORD') {
					return message(form, { type: 'error', content: 'Invalid password.' });
				}
				if (error.message === 'AUTH_INVALID_KEY_ID') {
					return message(form, { type: 'error', content: 'Invalid user data.' });
				}
			}
			console.error(error);
			return message(form, {
				type: 'error',
				content: 'Something went wrong. Please try again later.'
			});
		}

		return message(form, { type: 'success', content: 'Admin information updated successfully.' });
	}
};
