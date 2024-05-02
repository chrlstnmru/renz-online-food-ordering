import {
	bigint,
	boolean,
	doublePrecision,
	foreignKey,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	varchar
} from 'drizzle-orm/pg-core';
import { productsTable, variantsTable } from './ProductSchema';

export const customerOrdersTable = pgTable('customer_orders', {
	id: varchar('id', { length: 27 }).primaryKey().notNull(),
	firstName: varchar('first_name', { length: 50 }).notNull(),
	lastName: varchar('last_name', { length: 50 }).notNull(),
	middleName: varchar('middle_name', { length: 50 }),
	email: varchar('email', { length: 50 }).notNull(),
	phone: varchar('phone', { length: 20 }).notNull(),
	address: varchar('address', { length: 255 }).notNull(),
	referenceNo: varchar('refno', { length: 20 }).notNull(),
	verified: boolean('verified').default(false).notNull(),
	status: varchar('status', {
		length: 20,
		enum: ['waiting', 'preparing', 'delivering', 'delivered', 'cancelled', 'rejected']
	})
		.default('waiting')
		.notNull(),
	userId: varchar('user_id', { length: 27 }).references(() => usersTable.id),
	rejectReason: text('reject_reason'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const customerOrderItemsTable = pgTable('customer_order_items', {
	id: varchar('id', { length: 27 }).primaryKey().notNull(),
	orderId: varchar('order_id', { length: 27 })
		.references(() => customerOrdersTable.id, { onDelete: 'cascade' })
		.notNull(),
	productName: varchar('product_name', { length: 255 }).notNull(),
	variantName: varchar('variant_name', { length: 255 }),
	quantity: integer('quantity').notNull(),
	total: doublePrecision('total').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const ordersTable = pgTable('orders', {
	id: varchar('id', { length: 27 }).primaryKey().notNull(),
	userId: varchar('user_id', { length: 27 }).references(() => usersTable.id, {
		onDelete: 'cascade'
	}),
	refno: varchar('refno', { length: 20 }).notNull(),
	verified: boolean('verified').default(false).notNull(),
	status: varchar('status', {
		length: 20,
		enum: ['waiting', 'preparing', 'delivering', 'delivered', 'cancelled', 'rejected']
	})
		.default('waiting')
		.notNull(),
	rejectReason: text('reject_reason'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const orderItemsTable = pgTable('order_items', {
	id: varchar('id', { length: 27 }).primaryKey().notNull(),
	orderId: varchar('order_id', { length: 27 })
		.references(() => ordersTable.id, { onDelete: 'cascade' })
		.notNull(),
	productId: varchar('product_id', { length: 27 }).notNull(),
	productName: varchar('product_name', { length: 255 }).notNull(),
	variantName: varchar('variant_name', { length: 255 }),
	quantity: integer('quantity').notNull(),
	total: doublePrecision('total').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const basketTable = pgTable('baskets', {
	id: varchar('id', { length: 27 }).primaryKey().notNull(),
	userId: varchar('user_id', { length: 27 })
		.references(() => usersTable.id, { onDelete: 'cascade' })
		.notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const basketItemsTable = pgTable(
	'basket_items',
	{
		id: varchar('id', { length: 27 }).primaryKey().notNull(),
		basketId: varchar('basket_id', { length: 27 })
			.references(() => basketTable.id, { onDelete: 'cascade' })
			.notNull(),
		productId: varchar('product_id', { length: 27 }).notNull(),
		variantId: varchar('variant_id', { length: 27 }),
		quantity: integer('quantity').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => ({
		productRef: foreignKey({
			columns: [t.productId],
			foreignColumns: [productsTable.id],
			name: 'product_id_fk'
		}),
		variantRef: foreignKey({
			columns: [t.variantId],
			foreignColumns: [variantsTable.id],
			name: 'variant_id_fk'
		}),
		unq: unique().on(t.basketId, t.productId, t.variantId).nullsNotDistinct()
	})
);

export const reviewsTable = pgTable('reviews', {
	id: varchar('id', { length: 27 }).primaryKey().notNull(),
	userId: varchar('user_id', { length: 27 })
		.references(() => usersTable.id, { onDelete: 'cascade' })
		.notNull(),
	productId: varchar('product_id', { length: 27 })
		.references(() => productsTable.id)
		.notNull(),
	rating: doublePrecision('rating').notNull(),
	comment: text('comment'),
	verified: boolean('verified').default(false).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const usersTable = pgTable('users', {
	id: varchar('id', { length: 27 }).primaryKey().notNull(),
	firstName: varchar('first_name', { length: 50 }),
	middleName: varchar('middle_name', { length: 50 }),
	lastName: varchar('last_name', { length: 50 }),
	email: varchar('email', { length: 50 }).unique(),
	phone: varchar('phone', { length: 11 }),
	address: varchar('address', { length: 255 }),
	image: text('image'),
	onboarded: boolean('onboarded').default(false).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const sessionsTable = pgTable('user_sessions', {
	id: varchar('id', {
		length: 128
	}).primaryKey(),
	userId: varchar('user_id', { length: 27 })
		.references(() => usersTable.id, { onDelete: 'cascade' })
		.notNull(),
	activeExpires: bigint('active_expires', {
		mode: 'number'
	}).notNull(),
	idleExpires: bigint('idle_expires', {
		mode: 'number'
	}).notNull()
});

export const keysTable = pgTable('user_keys', {
	id: varchar('id', {
		length: 255
	}).primaryKey(),
	userId: varchar('user_id', { length: 27 })
		.references(() => usersTable.id, { onDelete: 'cascade' })
		.notNull(),
	hashedPassword: varchar('hashed_password', {
		length: 255
	})
});
