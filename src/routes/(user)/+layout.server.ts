import { db } from '$lib/server/db';
import { basketItemsTable, basketTable } from '$lib/server/db/schema/UserSchema';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { productsTable, variantsTable } from '$lib/server/db/schema/ProductSchema';
import type { BasketEntry, BasketSummary } from '$lib/server/types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	const session = locals.session;
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

	return { session, basketSummary: getBasketEntries() };
};
