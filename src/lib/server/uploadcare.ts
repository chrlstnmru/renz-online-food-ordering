import { UPLOADCARE_API_KEY, UPLOADCARE_SECRET_KEY } from '$env/static/private';
import { UploadcareSimpleAuthSchema } from '@uploadcare/rest-client';
import { UploadClient } from '@uploadcare/upload-client';

export const uploadClient = new UploadClient({ publicKey: UPLOADCARE_API_KEY });
export const uploadeCareAuth = new UploadcareSimpleAuthSchema({
	publicKey: UPLOADCARE_API_KEY,
	secretKey: UPLOADCARE_SECRET_KEY
});
