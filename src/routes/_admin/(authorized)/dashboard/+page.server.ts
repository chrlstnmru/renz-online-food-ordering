import { db } from '$lib/server/db';
import { customerOrdersTable, usersTable } from '$lib/server/db/schema/UserSchema';
import { and, desc, eq, not, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { productsTable } from '$lib/server/db/schema/ProductSchema';
import type { BestSeller } from '$lib/server/types';

export const load: PageServerLoad = async ({ fetch }) => {
	async function getData() {
		const delivered = db
			.select({ delivered: sql<string>`cast(count(*) as integer)` })
			.from(customerOrdersTable)
			.where(eq(customerOrdersTable.status, 'delivered'))
			.as('delivered');
		const cancelled = db
			.select({ cancelled: sql<string>`cast(count(*) as integer)` })
			.from(customerOrdersTable)
			.where(eq(customerOrdersTable.status, 'cancelled'))
			.as('cancelled');
		const users = db
			.select({ users: sql<string>`cast(count(*) as integer)` })
			.from(usersTable)
			.as('users');
		const products = db
			.select({ products: sql<string>`cast(count(*) as integer)` })
			.from(productsTable)
			.as('products');

		const [data] = await db.execute(sql`select ${delivered}, ${cancelled}, ${users}, ${products}`);
		return data as { users: number; products: number; delivered: number; cancelled: number };
	}

	async function getRecentOrders() {
		return db
			.select({
				id: customerOrdersTable.id,
				refno: customerOrdersTable.referenceNo,
				recipient: sql<string>`concat(${customerOrdersTable.firstName},
					case when ${customerOrdersTable.middleName} is not null then concat(' ', ${customerOrdersTable.middleName}, ' ') else ' '  end,
					${customerOrdersTable.lastName})`,
				status: customerOrdersTable.status,
				createdAt: customerOrdersTable.createdAt
			})
			.from(customerOrdersTable)
			.orderBy(desc(customerOrdersTable.createdAt))
			.where(
				and(
					not(eq(customerOrdersTable.status, 'delivered')),
					not(eq(customerOrdersTable.status, 'rejected')),
					not(eq(customerOrdersTable.status, 'delivering'))
				)
			)
			.limit(10);
	}

	async function getBestSelling() {
		const res = await fetch('/api/products/best-selling');
		return res.json() as Promise<BestSeller[]>;
	}

	return {
		dataOverview: getData(),
		recentOrders: getRecentOrders(),
		bestSelling: getBestSelling()
	};
};
