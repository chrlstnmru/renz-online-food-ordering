import { NODEMAILER_USER, SECRET_KEY } from '$env/static/private';
import PasswordReset from '$lib/components/emails/PasswordReset.svelte';
import { forgotPasswordFormSchema, resetPasswordFormSchema } from '$lib/formValidation';
import { db } from '$lib/server/db';
import { keysTable, tokensTable } from '$lib/server/db/schema/UserSchema';
import { transporter } from '$lib/server/nodemailer';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { render } from 'svelte-email';
import { message, superValidate } from 'sveltekit-superforms/client';
import type { Actions, PageServerLoad } from './$types';
import { userAuth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url }) => {
	const forgotPasswordForm = await superValidate(forgotPasswordFormSchema);
	const resetPasswordForm = await superValidate(resetPasswordFormSchema);

	let valid = false;

	const token = url.searchParams.get('token');
	if (token) {
		try {
			jwt.verify(token, SECRET_KEY) as { userId: string };

			const [existingToken] = await db
				.select()
				.from(tokensTable)
				.where(eq(tokensTable.token, token));
			valid = !!existingToken;
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				valid = false;
			}
		}
	}

	return { resetPasswordForm, forgotPasswordForm, valid };
};

export const actions: Actions = {
	sendResetLink: async (event) => {
		const form = await superValidate(event, forgotPasswordFormSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		const [user] = await db
			.select()
			.from(keysTable)
			.where(eq(keysTable.id, `username:${form.data.email}`));
		if (!user) {
			form.errors.email = ['Email not found.'];
			return fail(400, { form });
		}

		const token = jwt.sign({ userId: user.userId, email: form.data.email }, SECRET_KEY, {
			issuer: 'renz:password',
			expiresIn: '15m'
		});
		await db.insert(tokensTable).values({ token });

		const attachment = render({
			template: PasswordReset,
			props: { token }
		});

		await transporter.sendMail({
			from: `"RENZ Food Ordering" <${NODEMAILER_USER}>`,
			to: form.data.email,
			subject: 'Password Reset',
			html: attachment
		});

		return message(form, { type: 'success', content: 'Password reset email sent.' });
	},
	resetPassword: async (event) => {
		const token = event.url.searchParams.get('token');
		if (!token) {
			console.log(token);
			throw error(400, 'Invalid token');
		}

		let user: { userId: string; email: string } | undefined;

		try {
			user = jwt.verify(token, SECRET_KEY) as { userId: string; email: string };
		} catch (err) {
			console.log(err);
			if (err instanceof jwt.TokenExpiredError) {
				throw error(400, 'Token expired');
			}
		}

		if (!user) {
			console.log(user);
			throw error(400, 'Invalid token');
		}

		const form = await superValidate(event, resetPasswordFormSchema);

		if (!form.valid) {
			console.log(form);
			return fail(400, { form });
		}
		await userAuth.invalidateAllUserSessions(user.userId);
		await userAuth.updateKeyPassword('username', user.email, form.data.newPassword);

		await db.delete(tokensTable).where(eq(tokensTable.token, token));

		return message(form, { type: 'success', content: 'Password changed successfully.' });
	}
};
