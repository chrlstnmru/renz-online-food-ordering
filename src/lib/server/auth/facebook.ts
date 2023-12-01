import {
	FACEBOOK_CLIENT_ID,
	FACEBOOK_CLIENT_SECRET,
	FACEOOK_REDIRECT_URI
} from '$env/static/private';
import { facebook } from '@lucia-auth/oauth/providers';
import type { Cookies } from '@sveltejs/kit';
import type { User } from 'lucia';
import { userAuth } from '.';

export const facebookOAuth = facebook(userAuth, {
	clientId: FACEBOOK_CLIENT_ID,
	clientSecret: FACEBOOK_CLIENT_SECRET,
	redirectUri: FACEOOK_REDIRECT_URI
});

export async function validateFacebookCallback(
	cookies: Cookies,
	code: string,
	state: string
): Promise<User> {
	const currentState = cookies.get('facebook_oauth_state');

	if (!currentState || currentState !== state || !code) {
		new Promise((_, reject) => {
			reject(new Error('Invalid facebook oauth'));
		});
	}

	const { createUser, getExistingUser, facebookUser } = await facebookOAuth.validateCallback(code);
	const user = await getExistingUser();
	if (user) {
		return new Promise((resolve) => {
			resolve(user);
		});
	}

	const facebookName = facebookUser.name.split(' ');
	return new Promise((resolve) =>
		resolve(
			createUser({
				attributes: {
					first_name: facebookName[0],
					last_name: facebookName[1],
					email: facebookUser.email,
					image: facebookUser.picture.data.url
				}
			})
		)
	);
}
