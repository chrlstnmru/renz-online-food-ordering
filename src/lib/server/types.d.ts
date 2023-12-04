import type { ProductSelect } from './db/schema/ProductSchema';

export type SuperformMessage = { status: 'error' | 'success' | 'warning'; content: any };

export type Product = Omit<
	ProductSelect & {
		category: { id: string; name: string } | null;
		variants: ProductVariant[];
		avgRating?: number;
		sold?: number;
		reviews?: UserReview[];
		ratings?: RatingsData;
		reviewCount?: number;
	},
	'categoryId'
>;

export type ProductVariant = {
	id: string;
	name: string;
	price: number;
	description: string | null;
};

export type Category = { id: string; name: string };

export type Paginated<T> = {
	items: T[];
	page: number;
	pages: number;
	limit: number;
	total: number;
};

export type RatingsData = {
	total: number;
	average: number;
	highest: number;
	lowest: number;
	metrics: ReviewMetrics;
};

export type ReviewMetrics = {
	[key: string]: Rate;
};

type Rate = { value: number | 0; count: number | 0 };

export type UserReview = {
	id: string;
	user: { id: string; name: string; image: string | null };
	rating: number;
	comment?: string | null;
	createdAt: Date;
	verified: boolean;
};

export type BasketItem = {
	id: string;
	productId: string;
	productName: string;
	quantity: number;
	variant: {
		name: string;
		price: number;
	} | null;
	price: number;
	image: string;
	createdAt: Date;
	updatedAt: Date;
};

export type BasketEntry = {
	id: string;
	product: {
		name: string;
		price: number;
	};
	variant: {
		name: string;
		price: number;
	} | null;
	quantity: number;
};

export type BasketSummary = {
	entries: BasketEntry[];
	total: number;
};

export type Order = {
	id: string;
	description: string[];
	total: number;
	status: string;
	verified: boolean;
	rejectReason?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type UserOrder = Order & {
	refno: string;
	recipient: string;
};

export type AdminUser = {
	id: string;
	username: string;
};

export type BestSeller = {
	id: string;
	name: string;
	image: string | null;
	price: number;
	avegrage: number;
	sold: number;
};
