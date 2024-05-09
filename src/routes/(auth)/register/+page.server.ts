import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms/client';
import { registerFormSchema } from '$lib/formValidation';
import { db } from '$lib/server/db';
import { tokensTable, usersTable } from '$lib/server/db/schema/UserSchema';
import { eq } from 'drizzle-orm';
import { userAuth } from '$lib/server/auth';
import jwt from 'jsonwebtoken';
import { NODEMAILER_USER, SECRET_KEY } from '$env/static/private';
import { transporter } from '$lib/server/nodemailer';
import { render } from 'svelte-email';
import EmailVerification from '$lib/components/emails/EmailVerification.svelte';

export const load: PageServerLoad = async ({ locals: { session } }) => {
	if (session) {
		throw redirect(302, '/home');
	}

	const registerForm = await superValidate(registerFormSchema);

	return { registerForm };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, registerFormSchema);

		if (!form) {
			return fail(400, { form });
		}

		return await db.transaction(async (tx) => {
			const [user] = await tx
				.selectDistinct()
				.from(usersTable)
				.where(eq(usersTable.email, form.data.email));

			if (user) {
				form.errors.email = ['Email already in use.'];
				return fail(400, { form });
			}

			const { firstName, lastName, email, password } = form.data;

			const newUser = await userAuth.createUser({
				key: {
					providerId: 'username',
					providerUserId: email,
					password: password
				},
				attributes: {}
			});

			await tx
				.update(usersTable)
				.set({
					firstName,
					lastName,
					onboarded: true
				})
				.where(eq(usersTable.id, newUser.userId));

			const token = jwt.sign({ userId: newUser.userId }, SECRET_KEY);
			await tx.insert(tokensTable).values({ token });

			const attachment = render({
				template: EmailVerification,
				props: { token }
			});

			await transporter.sendMail({
				from: `"RENZ Food Ordering" <${NODEMAILER_USER}>`,
				to: email,
				subject: 'Email Verification',
				html: attachment
			});

			return message(form, { type: 'success', content: 'Email verification link sent.' });
		});
	}
};
