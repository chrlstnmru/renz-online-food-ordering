import { db } from '$lib/server/db';
import { reviewsTable, usersTable } from '$lib/server/db/schema/UserSchema';
import { and, eq, getTableColumns, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { productsTable } from '$lib/server/db/schema/ProductSchema';
import { PUBLIC_ASSETS_URL } from '$env/static/public';
import { deleteReviewFormSchema } from '$lib/server/validation';
import { message, superValidate } from 'sveltekit-superforms/server';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { session } }) => {
	const deleteReviewForm = superValidate(deleteReviewFormSchema);

	async function getReviews() {
		const { productId, ...columns } = getTableColumns(reviewsTable);
		const data = await db
			.select({
				...columns,
				product: { id: productsTable.id, name: productsTable.name },
				user: {
					id: usersTable.id,
					name: sql<string>`concat(${usersTable.firstName},
						case when ${usersTable.middleName} is not null then concat(' ', ${usersTable.middleName}, ' ') else ' '  end,
						${usersTable.lastName})`.as('recipient'),
					image: usersTable.image
				},
				total: sql<number>`cast(count(*) over() as integer)`
			})
			.from(reviewsTable)
			.innerJoin(productsTable, eq(productsTable.id, reviewsTable.productId))
			.innerJoin(usersTable, eq(usersTable.id, reviewsTable.userId))
			.where(eq(reviewsTable.userId, session!.user.userId));

		return data.map((item) => {
			let imageURL: string | null = null;
			if (item.user.image) {
				imageURL = new URL(item.user.image, PUBLIC_ASSETS_URL).toString();
			}
			item.user.image = imageURL;
			return item;
		});
	}

	return { reviews: getReviews(), deleteReviewForm };
};

export const actions: Actions = {
	deleteReview: async ({ request, locals: { session } }) => {
		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const form = await superValidate(request, deleteReviewFormSchema);

		if (!form.valid) {
			return message(form, { type: 'error', content: 'Invalid form.' });
		}

		try {
			const result = await db
				.delete(reviewsTable)
				.where(
					and(eq(reviewsTable.id, form.data.reviewId), eq(reviewsTable.userId, session.user.userId))
				)
				.returning();

			if (result.length === 0) {
				const error = new Error();
				error.name = 'NO_REVIEW';
				error.message = 'No review found.';
				throw error;
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'NO_REVIEW') {
					return message(form, { type: 'error', content: 'No review found.' });
				}
			}
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' });
		}

		return message(form, { type: 'success', content: 'Review has been deleted.' });
	}
};
