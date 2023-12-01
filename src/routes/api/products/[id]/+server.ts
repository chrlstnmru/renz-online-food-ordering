import type { RequestHandler } from './$types';
import type { Product, RatingsData } from '$lib/server/types';
import {
	stmtGetProduct,
	stmtGetProductRating,
	stmtGetProductReviews
} from '$lib/server/db/statements';
import { PUBLIC_ASSETS_URL } from '$env/static/public';

export const GET: RequestHandler = async ({ params }) => {
	let product: Product;
	try {
		const data = await stmtGetProduct.execute({ productId: params.id });

		if (data.length === 0) {
			const notFound = new Error();
			notFound.name = 'NO_PRODUCT';
			notFound.message = 'Product not found.';
			throw notFound;
		}

		const reviews = await stmtGetProductReviews.execute({ productId: params.id });
		const ratings = await stmtGetProductRating.execute({ productId: params.id });

		// Assemble product data
		product = data.reduce((acc, item) => {
			if (!acc.id) {
				let imageURL: string | null = null;
				if (item.products.image) {
					imageURL = new URL(item.products.image, PUBLIC_ASSETS_URL).toString();
				}
				acc = { ...item.products, category: item.category, variants: [], image: imageURL };

				acc.ratings = {
					average: 0,
					highest: 5,
					lowest: 1,
					total: ratings[0]?.total ?? 0,
					metrics: {
						'1': { value: 0, count: 0 },
						'2': { value: 0, count: 0 },
						'3': { value: 0, count: 0 },
						'4': { value: 0, count: 0 },
						'5': { value: 0, count: 0 }
					}
				};
			}
			if (item.variants) acc.variants.push(item.variants);
			return acc;
		}, new Object() as Product);

		// Assemble reviews data
		product.reviews = reviews.map((review) => {
			return { ...review, comment: review.comment! };
		});

		// Assemble ratings data
		let totalFn = 0; // Total frequency * rating	(Σfn)
		let comulativeFreq = 0; // Total frequency (Σf)

		ratings.forEach((rating) => {
			let freqency = rating.count;
			let fn = freqency * rating.rating;

			product.ratings!.metrics[rating.rating].count = freqency;
			product.ratings!.metrics[rating.rating].value = freqency / product.ratings!.total;

			totalFn += fn;
			comulativeFreq += freqency;
		});

		product.ratings!.average = totalFn / comulativeFreq;
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'NO_PRODUCT') {
				return new Response(JSON.stringify({ error: error.message }), { status: 404 });
			}
		}

		console.error(error);
		return new Response(JSON.stringify({ code: 500, message: 'Something went wrong.' }), {
			status: 500
		});
	}
	return new Response(JSON.stringify(product));
};
