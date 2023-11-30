import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import {
	addProductFormSchema,
	instantOrderFormSchema,
	reviewFormSchema
} from '$lib/server/validation';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	basketItemsTable,
	orderItemsTable,
	ordersTable,
	reviewsTable,
	usersTable
} from '$lib/server/db/schema/UserSchema';
import { generateID, generateNumID } from '$lib/utils/helpers';
import { getUserBasketId } from '$lib/server/helpers';
import { productsTable, variantsTable } from '$lib/server/db/schema/ProductSchema';
import { eq, sql } from 'drizzle-orm';
import type { Product, UserReview } from '$lib/server/types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const addProductForm = superValidate(addProductFormSchema);
	const reviewForm = superValidate(reviewFormSchema);
	const instantOrderForm = superValidate(instantOrderFormSchema);

	async function getProductData() {
		const data = await fetch('/api/products/' + params.id);
		return data.json() as Promise<Product>;
	}

	return { addProductForm, reviewForm, instantOrderForm, product: getProductData() };
};

export const actions: Actions = {
	addToBasket: async ({ request, locals: { session } }) => {
		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const form = await superValidate(request, addProductFormSchema);

		if (!form.valid) {
			return message(form, { type: 'error', content: 'Invalid form.' });
		}

		console.log('add', form.data);

		let product;

		try {
			product = await db
				.selectDistinct({ name: productsTable.name })
				.from(productsTable)
				.where(eq(productsTable.id, form.data.productId))
				.limit(1);
			if (product.length === 0) {
				const error = new Error();
				(error.name = 'NO_PRODUCT'), (error.message = 'No product found.');
				throw error;
			}

			const basketId = await getUserBasketId(form.data.userId);
			const returning = await db
				.insert(basketItemsTable)
				.values({ ...form.data, id: generateID(), basketId })
				.onConflictDoUpdate({
					target: [
						basketItemsTable.basketId,
						basketItemsTable.productId,
						basketItemsTable.variantId
					],
					set: {
						quantity: sql`${basketItemsTable.quantity} + excluded.quantity`
					}
				})
				.returning();

			product = await db
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
				.from(basketItemsTable)
				.leftJoin(productsTable, eq(productsTable.id, basketItemsTable.productId))
				.leftJoin(variantsTable, eq(variantsTable.id, basketItemsTable.variantId))
				.where(eq(basketItemsTable.id, returning[0].id))
				.limit(1);
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'NO_PRODUCT') {
					return message(form, { type: 'error', content: 'No product found.' });
				}
			}

			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' });
		}

		return message(form, {
			type: 'success',
			content: product[0]
		});
	},
	createReview: async ({ request, locals: { session } }) => {
		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const form = await superValidate(request, reviewFormSchema);

		if (!form.valid) {
			console.log(form);

			return message(form, { type: 'error', content: 'Invalid form.' });
		}

		let review: UserReview;

		try {
			const users = await db
				.selectDistinct()
				.from(usersTable)
				.where(eq(usersTable.id, form.data.userId))
				.limit(1);
			const result = await db
				.insert(reviewsTable)
				.values({ ...form.data, id: generateID() })
				.returning();

			review = {
				id: result[0].id,
				user: {
					id: users[0].id,
					name: `${users[0].firstName!} ${users[0].lastName!}`,
					image: users[0].image
				},
				rating: result[0].rating,
				comment: result[0].comment!,
				createdAt: result[0].createdAt,
				verified: result[0].verified
			};
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' });
		}

		return message(form, { type: 'success', content: review });
	},
	instantOrder: async ({ request, locals: { session } }) => {
		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const form = await superValidate(request, instantOrderFormSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// check if product exists
			const [product] = await db
				.selectDistinct({ name: productsTable.name, price: productsTable.price })
				.from(productsTable)
				.where(eq(productsTable.id, form.data.productId))
				.limit(1);

			if (!product) {
				const error = new Error();
				error.name = 'NO_PRODUCT';
				error.message = 'No product found.';
				throw error;
			}

			// check if variant exists
			const [variant] = await db
				.select({ name: variantsTable.name, price: variantsTable.price })
				.from(variantsTable)
				.where(eq(variantsTable.id, `${form.data.variantId ?? ''}`))
				.limit(1);

			// insert order
			const [order] = await db
				.insert(ordersTable)
				.values({
					id: generateNumID(),
					refno: form.data.refno,
					userId: session.user.userId
				})
				.returning({ id: ordersTable.id });
			await db.insert(orderItemsTable).values({
				id: generateID(),
				orderId: order.id,
				productId: form.data.productId,
				productName: product.name,
				variantName: sql<string>`${variant?.name ?? 'Regular'}`,
				quantity: form.data.quantity,
				total: sql<number>`${(variant?.price ?? product.price) * form.data.quantity}`
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'NO_PRODUCT') {
					return message(form, { type: 'error', content: 'No product found.' });
				}
			}
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' });
		}

		return message(form, { type: 'success', content: 'Order has been placed.' });
	}
};
