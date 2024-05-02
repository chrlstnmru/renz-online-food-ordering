import { db } from '$lib/server/db';
import { productsTable, variantsTable } from '$lib/server/db/schema/ProductSchema';
import { basketItemsTable, basketTable, usersTable } from '$lib/server/db/schema/UserSchema';
import type { BasketEntry } from '$lib/server/types';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = locals.session;
	const user = session?.user.userId
		? (await db.select().from(usersTable).where(eq(usersTable.id, session.user.userId)).limit(1))[0]
		: null;

	async function getBasketEntries() {
		if (!session) return [];

		const query = await db
			.select({
				id: basketItemsTable.id,
				product: {
					name: productsTable.name,
					price: productsTable.price
				},
				variant: {
					name: variantsTable.name,
					price: variantsTable.price
				},
				quantity: basketItemsTable.quantity
			})
			.from(basketTable)
			.leftJoin(basketItemsTable, eq(basketItemsTable.basketId, basketTable.id))
			.leftJoin(productsTable, eq(productsTable.id, basketItemsTable.productId))
			.leftJoin(variantsTable, eq(variantsTable.id, basketItemsTable.variantId))
			.where(eq(basketTable.userId, session.user.userId));

		const result = query.reduce((acc, item) => {
			if (!item.id) return acc;
			// @ts-ignore
			acc.push({ ...item });

			return acc;
		}, [] as BasketEntry[]);

		return result as BasketEntry[];
	}

	return { user, session, basketSummary: getBasketEntries() };
};
