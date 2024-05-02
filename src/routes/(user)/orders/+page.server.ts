import { db } from '$lib/server/db';
import { customerOrderItemsTable, customerOrdersTable } from '$lib/server/db/schema/UserSchema';
import { and, eq, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import type { Order } from '$lib/server/types';
import { message, superValidate } from 'sveltekit-superforms/client';
import { cancelOrderFormSchema } from '$lib/server/validation';

export const load: PageServerLoad = async ({ locals: { session }, url }) => {
	const userEmail = url.searchParams.get('email');
	const orderId = url.searchParams.get('orderId');
	const cancelOrderForm = superValidate(cancelOrderFormSchema);

	async function getOrders() {
		const query = db
			.select({
				id: customerOrdersTable.id,
				description: sql<string>`
					concat(${customerOrderItemsTable.quantity},'x ') ||
					concat(${customerOrderItemsTable.productName},' (') ||
					concat(${customerOrderItemsTable.variantName},')')
					`,
				total: customerOrderItemsTable.total,
				rejectReason: customerOrdersTable.rejectReason,
				status: customerOrdersTable.status,
				verified: customerOrdersTable.verified,
				createdAt: customerOrdersTable.createdAt,
				updatedAt: customerOrdersTable.updatedAt
			})
			.from(customerOrdersTable)
			.innerJoin(
				customerOrderItemsTable,
				eq(customerOrdersTable.id, customerOrderItemsTable.orderId)
			)
			.$dynamic();

		const data = session
			? await query.where(eq(customerOrdersTable.userId, session.user.userId))
			: userEmail && orderId
			  ? await query.where(
						and(eq(customerOrdersTable.email, userEmail), eq(customerOrdersTable.id, orderId))
			    )
			  : [];

		console.log(data);

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
	return { cancelOrderForm, orders: await getOrders() };
};

export const actions: Actions = {
	cancelOrder: async ({ request }) => {
		const form = await superValidate(request, cancelOrderFormSchema);

		if (!form.valid) {
			return message(form, { type: 'error', content: 'Order does not exist.' });
		}

		try {
			const [currentStatus] = await db
				.selectDistinct({ status: customerOrdersTable.status })
				.from(customerOrdersTable)
				.where(eq(customerOrdersTable.id, form.data.orderId))
				.limit(1);
			if (currentStatus.status === 'rejected' || currentStatus.status === 'cancelled') {
				return message(form, { type: 'error', content: 'Order does not exist.' });
			} else if (currentStatus.status === 'preparing') {
				return message(form, {
					type: 'error',
					content: 'Your order is being prepared, cancellation is not applicable.'
				});
			}
			await db
				.update(customerOrdersTable)
				.set({ status: 'cancelled' })
				.where(eq(customerOrdersTable.id, form.data.orderId));
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' });
		}

		return message(form, { type: 'success', content: 'Order cancelled.' });
	}
};
