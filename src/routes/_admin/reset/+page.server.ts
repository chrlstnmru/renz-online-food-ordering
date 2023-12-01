import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import jwt from 'jsonwebtoken';
import { adminSetupForm, resetRequestFormSchema } from '$lib/server/validation';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { adminsTable } from '$lib/server/db/schema/AdminSchema';
import { eq } from 'drizzle-orm';
import { ADMIN_SECRET, RESEND_API_KEY } from '$env/static/private';
import { Resend } from 'resend';

const resend = new Resend(RESEND_API_KEY);

export const load: PageServerLoad = async ({ url }) => {
	const requestForm = superValidate(resetRequestFormSchema);

	return { requestForm };
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const form = await superValidate(request, resetRequestFormSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const admins = await db
				.select({ username: adminsTable.username })
				.from(adminsTable)
				.where(eq(adminsTable.email, form.data.email));

			if (admins.length === 0) {
				return message(form, {
					type: 'error',
					content: 'The email you provided does not exist in our database.'
				});
			}

			const resetLink = new URL('verify', url.href);
			const token = jwt.sign({ email: form.data.email }, ADMIN_SECRET, { expiresIn: '1h' });
			resetLink.searchParams.set('token', token);

			const response = await resend.emails.send({
				from: 'crmaru@student.fatima.edu.ph',
				to: form.data.email,
				subject: 'RENZ Admin Reset Password',
				html: `
          <h1>RENZ Admin Reset Password</h1>
          <p>Click the link below to reset your password.</p>
          <a href="${resetLink.toString()}">Reset Password</a>
        `
			});
			console.log(response);
		} catch (error) {
			console.error(error);
			return message(form, {
				type: 'error',
				content: 'Something went wrong. Please try again later.'
			});
		}

		return message(form, { type: 'success', content: 'Reset link has been sent to your email.' });
	}
};
