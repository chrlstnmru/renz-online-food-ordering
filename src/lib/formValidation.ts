import { z } from 'zod';

const phoneNumberRegex = /^(09|\+639)\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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

export type OrderInformationForm = z.infer<typeof orderInformationForm>;

export const loginFormSchema = z.object({
	email: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required')
});

export type LoginForm = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
	.object({
		firstName: z.string().trim().min(1, 'First name is required.').max(255),
		middleName: z.string().trim().max(255).optional(),
		lastName: z.string().trim().min(1, 'Last names is required.').max(255),
		email: z.string().email().trim().min(1, 'Email is required.').max(255),
		password: z.string().min(1, 'Password is required').regex(passwordRegex, 'Password too weak!'),
		passwordConfirm: z.string().min(1, 'Password is required')
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Password did not match.',
		path: ['passwordConfirm']
	});

export type RegisterForm = z.infer<typeof registerFormSchema>;

export const forgotPasswordFormSchema = z.object({
	email: z.string().email().min(1, 'Email is required')
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
	.object({
		newPassword: z
			.string()
			.min(1, 'Password is required')
			.regex(passwordRegex, 'Password too weak!'),
		passwordConfirm: z.string().min(1, 'Password is required')
	})
	.refine((data) => data.newPassword === data.passwordConfirm, {
		message: 'Password did not match.',
		path: ['passwordConfirm']
	});

export type ResetPasswordForm = z.infer<typeof resetPasswordFormSchema>;
