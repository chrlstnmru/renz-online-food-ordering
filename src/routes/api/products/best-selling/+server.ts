import { db } from '$lib/server/db';
import { productsTable } from '$lib/server/db/schema/ProductSchema';
import { asc, desc, eq, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { orderItemsTable, ordersTable, reviewsTable } from '$lib/server/db/schema/UserSchema';
import { PUBLIC_ASSETS_URL } from '$env/static/public';
import type { BestSeller } from '$lib/server/types';

export const GET: RequestHandler = async () => {
	const solds = db
		.select({
			id: ordersTable.id,
			productId: sql<string>`${orderItemsTable.productId}`.as('soldProdId'),
			sold: sql<number>`cast(count(${orderItemsTable.productId}) as integer)`.as('sold')
		})
		.from(orderItemsTable)
		.innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
		.where(eq(ordersTable.status, 'delivered'))
		.groupBy(orderItemsTable.productId, ordersTable.id)
		.as('solds');

	const ratings = db
		.select({
			id: reviewsTable.productId,
			productId: sql<string>`${reviewsTable.productId}`.as('ratingProdId'),
			avgRating: sql<number>`cast(avg(${reviewsTable.rating}) as float)`.as('avgRating')
		})
		.from(reviewsTable)
		.groupBy(reviewsTable.productId)
		.as('ratings');

	const data = await db
		.select({
			id: productsTable.id,
			name: productsTable.name,
			image: productsTable.image,
			price: productsTable.price,
			avegrage: ratings.avgRating,
			sold: solds.sold
		})
		.from(productsTable)
		.leftJoin(ratings, eq(ratings.productId, productsTable.id))
		.leftJoin(solds, eq(solds.productId, productsTable.id))
		.orderBy(asc(solds.sold), asc(ratings.avgRating))
		.limit(5);

	const result = data.map((item) => {
		let imageURL: string | null = null;
		if (item.image) {
			imageURL = new URL(item.image, PUBLIC_ASSETS_URL).toString();
		}
		return {
			...item,
			image: imageURL
		};
	});

	return new Response(JSON.stringify(result));
};
