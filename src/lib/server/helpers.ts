import { nanoid } from 'nanoid';
import { adminAuth } from './auth';
import { db } from './db';
import { adminsTable, resetTokenTable } from './db/schema/AdminSchema';
import type { ProductVariantInsert, ProductVariantSelect } from './db/schema/ProductSchema';
import type { ProductVariantForm } from './validation';
import { generateID, stringEmpty } from '$lib/utils/helpers';
import type { AnyPgSelect, PgColumn, SelectedFields } from 'drizzle-orm/pg-core';
import { and, Column, eq, ilike, inArray, or, sql, type SQLWrapper } from 'drizzle-orm';
import { basketTable } from './db/schema/UserSchema';
import { isWithinExpiration } from 'lucia/utils';

export async function adminExists() {
	const admin = await db.select({ id: adminsTable.id }).from(adminsTable).limit(1);
	return admin.length !== 0;
}

export async function createAdmin({
	username,
	email,
	password
}: {
	username: string;
	email: string;
	password: string;
}) {
	const admin = await adminAuth.createUser({
		key: {
			providerId: 'username',
			providerUserId: username,
			password
		},
		attributes: {
			username: username,
			email: email
		}
	});

	return admin;
}

export function groupEditedVariants(
	productId: string,
	masterList: ProductVariantSelect[],
	editedList: ProductVariantForm[],
	generateId: boolean = true
) {
	const [create, update] = [new Array<ProductVariantInsert>(), new Array<ProductVariantInsert>()];

	// create all
	if (masterList.length === 0) {
		const newList = editedList.map((nv) => {
			if (generateId) return { ...nv, id: generateID(), productId };
			return { ...nv, id: generateID(), productId };
		});
		return { create: newList, update: [], remove: [] };
	}

	// delete all
	if (editedList.length === 0) {
		return { create: [], update: [], remove: editedList };
	}

	editedList.reduce((acc, eItem) => {
		if (stringEmpty(`${eItem.id}`)) {
			create.push({ ...eItem, id: generateID(), productId });
			return acc;
		}

		return acc;
	}, new Array<ProductVariantInsert>());

	const remove = masterList.reduce((acc, mItem) => {
		const toUpdate = editedList.find((eItem) => mItem.id === eItem.id);
		if (toUpdate) {
			update.push({ ...toUpdate, id: mItem.id, productId: mItem.productId });
			return acc;
		}
		acc.push({ id: mItem.id });
		return acc;
	}, new Array<{ id: string }>());

	return { create, update, remove };
}

export function withPagination<T extends AnyPgSelect>(
	qb: T,
	page: number = 1,
	pageSize: number = 10
) {
	return (qb.limit(pageSize) as T).offset((page - 1) * pageSize + 1);
}

export function withSearch<T extends AnyPgSelect>(
	qb: T,
	search: string | any[],
	fields: Column[],
	any = true
) {
	if (fields.length === 0) return qb;

	let conditions: SQLWrapper[] = [];

	if (Array.isArray(search) && search.length > 0) {
		conditions = fields.map((f) => inArray(f, search));
	} else {
		conditions = fields.map((f) => ilike(f, `${search}`));
	}

	if (!any) return qb.where(and(...conditions)) as T;
	return qb.where(or(...conditions)) as T;
}

export async function getUserBasketId(userId: string) {
	return new Promise(async (resolve, reject) => {
		let result;

		try {
			result = await db
				.selectDistinct({ id: basketTable.id })
				.from(basketTable)
				.where(eq(basketTable.userId, userId));
			if (result.length === 0) {
				result = await db
					.insert(basketTable)
					.values({ id: nanoid(), userId })
					.returning({ id: basketTable.id });
			}
		} catch (error) {
			return reject(error);
		}

		return resolve(result[0].id);
	}) as Promise<string>;
}

export async function generateResetToken(id: string) {
	const EXPIRES_IN = 1000 * 60 * 60 * 1; // 1 hour
	const storedToken = await db
		.selectDistinct()
		.from(resetTokenTable)
		.where(eq(resetTokenTable.userId, id))
		.limit(1);

	// Reuse exisiting token if it's not expired
	if (storedToken.length > 0) {
		const reusableToken = storedToken.find((token) => {
			return isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2);
		});
		if (reusableToken) return reusableToken.id;
	}
}
