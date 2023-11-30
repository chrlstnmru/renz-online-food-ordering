import { db } from '$lib/server/db';
import { productsTable } from '$lib/server/db/schema/ProductSchema';
import { desc, eq, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { orderItemsTable, ordersTable, reviewsTable } from '$lib/server/db/schema/UserSchema';

export const GET: RequestHandler = async () => {
	const solds = db
		.select({
			productId: orderItemsTable.productId,
			sold: sql<number>`cast(count(${orderItemsTable.id}) as integer)`.as('sold')
		})
		.from(orderItemsTable)
		.innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
		.where(eq(ordersTable.status, 'delivered'))
		.groupBy(orderItemsTable.productId)
		.as('solds');

	const ratings = db
		.select({
			productId: reviewsTable.productId,
			avg: sql<number>`cast(avg(${reviewsTable.rating}) as numeric)`.as('average')
		})
		.from(reviewsTable)
		.innerJoin(orderItemsTable, eq(reviewsTable.productId, reviewsTable.productId))
		.groupBy(reviewsTable.productId)
		.as('ratings');

	const data = await db
		.select({
			id: productsTable.id,
			name: productsTable.name,
			image: productsTable.image,
			price: productsTable.price,
			avegrage: ratings.avg,
			sold: solds.sold
		})
		.from(productsTable)
		.leftJoin(ratings, eq(ratings.productId, productsTable.id))
		.leftJoin(solds, eq(solds.productId, productsTable.id))
		.orderBy(desc(solds.sold))
		.limit(5);

	return new Response(JSON.stringify(data));
};
