import { google } from '@lucia-auth/oauth/providers';
import { userAuth } from '.';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import type { User } from 'lucia';
import { generateID } from '$lib/utils/helpers';

export const googleOAuth = google(userAuth, {
	clientId: GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	redirectUri: GOOGLE_REDIRECT_URI
});

export async function validateGoogleCallback(
	cookies: Cookies,
	code: string,
	state: string
): Promise<User> {
	const currentState = cookies.get('google_oauth_state');

	if (!currentState || currentState !== state || !code) {
		new Promise((_, reject) => {
			reject('Invalid google oauth');
		});
	}

	const { createUser, getExistingUser, googleUser } = await googleOAuth.validateCallback(code);
	const user = await getExistingUser();
	if (user) {
		return new Promise((resolve) => {
			resolve(user);
		});
	}

	return new Promise((resolve) =>
		resolve(
			createUser({
				userId: generateID(),
				attributes: {
					first_name: googleUser.given_name,
					last_name: googleUser.family_name,
					email: googleUser.email,
					image: googleUser.picture
				}
			})
		)
	);
}
