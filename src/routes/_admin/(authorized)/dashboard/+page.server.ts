import { db } from '$lib/server/db';
import { ordersTable, usersTable } from '$lib/server/db/schema/UserSchema';
import { and, desc, eq, not, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { productsTable } from '$lib/server/db/schema/ProductSchema';

export const load: PageServerLoad = async ({ depends }) => {
	async function getData() {
		const delivered = db
			.select({ delivered: sql<string>`cast(count(*) as integer)` })
			.from(ordersTable)
			.where(eq(ordersTable.status, 'delivered'))
			.as('delivered');
		const cancelled = db
			.select({ cancelled: sql<string>`cast(count(*) as integer)` })
			.from(ordersTable)
			.where(eq(ordersTable.status, 'cancelled'))
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
				id: ordersTable.id,
				refno: ordersTable.refno,
				recipient: sql<string>`concat(${usersTable.firstName},
					case when ${usersTable.middleName} is not null then concat(' ', ${usersTable.middleName}, ' ') else ' '  end,
					${usersTable.lastName})`,
				status: ordersTable.status,
				createdAt: ordersTable.createdAt
			})
			.from(ordersTable)
			.innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
			.orderBy(desc(ordersTable.createdAt))
			.where(
				and(
					not(eq(ordersTable.status, 'delivered')),
					not(eq(ordersTable.status, 'rejected')),
					not(eq(ordersTable.status, 'delivering'))
				)
			)
			.limit(10);
	}

	await getRecentOrders();

	return { dataOverview: getData(), recentOrders: getRecentOrders() };
};
