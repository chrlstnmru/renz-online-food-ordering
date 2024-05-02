import { db } from '$lib/server/db';
import { customerOrderItemsTable, customerOrdersTable } from '$lib/server/db/schema/UserSchema';
import { withPagination, withSearch } from '$lib/server/helpers';
import type { Paginated, UserOrder } from '$lib/server/types';
import { rejectOrderFormSchema, updateOrderFormSchema } from '$lib/server/validation';
import { fail } from '@sveltejs/kit';
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const orderForm = superValidate(updateOrderFormSchema);
	const rejectForm = superValidate(rejectOrderFormSchema);

	const search = url.searchParams.get('search');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 11;
	const paymentFilter: string[] = JSON.parse(url.searchParams.get('paymentFilter') ?? '[]');
	const statusFilter: string[] = JSON.parse(url.searchParams.get('statusFilter') ?? '[]');

	async function getOrders() {
		const subquery = db
			.selectDistinct({
				id: customerOrdersTable.id,
				refno: customerOrdersTable.referenceNo,
				recipient: sql<string>`concat(${customerOrdersTable.firstName},
					case when ${customerOrdersTable.middleName} is not null then concat(' ', ${customerOrdersTable.middleName}, ' ') else ' '  end,
					${customerOrdersTable.lastName})`.as('recipient'),
				description: sql<string>`
						concat(${customerOrderItemsTable.quantity},'x ') ||
						concat(${customerOrderItemsTable.productName},' (') ||
						concat(${customerOrderItemsTable.variantName},')')
					`.as('description'),
				total: customerOrderItemsTable.total,
				verified: customerOrdersTable.verified,
				status: customerOrdersTable.status,
				rejectReason: customerOrdersTable.rejectReason,
				createdAt: customerOrdersTable.createdAt,
				updatedAt: customerOrdersTable.updatedAt
			})
			.from(customerOrdersTable)
			.innerJoin(
				customerOrderItemsTable,
				eq(customerOrdersTable.id, customerOrderItemsTable.orderId)
			)
			.orderBy(desc(customerOrdersTable.updatedAt));
		const orderQuery = subquery.$dynamic();

		let query = withSearch(orderQuery, `%`, [customerOrdersTable.id]);

		const verifiedfilter = paymentFilter.map((f) => {
			if (f === 'true') return true;
			if (f === 'false') return false;
		});

		const hasStatusFilter = statusFilter.length > 0;
		const hasVerifiedFilter = verifiedfilter.length > 0;

		if (hasStatusFilter && hasVerifiedFilter && search) {
			query = query.where(
				and(
					// @ts-expect-error any
					inArray(customerOrdersTable.status, statusFilter),
					// @ts-expect-error any
					inArray(customerOrdersTable.verified, verifiedfilter),
					// @ts-expect-error any
					or(ilike(customerOrdersTable.id, `%${search}%`), ilike(subquery.recipient, `%${search}%`))
				)
			);
		} else if (hasStatusFilter && hasVerifiedFilter) {
			query = query.where(
				and(
					// @ts-expect-error any
					inArray(customerOrdersTable.status, statusFilter),
					// @ts-expect-error any
					inArray(customerOrdersTable.verified, verifiedfilter)
				)
			);
		} else if (hasStatusFilter && search) {
			query = query.where(
				and(
					// @ts-expect-error any
					inArray(customerOrdersTable.status, statusFilter),
					// @ts-expect-error any
					or(ilike(customerOrdersTable.id, `%${search}%`), ilike(subquery.recipient, `%${search}%`))
				)
			);
		} else if (hasVerifiedFilter && search) {
			query = query.where(
				and(
					// @ts-expect-error any
					inArray(customerOrdersTable.verified, verifiedfilter),
					// @ts-expect-error any
					or(ilike(customerOrdersTable.id, `%${search}%`), ilike(subquery.recipient, `%${search}%`))
				)
			);
		} else if (hasVerifiedFilter) {
			query = withSearch(query, verifiedfilter, [customerOrdersTable.verified]);
		} else if (hasStatusFilter) {
			query = withSearch(query, statusFilter, [customerOrdersTable.status]);
		} else if (search) {
			// @ts-expect-error any
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
			await db
				.update(customerOrdersTable)
				.set({ status, verified })
				.where(eq(customerOrdersTable.id, orderId));
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
				.update(customerOrdersTable)
				.set({ status: 'rejected', rejectReason: form.data.reason, updatedAt: sql`now()` })
				.where(eq(customerOrdersTable.id, orderId));
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
