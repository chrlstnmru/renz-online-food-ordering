import { bigint, integer, pgSchema, timestamp, varchar } from 'drizzle-orm/pg-core';

export const adminSchema = pgSchema('admin');

export const adminsTable = adminSchema.table('users', {
	id: varchar('id', { length: 27 }).primaryKey().notNull(),
	username: varchar('username', { length: 25 }).unique().notNull(),
	email: varchar('email', { length: 25 }).unique().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const sessionsTable = adminSchema.table('sessions', {
	id: varchar('id', {
		length: 128
	}).primaryKey(),
	userId: varchar('user_id', { length: 27 })
		.references(() => adminsTable.id, { onDelete: 'cascade' })
		.notNull(),
	activeExpires: bigint('active_expires', {
		mode: 'number'
	}).notNull(),
	idleExpires: bigint('idle_expires', {
		mode: 'number'
	}).notNull()
});

export const keysTable = adminSchema.table('keys', {
	id: varchar('id', {
		length: 255
	}).primaryKey(),
	userId: varchar('user_id', { length: 27 })
		.references(() => adminsTable.id, { onDelete: 'cascade' })
		.notNull(),
	hashedPassword: varchar('hashed_password', {
		length: 255
	})
});

export const resetTokenTable = adminSchema.table('password_reset_token', {
	id: varchar('id', {
		length: 255
	}).primaryKey(),
	expires: integer('expires').notNull(),
	userId: varchar('user_id', { length: 27 })
		.references(() => adminsTable.id, { onDelete: 'cascade' })
		.notNull()
});
