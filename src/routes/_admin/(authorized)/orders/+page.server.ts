import { db } from '$lib/server/db';
import { orderItemsTable, ordersTable, usersTable } from '$lib/server/db/schema/UserSchema';
import { and, desc, eq, getTableColumns, ilike, inArray, or, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import type { Paginated, UserOrder } from '$lib/server/types';
import { withPagination, withSearch } from '$lib/server/helpers';
import { message, superValidate } from 'sveltekit-superforms/server';
import { rejectOrderFormSchema, updateOrderFormSchema } from '$lib/server/validation';
import type { Column } from 'postgres';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { fail } from '@sveltejs/kit';
export const load: PageServerLoad = async ({ url }) => {
	const orderForm = superValidate(updateOrderFormSchema);
	const rejectForm = superValidate(rejectOrderFormSchema);

	const search = url.searchParams.get('search');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 11;
	const paymentFilter: string[] = JSON.parse(url.searchParams.get('paymentFilter') ?? '[]');
	const statusFilter: string[] = JSON.parse(url.searchParams.get('statusFilter') ?? '[]');

	async function getOrders() {
		const subquery = db.$with('orders').as(
			db
				.selectDistinct({
					id: ordersTable.id,
					refno: ordersTable.refno,
					recipient: sql<string>`concat(${usersTable.firstName},
					case when ${usersTable.middleName} is not null then concat(' ', ${usersTable.middleName}, ' ') else ' '  end,
					${usersTable.lastName})`.as('recipient'),
					description: sql<string>`
						concat(${orderItemsTable.quantity},'x ') ||
						concat(${orderItemsTable.productName},' (') ||
						concat(${orderItemsTable.variantName},')')
					`.as('description'),
					total: orderItemsTable.total,
					verified: ordersTable.verified,
					status: ordersTable.status,
					rejectReason: ordersTable.rejectReason,
					createdAt: ordersTable.createdAt,
					updatedAt: ordersTable.updatedAt
				})
				.from(ordersTable)
				.innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
				.innerJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.orderId))
				.orderBy(desc(ordersTable.updatedAt))
		);
		const orderQuery = db.with(subquery).select().from(subquery).$dynamic();

		let query = withSearch(orderQuery, `%`, [ordersTable.id]);

		const verifiedfilter = paymentFilter.map((f) => {
			if (f === 'true') return true;
			if (f === 'false') return false;
		});

		const hasStatusFilter = statusFilter.length > 0;
		const hasVerifiedFilter = verifiedfilter.length > 0;

		if (hasStatusFilter && hasVerifiedFilter && search) {
			query = query.where(
				and(
					// @ts-ignore
					inArray(ordersTable.status, statusFilter),
					// @ts-ignore
					inArray(ordersTable.verified, verifiedfilter),
					// @ts-ignore
					or(ilike(ordersTable.id, `%${search}%`), ilike(subquery.recipient, `%${search}%`))
				)
			);
		} else if (hasStatusFilter && hasVerifiedFilter) {
			query = query.where(
				and(
					// @ts-ignore
					inArray(ordersTable.status, statusFilter),
					// @ts-ignore
					inArray(ordersTable.verified, verifiedfilter)
				)
			);
		} else if (hasStatusFilter && search) {
			query = query.where(
				and(
					// @ts-ignore
					inArray(ordersTable.status, statusFilter),
					// @ts-ignore
					or(ilike(ordersTable.id, `%${search}%`), ilike(subquery.recipient, `%${search}%`))
				)
			);
		} else if (hasVerifiedFilter && search) {
			query = query.where(
				and(
					// @ts-ignore
					inArray(ordersTable.verified, verifiedfilter),
					// @ts-ignore
					or(ilike(ordersTable.id, `%${search}%`), ilike(subquery.recipient, `%${search}%`))
				)
			);
		} else if (hasVerifiedFilter) {
			query = withSearch(query, verifiedfilter, [ordersTable.verified]);
		} else if (hasStatusFilter) {
			query = withSearch(query, statusFilter, [ordersTable.status]);
		} else if (search) {
			// @ts-ignore
			query = withSearch(query, `%${search}%`, [subquery.recipient, subquery.id]);
		}

		const filterQuery = query.as('filtered');
		const distinctIds = await db.select({ id: filterQuery.id }).from(filterQuery);

		if (distinctIds.length === 0) {
			return { items: [], limit, page, pages: 0, total: 0 } as Paginated<UserOrder>;
		}

		const data = await withPagination(query, page, limit);

		const reduced = data
			.reduce((orderList, item) => {
				if (!orderList.has(item.id)) {
					orderList.set(item.id, { ...item, description: [] });
				}
				const info = orderList.get(item.id)!;
				info.description.push(item.description);

				return orderList;
			}, new Map<string, UserOrder>())
			.values();

		return {
			items: Array.from(reduced),
			limit,
			page,
			pages: Math.ceil(distinctIds.length / limit),
			total: distinctIds.length
		} as Paginated<UserOrder>;
	}

	return { orders: getOrders(), orderForm, rejectForm };
};

export const actions: Actions = {
	updateOrder: async ({ request }) => {
		const form = await superValidate(request, updateOrderFormSchema);

		if (!form.valid) {
			return message(form, { type: 'error', content: 'Invalid form.' }, { status: 400 });
		}

		try {
			const { orderId, status, verified } = form.data;
			await db.update(ordersTable).set({ status, verified }).where(eq(ordersTable.id, orderId));
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' }, { status: 500 });
		}

		return message(form, {
			type: 'success',
			content: `Order #${form.data.orderId} has been updated.`
		});
	},
	rejectOrder: async ({ request }) => {
		const form = await superValidate(request, rejectOrderFormSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const { orderId } = form.data;
			await db
				.update(ordersTable)
				.set({ status: 'rejected', rejectReason: form.data.reason, updatedAt: sql`now()` })
				.where(eq(ordersTable.id, orderId));
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' }, { status: 500 });
		}

		return message(form, {
			type: 'success',
			content: `Order #${form.data.orderId} has been rejected.`
		});
	}
};
