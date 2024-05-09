import { orderInformationForm } from '$lib/formValidation';
import { message, superValidate } from 'sveltekit-superforms/client';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { customerOrderItemsTable, customerOrdersTable } from '$lib/server/db/schema/UserSchema';
import { generateID } from '$lib/utils/helpers';
import type { InferInsertModel } from 'drizzle-orm';
import { transporter } from '$lib/server/nodemailer';
import { NODEMAILER_USER } from '$env/static/private';
import { render } from 'svelte-email';
import NewOrder from '$lib/components/emails/NewOrder.svelte';

export const load: PageServerLoad = async () => {
	const orderForm = await superValidate(orderInformationForm);

	return {
		orderForm
	};
};

export const actions: Actions = {
	validateOrderInfo: async (event) => {
		const form = await superValidate(event, orderInformationForm.omit({ referenceNo: true }));

		if (!form.valid) {
			return fail(400, { form });
		}

		return message(form, { type: 'success', content: 'Order information validated.' });
	},
	placeOrder: async (event) => {
		const form = await superValidate(event, orderInformationForm);

		if (!form.valid) {
			return fail(400, { form });
		}

		const newOrder = await db.transaction(async (tx) => {
			const [order] = await tx
				.insert(customerOrdersTable)
				.values({
					id: generateID(),
					...form.data
				})
				.returning();

			if (!order) {
				return message(form, { type: 'error', content: 'Something went wrong' });
			}

			const items: InferInsertModel<typeof customerOrderItemsTable>[] = form.data.items.map(
				(item) => ({
					id: generateID(),
					orderId: order.id,
					productName: item.productName,
					variantName: item.variantName ?? 'Regular',
					quantity: item.quantity,
					total: item.total
				})
			);

			await tx.insert(customerOrderItemsTable).values(items).returning();
			return order;
		});

		let total = 0;
		const itemsToEmail = form.data.items.map((item) => {
			total += item.total;

			return {
				name: item.productName + ` (${item.variantName ?? 'Regular'})`,
				quantity: item.quantity,
				price: item.total / item.quantity
			};
		});

		const attachment = render({
			template: NewOrder,
			props: {
				list: itemsToEmail,
				total,
				orderId: newOrder.id,
				email: form.data.email,
				orderDate: newOrder.createdAt.toLocaleDateString(),
				shippingAddress: form.data.address
			}
		});

		const email = await transporter.sendMail({
			from: `"RENZ Food Ordering" <${NODEMAILER_USER}>`,
			to: form.data.email,
			subject: 'Order Receipt',
			html: attachment
		});

		console.log(email.response);

		throw redirect(302, '/checkout?success&orderId=' + newOrder.id);
	}
};
