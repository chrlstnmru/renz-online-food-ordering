import { z } from 'zod';

export type ProductForm = z.infer<typeof productForm>;
export type ProductVariantForm = z.infer<typeof productVariantForm>;

export const adminSetupForm = z
	.object({
		username: z
			.string()
			.regex(/^[a-zA-Z\_]+$/g, 'Only contain alphabet, numbers and/or underscore is allowed.')
			.trim()
			.min(1)
			.max(255),
		email: z.string().email().trim().min(1).max(255),
		password: z.string().trim().min(1).max(255),
		passwordConfirm: z.string().min(1).max(255)
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: "Password didn't match.",
		path: ['passwordConfirm']
	});

export const adminLoginForm = z.object({
	username: z.string().trim().min(1).max(255),
	password: z.string().trim().min(1).max(255)
});

export const categoryForm = z.object({
	id: z.string().trim().min(1).max(255),
	name: z
		.string()
		.trim()
		.min(1, 'Category name is required.')
		.max(255, 'Category name is too long.')
});

export const productVariantForm = z.object({
	id: z.string().trim().min(1).max(255).optional().nullable(),
	name: z
		.string()
		.trim()
		.min(1, 'Product variant name is required.')
		.max(255, 'Product variant name is too long.'),
	price: z.number().min(0, 'Price must be greater than or equal to 0.'),
	description: z.string().trim().max(255).optional().nullish()
});

export const productForm = z.object({
	id: z.string().trim().min(1).max(255),
	name: z.string().trim().min(1, 'Product name is required.').max(255, 'Product name is too long.'),
	price: z.number().min(0, 'Price must be greater than or equal to 0.'),
	categoryId: z.string().trim().max(255).optional().nullable(),
	variants: z.array(productVariantForm).optional()
});

export const addProductFormSchema = z.object({
	userId: z.string().trim().min(1).max(255),
	productId: z.string().trim().min(1).max(255),
	variantId: z.string().trim().min(1).max(255).optional().nullable(),
	quantity: z.number().min(1, 'Quantity must be greater than 0.').default(1)
});

export const reviewFormSchema = z.object({
	userId: z.string().trim().min(1).max(255),
	productId: z.string().trim().min(1).max(255),
	rating: z
		.number()
		.refine((data) => data >= 1 && data <= 5, { message: 'Rating must be between 1 and 5' }),
	comment: z.string().trim().max(255).optional().nullable()
});

export const deleteReviewFormSchema = z.object({
	reviewId: z.string().trim().min(1).max(255)
});

export const checkoutFormSchema = z.object({
	refno: z
		.string()
		.trim()
		.min(1, 'Reference number is required.')
		.max(20, 'Invalid reference number')
});

export const instantOrderFormSchema = z.object({
	productId: z.string().trim().min(1).max(255),
	variantId: z.string().trim().min(1).max(255).optional().nullable(),
	refno: z
		.string()
		.trim()
		.min(1, 'Reference number is required.')
		.max(20, 'Invalid reference number'),
	quantity: z.number().min(1, 'Quantity must be greater than 0.').default(1)
});

export const onboardingFormSchema = z.object({
	firstName: z.string().trim().min(1, 'First name is required.').max(255),
	middleName: z.string().trim().max(255).optional(),
	lastName: z.string().trim().min(1, 'Last names is required.').max(255),
	email: z.string().email().trim().min(1, 'Email is required.').max(255),
	phone: z.string().trim().min(1, 'Phone number is required').max(11, 'Invalid phone number.'),
	address: z.string().trim().min(1, 'Address is required.')
});

export const cancelOrderFormSchema = z.object({
	orderId: z.string().trim().min(1).max(255)
});

export const updateOrderFormSchema = z
	.object({
		orderId: z.string().trim().min(1).max(255),
		status: z.enum(['waiting', 'preparing', 'delivering', 'delivered']),
		verified: z.boolean()
	})
	.refine((data) => {
		if (data.verified == false) {
			data.status = 'waiting';
		}
		return true;
	});

export const rejectOrderFormSchema = z.object({
	orderId: z.string().trim().min(1).max(255),
	reason: z.string().trim().min(1, 'Please state a reason.').max(255)
});

export const changeAdminPasswordSchema = z
	.object({
		oldPassword: z.string().trim().min(1),
		newPassword: z.string().trim().min(1),
		passwordConfirm: z.string().trim().min(1)
	})
	.refine((data) => data.newPassword === data.passwordConfirm, {
		message: 'Password did not match.',
		path: ['newPasswordConfirm']
	});

export const changeAdminInfoSchema = z.object({
	username: z
		.string()
		.regex(/^[a-zA-Z\_]+$/g, 'Only contain alphabet, numbers and/or underscore is allowed.')
		.trim()
		.min(1)
		.max(255),
	email: z.string().email().trim().min(1).max(255),
	password: z.string().trim().min(1)
});

export const resetRequestFormSchema = z.object({
	email: z.string().email().trim().min(1).max(255)
});
