import { PUBLIC_ASSETS_URL } from '$env/static/public';
import { customAlphabet } from 'nanoid';

export function generateID() {
	const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
	const random = customAlphabet(alphabet, 24)()
		.replace(/(.{6})/g, '$1-')
		.slice(0, -1);
	return random;
}

export function generateNumID() {
	const alphabet = '0123456789';
	const random = customAlphabet(alphabet, 12)();
	return random;
}

export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function capitalize(text: string) {
	if (!text) return text;

	const str = text.trim();
	const words = str.split(' ');
	const capitalizedWords = words.map((word) => {
		return word.charAt(0).toUpperCase() + word.substring(1);
	});
	console.log(capitalizedWords.join(' '));

	return capitalizedWords.join(' ');
}

export function dataURItoBlob(dataURI: string) {
	// convert base64 to raw binary data held in a string
	// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
	var byteString = atob(dataURI.split(',')[1]);

	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	// write the bytes of the string to an ArrayBuffer
	var ab = new ArrayBuffer(byteString.length);

	// create a view into the buffer
	var ia = new Uint8Array(ab);

	// set the bytes of the buffer to the correct values
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	// write the ArrayBuffer to a blob, and you're done
	var blob = new Blob([ab], { type: mimeString });
	return blob;
}

export function stringEmpty(text?: string | null) {
	if (!text) return true;

	const str = text.trim();
	return str === '' || str === 'null' || str === 'undefined';
}

export async function parseAssetURL(id: string) {
	const url = new URL(id, PUBLIC_ASSETS_URL);
	return fetch(url.toString());
}

export function round(value: number, precision: number) {
	var multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
}

export const formatter = new Intl.NumberFormat('en-PH', {
	style: 'currency',
	currency: 'PHP'
});
