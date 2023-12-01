import type { BestSeller } from '$lib/server/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	async function getBestSellers() {
		const res = await fetch('/api/products/best-selling');
		return res.json() as Promise<BestSeller[]>;
	}

	return { bestSellers: getBestSellers() };
};
