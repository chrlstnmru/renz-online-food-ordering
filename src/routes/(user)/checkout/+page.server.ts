import { orderInformationForm } from '$lib/formValidation';
import { message, superValidate } from 'sveltekit-superforms/client';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { customerOrderItemsTable, customerOrdersTable } from '$lib/server/db/schema/UserSchema';
import { generateID } from '$lib/utils/helpers';
import type { InferInsertModel } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const orderForm = await superValidate(orderInformationForm);

	return {
		orderForm
	};
};

export const actions: Actions = {
	validateOrderInfo: async (event) => {
		const form = await superValidate(event, orderInformationForm.omit({ referenceNo: true }));

		if (!form.valid) {
			return fail(400, { form });
		}

		return message(form, { type: 'success', content: 'Order information validated.' });
	},
	placeOrder: async (event) => {
		const form = await superValidate(event, orderInformationForm);

		console.log(form.data);

		if (!form.valid) {
			return fail(400, { form });
		}

		const orderId = await db.transaction(async (tx) => {
			const [order] = await tx
				.insert(customerOrdersTable)
				.values({
					id: generateID(),
					...form.data
				})
				.returning();

			if (!order) {
				return message(form, { type: 'error', content: 'Something went wrong' });
			}

			const items: InferInsertModel<typeof customerOrderItemsTable>[] = form.data.items.map(
				(item) => ({
					id: generateID(),
					orderId: order.id,
					productName: item.productName,
					variantName: item.variantName ?? 'Regular',
					quantity: item.quantity,
					total: item.total
				})
			);

			await tx.insert(customerOrderItemsTable).values(items).returning();

			return order.id;
		});

		throw redirect(302, '/checkout?success&orderId=' + orderId);
	}
};
