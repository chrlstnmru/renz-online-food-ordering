import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ locals, request }) => {
	// if (!locals.session) {
	// 	throw error(401, 'Unauthorized');
	// }

	console.log(await request.json());

	return new Response();
};
