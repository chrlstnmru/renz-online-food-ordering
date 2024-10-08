import type { Category, Paginated, Product } from '$lib/server/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
	async function getProducts() {
		const searchParams = url.searchParams;
		searchParams.set('limit', searchParams.get('limit') || '12');
		const result = (await fetch('/api/products?' + searchParams.toString()).then((res) =>
			res.json()
		)) as Paginated<Product>;

		return result;
	}

	async function getCategories() {
		const result = (await fetch('/api/products/categories' + url.search).then((res) =>
			res.json()
		)) as Category[];
		return result;
	}

	return { products: getProducts(), categories: getCategories() };
};
