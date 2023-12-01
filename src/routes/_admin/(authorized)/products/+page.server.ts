import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms/server';
import {
	categoryForm as categoryFormSchema,
	productForm as productFormSchema
} from '$lib/server/validation';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categoryTable, productsTable, variantsTable } from '$lib/server/db/schema/ProductSchema';
import { and, eq, sql } from 'drizzle-orm';
import { generateID, stringEmpty } from '$lib/utils/helpers';
import { z } from 'zod';
import { groupEditedVariants } from '$lib/server/helpers';
import type { Paginated, Product } from '$lib/server/types';
import { deleteImage, uploadImage } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const categoryForm = superValidate(categoryFormSchema);
	const productForm = superValidate(productFormSchema);

	async function getProducts() {
		const result = (await fetch('/api/products' + url.search + '&limit=12').then((res) =>
			res.json()
		)) as Paginated<Product>;

		return result;
	}

	const categories = db.select().from(categoryTable);
	return { productForm, categoryForm, categories, products: getProducts() };
};

export const actions: Actions = {
	createCategory: async ({ request }) => {
		const form = await superValidate(request, categoryFormSchema.omit({ id: true }));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const categoryId = form.data.name.toLowerCase().replace(/\s/g, '-');
			await db.insert(categoryTable).values({ id: categoryId, name: form.data.name });
		} catch (error: any) {
			if (error.code == 23505) {
				return message(
					form,
					{ type: 'warning', content: `${form.data.name} category already exists.` },
					{ status: 409 }
				);
			}

			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' }, { status: 500 });
		}

		return message(form, { type: 'success', content: `${form.data.name} has been created.` });
	},
	updateCategory: async ({ request }) => {
		const form = await superValidate(request, categoryFormSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const categoryId = form.data.name.toLowerCase().replace(/\s/g, '-');
			await db
				.update(categoryTable)
				.set({ id: categoryId, name: form.data.name })
				.where(eq(categoryTable.id, form.data.id));
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' }, { status: 500 });
		}

		return message(form, { type: 'success', content: `${form.data.name} has been updated.` });
	},
	deleteCategory: async ({ request }) => {
		const form = await superValidate(request, categoryFormSchema.omit({ name: true }));

		if (!form.valid) {
			return fail(400, { form });
		}

		let deletedCategory: any;
		try {
			deletedCategory = await db
				.delete(categoryTable)
				.where(eq(categoryTable.id, form.data.id))
				.returning({ name: categoryTable.name });
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' }, { status: 500 });
		}
		return message(form, {
			type: 'success',
			content: `${deletedCategory[0].name} has been deleted.`
		});
	},
	createProduct: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, productFormSchema.omit({ id: true }));
		const image = formData.get('image') as File;

		if (!form.valid) {
			return fail(400, { form });
		}

		if (image.size === 0) {
			return message(form, { type: 'error', content: 'Image is required.' }, { status: 400 });
		}

		try {
			const productId = generateID();
			const { variants, ...data } = form.data;

			// Upload Image
			const imagePath = await uploadImage(productId, image);

			// Format Variants
			const variantsData = variants?.map((variant) => {
				return {
					...variant,
					productId,
					id: generateID()
				};
			});

			// Insert Product
			await db
				.insert(productsTable)
				.values({ id: productId, image: imagePath, ...data })
				.returning({ id: productsTable.id });

			// Insert Variants
			if (variantsData && variantsData.length) await db.insert(variantsTable).values(variantsData);
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' }, { status: 500 });
		}

		return message(form, { type: 'success', content: `${form.data.name} has been created.` });
	},
	updateProduct: async ({ request }) => {
		const form = await superValidate(request, productFormSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const { variants, id, name, categoryId, price } = form.data;

			// Update Variants
			if (variants) {
				if (variants.length === 0) {
					await db.delete(variantsTable).where(eq(variantsTable.productId, id));
				} else {
					const existingVariants = await db
						.select()
						.from(variantsTable)
						.where(eq(variantsTable.productId, id));
					const { create, update, remove } = groupEditedVariants(
						id,
						existingVariants,
						form.data.variants!
					);

					if (create.length > 0) {
						await Promise.all(
							create.map(async (variant) => await db.insert(variantsTable).values(variant))
						);
					}

					if (update.length > 0) {
						await Promise.all(
							update.map(async (variant) => {
								await db
									.update(variantsTable)
									.set(variant)
									.where(and(eq(variantsTable.productId, id), eq(variantsTable.id, variant.id)));
							})
						);
					}

					if (remove.length > 0) {
						await Promise.all(
							remove.map(async (item) => {
								await db.delete(variantsTable).where(eq(variantsTable.id, item.id!));
							})
						);
					}
				}
			}

			// Update Product
			await db
				.update(productsTable)
				.set({
					name,
					categoryId: stringEmpty(categoryId as string) ? null : categoryId,
					price,
					updatedAt: sql`now()`
				})
				.where(eq(productsTable.id, id));

			return message(form, { type: 'success', content: 'Product updated successfully.' });
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' }, { status: 500 });
		}
	},
	deleteProduct: async ({ request }) => {
		const form = await superValidate(request, z.object({ id: z.string() }));

		if (!form.valid) {
			return fail(400, { form });
		}

		let deletedProduct: any;
		try {
			await deleteImage(form.data.id);
			deletedProduct = await db
				.delete(productsTable)
				.where(eq(productsTable.id, form.data.id))
				.returning({ name: productsTable.name, image: productsTable.image });
		} catch (error) {
			console.error(error);
			return message(form, { type: 'error', content: 'Something went wrong.' }, { status: 500 });
		}

		return message(form, {
			type: 'success',
			content: `${deletedProduct[0].name} has been deleted.`
		});
	}
};
