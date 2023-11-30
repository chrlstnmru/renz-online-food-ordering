import { db } from '$lib/server/db';
import {
	basketItemsTable,
	basketTable,
	orderItemsTable,
	ordersTable
} from '$lib/server/db/schema/UserSchema';
import { and, desc, eq, inArray, sql, type InferInsertModel } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { productsTable, variantsTable } from '$lib/server/db/schema/ProductSchema';
import { withPagination } from '$lib/server/helpers';
import type { BasketItem, Paginated } from '$lib/server/types';
import { PUBLIC_ASSETS_URL } from '$env/static/public';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { error, fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { checkoutFormSchema } from '$lib/server/validation';
import { generateNumID } from '$lib/utils/helpers';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = locals.session!;

	const checkoutForm = superValidate(checkoutFormSchema);

	const page = parseInt(url.searchParams.get('page') ?? '1');
	const limit = 10;

	async function getItems() {
		const query = db
			.select({
				id: basketItemsTable.id,
				productId: basketItemsTable.productId,
				productName: productsTable.name,
				quantity: basketItemsTable.quantity,
				variant: {
					name: variantsTable.name,
					price: variantsTable.price
				},
				price: productsTable.price,
				image: productsTable.image,
				createdAt: basketItemsTable.createdAt,
				updatedAt: basketItemsTable.updatedAt,
				count: sql<number>`cast(count(*) over() as integer)`
			})
			.from(basketTable)
			.innerJoin(basketItemsTable, eq(basketItemsTable.basketId, basketTable.id))
			.innerJoin(productsTable, eq(productsTable.id, basketItemsTable.productId))
			.leftJoin(variantsTable, eq(variantsTable.id, basketItemsTable.variantId))
			.where(eq(basketTable.userId, session.user.userId))
			.orderBy(desc(basketItemsTable.createdAt))
			.$dynamic();

		let total = 0;
		const result = await withPagination(query, page, limit);
		const items = result.reduce((acc, item) => {
			if (item.id === null) acc;

			acc.push({
				id: item.id,
				productId: item.productId,
				productName: item.productName,
				quantity: item.quantity,
				variant: item.variant,
				price: item.price,
				image: new URL(item.image!, PUBLIC_ASSETS_URL).toString(),
				createdAt: item.createdAt,
				updatedAt: item.updatedAt
			});
			return acc;
		}, new Array<BasketItem>());

		return {
			items,
			page,
			pages: Math.ceil(total / limit),
			limit,
			total
		} as Paginated<BasketItem>;
	}

	return { items: getItems(), checkoutForm };
};

const updateBasketItemQuantity = zfd.formData({
	id: zfd.text(z.string().min(1)),
	quantity: zfd.numeric(z.number().min(1).max(99))
});

export const actions: Actions = {
	updateQuantity: async ({ request }) => {
		const data = await request.formData();
		const form = updateBasketItemQuantity.safeParse(data);
		console.log(form);

		if (!form.success) return fail(400, { message: 'Invalid form data' });

		const res = await db
			.update(basketItemsTable)
			.set({ quantity: form.data.quantity })
			.where(eq(basketItemsTable.id, form.data.id));

		return { res };
	},
	deleteBasketItem: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id');
		const userId = locals.session?.user.userId!;

		if (!id) return fail(400, { message: 'Invalid form data' });

		const res = await db
			.delete(basketItemsTable)
			.where(
				and(
					eq(basketItemsTable.id, id.toString()),
					inArray(
						basketItemsTable.basketId,
						db
							.select({ id: basketTable.id })
							.from(basketTable)
							.where(eq(basketTable.userId, userId))
					)
				)
			)
			.returning({ id: basketItemsTable.id });

		return { res };
	},
	checkout: async ({ request, locals: { session } }) => {
		if (!session) {
			return error(401, 'Unauthorized');
		}

		const form = await superValidate(request, checkoutFormSchema);
		console.log(form);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Get basket items with info
			const itemInfo = await db
				.select({
					id: basketItemsTable.id,
					name: productsTable.name,
					variant: sql<string>`coalesce(${variantsTable.name}, 'Regular')`,
					price: sql<number>`
					case when ${basketItemsTable.variantId} is null then ${productsTable.price} else ${variantsTable.price} end
				`,
					quantity: basketItemsTable.quantity,
					total: sql<number>`case when ${basketItemsTable.variantId} is null then ${productsTable.price} else ${variantsTable.price} end * ${basketItemsTable.quantity}`
				})
				.from(basketTable)
				.innerJoin(basketItemsTable, eq(basketItemsTable.basketId, basketTable.id))
				.innerJoin(productsTable, eq(productsTable.id, basketItemsTable.productId))
				.leftJoin(variantsTable, eq(variantsTable.id, basketItemsTable.variantId))
				.where(eq(basketTable.userId, session.user.userId));

			const itemIds = itemInfo.map((item) => item.id);
			const total = itemInfo.reduce((acc, item) => (acc += item.price * item.quantity), 0);

			// create order
			const newOrder = await db
				.insert(ordersTable)
				.values({
					id: generateNumID(),
					userId: session.user.userId,
					refno: form.data.refno
				})
				.returning({ id: ordersTable.id });

			// create order items
			const newOrderInfo: InferInsertModel<typeof orderItemsTable>[] = itemInfo.map((item) => {
				return {
					id: generateNumID(),
					orderId: newOrder[0].id,
					productId: item.id,
					productName: item.name,
					variantName: item.variant,
					quantity: item.quantity,
					total: item.total
				};
			});
			await db.insert(orderItemsTable).values(newOrderInfo);

			// delete basket items
			await db.delete(basketItemsTable).where(inArray(basketItemsTable.id, itemIds));
		} catch (error) {
			console.error(error);
			return message(form, {
				type: 'error',
				content: 'An error occured while processing your order.'
			});
		}

		return message(form, { type: 'success', content: 'Your order has been placed.' });
	}
};
