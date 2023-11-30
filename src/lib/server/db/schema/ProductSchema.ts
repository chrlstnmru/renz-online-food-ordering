import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { doublePrecision, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export type ProductSelect = InferSelectModel<typeof productsTable>;
export type ProductVariantSelect = InferSelectModel<typeof variantsTable>;
export type ProductVariantInsert = InferInsertModel<typeof variantsTable>;

export const categoryTable = pgTable('product_categories', {
	id: varchar('id', { length: 27 }).primaryKey().notNull(),
	name: varchar('name', { length: 255 }).notNull()
});

export const productsTable = pgTable('products', {
	id: text('id').primaryKey().notNull(),
	name: varchar('name', { length: 50 }).notNull(),
	price: doublePrecision('price').notNull(),
	categoryId: text('category_id').references(() => categoryTable.id, { onDelete: 'set null' }),
	image: text('image'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const variantsTable = pgTable('product_variants', {
	id: text('id').primaryKey().notNull(),
	productId: text('product_id')
		.references(() => productsTable.id, { onDelete: 'cascade' })
		.notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	price: doublePrecision('price').notNull(),
	description: varchar('description', { length: 255 })
});
