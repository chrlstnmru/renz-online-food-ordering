import { z } from 'zod';

const phoneNumberRegex = /^(09|\+639)\d{9}$/;

export const orderInformationForm = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	middleName: z.string().optional().nullish(),
	email: z.string().email(),
	phone: z.string().regex(phoneNumberRegex, 'Invalid phone number'),
	address: z.string().min(1, 'Address is required'),
	referenceNo: z.string().min(1, 'Reference number is required'),
	items: z
		.array(
			z.object({
				productName: z.string(),
				variantName: z.string().optional().nullish(),
				quantity: z.number().min(1),
				total: z.number()
			})
		)
		.default([]),
	userId: z.string().optional().nullish()
});

export const paymentInformationForm = z.object({
	referenceNo: z.string().min(1)
});

export type OrderInformationForm = z.infer<typeof orderInformationForm>;
