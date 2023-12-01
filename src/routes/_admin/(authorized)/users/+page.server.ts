import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema/UserSchema';
import { desc, getTableColumns, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { withSearch } from '$lib/server/helpers';
import type { UserData } from './_components/types';
import type { Paginated } from '$lib/server/types';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 11;

	async function getUsers(): Promise<Paginated<UserData>> {
		const { onboarded, ...rest } = getTableColumns(usersTable);
		const subquery = db.$with('users').as(
			db
				.selectDistinct({
					...rest,
					searchTerms: sql<string>`
						concat(${usersTable.id}, ' ') ||
						concat(${usersTable.firstName}, ' ') ||
						concat(${usersTable.middleName}, ' ') ||
						concat(${usersTable.lastName}, ' ') ||
						concat(${usersTable.phone}, ' ') ||
						concat(${usersTable.address}, ' ') ||
						concat(${usersTable.email}, ' ')
					`.as('searchTerms')
				})
				.from(usersTable)
				.orderBy(desc(usersTable.updatedAt))
		);
		const userQuery = db.with(subquery).select().from(subquery).$dynamic();
		// @ts-ignore
		let query = withSearch(userQuery, `%`, [subquery.searchTerms]);

		const filterQuery = query.as('filtered');
		const distinctIds = await db.select({ id: filterQuery.id }).from(filterQuery);
		if (distinctIds.length === 0) {
			return { items: [], limit, page, pages: 0, total: 0 } as Paginated<UserData>;
		}

		if (search) {
			// @ts-ignore
			query = withSearch(userQuery, `%${search}%`, [subquery.searchTerms]);
		}

		const result = await query;

		return {
			items: result,
			limit,
			page,
			pages: 1,
			total: result.length
		};
	}

	return { users: getUsers() };
};
