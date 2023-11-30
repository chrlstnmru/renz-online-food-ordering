import { db } from '$lib/server/db';
import { categoryTable } from '$lib/server/db/schema/ProductSchema';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const categories = await db.select().from(categoryTable);

	const response = new Response(JSON.stringify(categories), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return response;
};
