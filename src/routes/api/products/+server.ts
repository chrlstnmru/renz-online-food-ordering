import { db } from '$lib/server/db';
import { categoryTable, productsTable, variantsTable } from '$lib/server/db/schema/ProductSchema';
import { asc, eq, getTableColumns, sql, type PromiseOf, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import type { Paginated, Product } from '$lib/server/types';
import { withPagination, withSearch } from '$lib/server/helpers';
import { PUBLIC_ASSETS_URL } from '$env/static/public';
import { orderItemsTable, ordersTable, reviewsTable } from '$lib/server/db/schema/UserSchema';

export const GET: RequestHandler = async ({ url }) => {
	// Pagination
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const limit = parseInt(url.searchParams.get('limit') ?? '10');

	// Filters
	const search = url.searchParams.get('search');
	const category = url.searchParams.get('category');

	// Get ratings
	const totalCommentsQuery = db
		.select({
			productId: sql<string>`${reviewsTable.productId}`.as('totalCommentsProdId'),
			total: sql<number>`count(${reviewsTable.id})`.as('total')
		})
		.from(reviewsTable)
		.groupBy(reviewsTable.productId)
		.as('totalComments');
	const ratingsQuery = db
		.select({
			id: reviewsTable.productId,
			productId: sql<string>`${reviewsTable.productId}`.as('ratingProdId'),
			avgRating: sql<number>`cast(avg(${reviewsTable.rating}) as numeric)`.as('avgRating')
		})
		.from(reviewsTable)
		.groupBy(reviewsTable.productId)
		.as('ratings');

	// Get solds
	const soldsQuery = db
		.select({
			id: ordersTable.id,
			productId: sql<string>`${orderItemsTable.productId}`.as('soldProdId'),
			sold: sql<number>`cast(count(${orderItemsTable.productId}) as integer)`.as('sold')
		})
		.from(orderItemsTable)
		.innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
		.where(eq(ordersTable.status, 'delivered'))
		.groupBy(orderItemsTable.productId, ordersTable.id)
		.as('solds');

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
			variantDescription: variantsTable.description,
			avgRating: ratingsQuery.avgRating,
			sold: soldsQuery.sold,
			reviewCount: totalCommentsQuery.total
		})
		.from(productsTable)
		.leftJoin(categoryTable, eq(productsTable.categoryId, categoryTable.id))
		.leftJoin(variantsTable, eq(productsTable.id, variantsTable.productId))
		.leftJoin(ratingsQuery, eq(ratingsQuery.productId, productsTable.id))
		.leftJoin(totalCommentsQuery, eq(totalCommentsQuery.productId, productsTable.id))
		.leftJoin(soldsQuery, eq(soldsQuery.productId, productsTable.id))
		.orderBy(asc(productsTable.createdAt))
		.$dynamic();

	let query = withSearch(selectQuery, `%`, [productsTable.name]);

	if (search) {
		query = withSearch(query, `%${search}%`, [productsTable.name, productsTable.id]);
	}

	if (category && category !== 'all') {
		query = withSearch(query, `${category}`, [categoryTable.name]);
		if (search) {
			query = query.where(
				and(eq(categoryTable.name, `${category}`), eq(productsTable.name, `%${search}%`))
			);
		}
	}

	// Return empty if page is out of bounds
	const filterQuery = query.as('filterQuery');
	const distinctIds = await db.selectDistinct({ id: filterQuery.id }).from(filterQuery);

	const total = distinctIds?.length;

	console.log(total);

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
						...item,
						image: imageURL,
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

	console.log('total', total);
	console.log('paginated', products.length);

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
