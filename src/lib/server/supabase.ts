import { SUPABASE_PRIVATE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';

export const supabaseService = createClient(PUBLIC_SUPABASE_URL, SUPABASE_PRIVATE_KEY);

export async function uploadImage(name: string, file: Blob | File | Buffer) {
	const { data, error } = await supabaseService.storage
		.from('assets')
		.upload(name, file, { upsert: true, contentType: 'image/png, image/jpeg' });

	if (error) {
		return Promise.reject(error);
	}

	return Promise.resolve(data.path);
}

export async function deleteImage(id: string) {
	const { data, error } = await supabaseService.storage.from('assets').remove([`${id}`]);

	if (error) {
		return Promise.reject(false);
	}

	return Promise.resolve(true);
}
