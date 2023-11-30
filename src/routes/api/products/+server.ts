import { db } from '$lib/server/db';
import { categoryTable, productsTable, variantsTable } from '$lib/server/db/schema/ProductSchema';
import { asc, eq, getTableColumns, sql, type PromiseOf, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import type { Paginated, Product } from '$lib/server/types';
import { withPagination, withSearch } from '$lib/server/helpers';
import { PUBLIC_ASSETS_URL } from '$env/static/public';

export const GET: RequestHandler = async ({ url }) => {
	// Pagination
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const limit = parseInt(url.searchParams.get('limit') ?? '10');

	// Filters
	const search = url.searchParams.get('search');
	const category = url.searchParams.get('category');

	// Apply filters
	const { id, ...columns } = getTableColumns(productsTable);
	const selectQuery = db
		.select({
			...columns,
			id: sql<string>`${id}`.as('productId'),
			categoryId: categoryTable.id,
			categoryName: categoryTable.name,
			variantId: variantsTable.id,
			variantName: variantsTable.name,
			variantPrice: variantsTable.price,
			variantDescription: variantsTable.description
		})
		.from(productsTable)
		.leftJoin(categoryTable, eq(productsTable.categoryId, categoryTable.id))
		.leftJoin(variantsTable, eq(productsTable.id, variantsTable.productId))
		.orderBy(asc(productsTable.createdAt))
		.$dynamic();

	let query = withSearch(selectQuery, `%`, [productsTable.name]);

	if (search) {
		console.log('with search');

		query = withSearch(query, `%${search}%`, [productsTable.name]);
	}

	if (category && category !== 'all') {
		console.log('with category');
		query = withSearch(query, `${category}`, [categoryTable.name]);
		if (search) {
			console.log('with search and category');
			query = query.where(
				and(eq(categoryTable.name, `${category}`), eq(productsTable.name, `%${search}%`))
			);
		}
	}

	// Return empty if page is out of bounds
	const filterQuery = query.as('filterQuery');
	const distinctIds = await db.selectDistinct({ id: filterQuery.id }).from(filterQuery);

	const total = distinctIds?.length;

	if (page > total) {
		return new Response(
			JSON.stringify({ items: [], page: page, pages: 0, limit: limit, total: 0 }),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}

	// Assemble Results
	const queryResult = await withPagination(query, page, limit);
	const products = Array.from(
		queryResult
			.reduce((acc, item) => {
				if (!acc.has(item.id)) {
					let imageURL: string | null = null;
					if (item.image) {
						imageURL = new URL(item.image, PUBLIC_ASSETS_URL).toString();
					}

					acc.set(item.id, {
						id: item.id,
						name: item.name,
						price: item.price,
						image: imageURL,
						createdAt: item.createdAt,
						updatedAt: item.updatedAt,
						category: item.categoryId ? { id: item.categoryId, name: item.categoryName! } : null,
						variants: []
					});
				}

				const current = acc.get(item.id)!;
				if (item.variantId) {
					current.variants.push({
						id: item.variantId,
						name: item.variantName!,
						price: item.variantPrice!,
						description: item.variantDescription!
					});
				}

				return acc;
			}, new Map<string, Product>())
			.values()
	);

	const result: Paginated<Product> = {
		items: products,
		page: page,
		pages: Math.ceil(total / limit),
		limit: limit,
		total: total
	};

	const response = new Response(JSON.stringify(result), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache'
		}
	});

	return response;
};
