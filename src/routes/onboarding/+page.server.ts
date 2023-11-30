import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { onboardingFormSchema } from '$lib/server/validation';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema/UserSchema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals: { session } }) => {
	if (session?.user.onboarded) {
		throw redirect(302, '/home');
	}

	const onboardingForm = superValidate(onboardingFormSchema);

	return { onboardingForm };
};

export const actions: Actions = {
	default: async ({ request, locals: { session }, cookies }) => {
		const form = await superValidate(request, onboardingFormSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await db
				.update(usersTable)
				.set({
					...form.data,
					onboarded: true
				})
				.where(eq(usersTable.id, session?.user.userId!));
		} catch (error) {
			if (error instanceof Error) {
				if ((error as any).code === '23505') {
					return message(form, { type: 'error', content: 'Email already exists.' });
				}
			}
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong. Please try again.' });
		}

		return message(form, { type: 'success', content: 'Account created successfully.' });
	}
};
