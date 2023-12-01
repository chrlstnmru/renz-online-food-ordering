import { db } from '$lib/server/db';
import { reviewsTable, usersTable } from '$lib/server/db/schema/UserSchema';
import { desc, eq, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import type { Paginated, UserReview } from '$lib/server/types';

export const GET: RequestHandler = async ({ params, url }) => {
	const limit = parseInt(url.searchParams.get('limit') || '5');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	let query;
	let items: UserReview[] = [];

	try {
		query = await db
			.select({
				id: reviewsTable.id,
				user: {
					id: usersTable.id,
					name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
					image: usersTable.image
				},
				rating: reviewsTable.rating,
				comment: reviewsTable.comment,
				createdAt: reviewsTable.createdAt,
				verified: reviewsTable.verified,
				total: sql<number>`cast(count(*) over() as integer)`
			})
			.from(reviewsTable)
			.where(eq(reviewsTable.productId, params.id))
			.innerJoin(usersTable, eq(usersTable.id, reviewsTable.userId))
			.orderBy(desc(reviewsTable.createdAt))
			.limit(limit)
			.offset(offset);

		if (query.length === 0) {
			const result: Paginated<UserReview> = {
				items: [],
				total: 0,
				limit: limit,
				page: Math.floor(offset / limit) + 1,
				pages: 1
			};

			return new Response(JSON.stringify(result));
		}

		items = query.map((item) => {
			const { total: _, ...data } = item;
			return { ...data };
		});
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'NO_REVIEW') {
				return new Response(JSON.stringify({ error: error.message }), { status: 404 });
			}
		}

		console.error(error);
		return new Response(JSON.stringify({ code: 500, message: 'Something went wrong.' }), {
			status: 500
		});
	}

	const result: Paginated<UserReview> = {
		items: items,
		total: query[0].total,
		limit: limit,
		page: Math.floor(offset / limit) + 1,
		pages: Math.ceil(query[0].total / limit)
	};

	return new Response(JSON.stringify(result), {
		headers: { 'Content-Type': 'application/json' }
	});
};
