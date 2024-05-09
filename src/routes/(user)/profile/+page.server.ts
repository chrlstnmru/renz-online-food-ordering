import { message, superValidate } from 'sveltekit-superforms/client';
import type { Actions, PageServerLoad } from './$types';
import { onboardingFormSchema } from '$lib/server/validation';
import { db } from '$lib/server/db';
import { keysTable, usersTable } from '$lib/server/db/schema/UserSchema';
import { and, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const onboardingForm = superValidate(onboardingFormSchema);

	async function getUserProfile() {
		const [profile] = await db
			.selectDistinct()
			.from(usersTable)
			.where(eq(usersTable.id, locals.session?.user.userId ?? 'undefined'))
			.limit(1);
		return profile;
	}

	return { onboardingForm, profile: getUserProfile() };
};

export const actions: Actions = {
	default: async ({ request, locals: { session }, cookies }) => {
		const form = await superValidate(request, onboardingFormSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await db.transaction(async (tx) => {
				const [currentUser] = await tx
					.select()
					.from(usersTable)
					.where(eq(usersTable.id, session?.user.userId!));
				const [user] = await tx
					.update(usersTable)
					.set({
						...form.data
					})
					.where(eq(usersTable.id, session?.user.userId!))
					.returning();

				await tx
					.update(keysTable)
					.set({
						id: `username:${form.data.email}`
					})
					.where(
						and(eq(keysTable.userId, user.id), eq(keysTable.id, `username:${currentUser.email}`))
					);
			});
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong. Please try again.' });
		}

		return message(form, { type: 'success', content: 'Profile updated successfully.' });
	}
};
