import { db } from '$lib/server/db';
import { orderItemsTable, ordersTable } from '$lib/server/db/schema/UserSchema';
import { eq, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import type { Order } from '$lib/server/types';
import { message, superValidate } from 'sveltekit-superforms/client';
import { cancelOrderFormSchema } from '$lib/server/validation';

export const load: PageServerLoad = async ({ locals: { session } }) => {
	const cancelOrderForm = superValidate(cancelOrderFormSchema);
	async function getOrders() {
		// query orders
		const data = await db
			.select({
				id: ordersTable.id,
				description: sql<string>`
				concat(${orderItemsTable.quantity},'x ') ||
				concat(${orderItemsTable.productName},' (') ||
				concat(${orderItemsTable.variantName},')')
				`,
				total: orderItemsTable.total,
				rejectReason: ordersTable.rejectReason,
				status: ordersTable.status,
				verified: ordersTable.verified,
				createdAt: ordersTable.createdAt,
				updatedAt: ordersTable.updatedAt
			})
			.from(ordersTable)
			.innerJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.orderId))
			.where(eq(ordersTable.userId, session!.user.userId));

		// reduce data
		const reduced = data
			.reduce((orderList, item) => {
				if (!orderList.has(item.id)) {
					orderList.set(item.id, { ...item, description: [] });
				}
				const info = orderList.get(item.id)!;
				info.description.push(item.description);

				return orderList;
			}, new Map<string, Order>())
			.values();

		// return data
		const result: Order[] = Array.from(reduced);
		return result;
	}
	return { cancelOrderForm, orders: getOrders() };
};

export const actions: Actions = {
	cancelOrder: async ({ request }) => {
		const form = await superValidate(request, cancelOrderFormSchema);

		if (!form.valid) {
			return message(form, { type: 'error', content: 'Order does not exist.' });
		}

		try {
			const [currentStatus] = await db
				.selectDistinct({ status: ordersTable.status })
				.from(ordersTable)
				.where(eq(ordersTable.id, form.data.orderId))
				.limit(1);
			if (currentStatus.status === 'rejected') {
				return message(form, { type: 'error', content: 'Order does not exist.' });
			}
			await db
				.update(ordersTable)
				.set({ status: 'cancelled' })
				.where(eq(ordersTable.id, form.data.orderId));
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' });
		}

		return message(form, { type: 'success', content: 'Order cancelled.' });
	}
};
