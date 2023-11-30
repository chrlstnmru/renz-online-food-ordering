import { desc, eq, sql } from 'drizzle-orm';
import { db } from '.';
import { categoryTable, productsTable, variantsTable } from './schema/ProductSchema';
import { alias } from 'drizzle-orm/pg-core';
import { reviewsTable, usersTable } from './schema/UserSchema';

const categoryAlias = alias(categoryTable, 'category');
const variantAlias = alias(variantsTable, 'variants');

export const stmtGetProduct = db
	.selectDistinct()
	.from(productsTable)
	.leftJoin(categoryAlias, eq(categoryAlias.id, productsTable.categoryId))
	.leftJoin(variantAlias, eq(variantAlias.productId, productsTable.id))
	.where(eq(productsTable.id, sql.placeholder('productId')))
	.prepare('get_product');

export const stmtGetProductReviews = db
	.selectDistinct({
		id: reviewsTable.id,
		rating: reviewsTable.rating,
		comment: reviewsTable.comment,
		verified: reviewsTable.verified,
		createdAt: reviewsTable.createdAt,
		user: {
			id: usersTable.id,
			name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
			image: usersTable.image
		}
	})
	.from(reviewsTable)
	.innerJoin(usersTable, eq(usersTable.id, reviewsTable.userId))
	.where(eq(reviewsTable.productId, sql.placeholder('productId')))
	.limit(5)
	.orderBy(desc(reviewsTable.createdAt))
	.prepare('get_product_reviews');

export const stmtGetProductRating = db
	.select({
		rating: reviewsTable.rating,
		count: sql<number>`cast(count(${reviewsTable.rating}) as integer)`,
		total: sql<number>`cast(sum(count(*)) over() as integer)`
	})
	.from(reviewsTable)
	.where(eq(reviewsTable.productId, sql.placeholder('productId')))
	.groupBy(reviewsTable.rating)
	.prepare('get_product_rating');
