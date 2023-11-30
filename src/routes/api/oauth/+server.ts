import { dev } from '$app/environment';
import { googleOAuth } from '$lib/server/auth/google';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { facebookOAuth } from '$lib/server/auth/facebook';

export const GET: RequestHandler = async ({ url: requestUrl, cookies }) => {
	const oauthProvider = requestUrl.searchParams.get('provider');
	let oauthUrl: URL | undefined;
	let oauthState: string = '';

	if (!oauthProvider) {
		throw error(400, 'Missing OAuth provider');
	}

	switch (oauthProvider) {
		case 'google':
			const [googleUrl, googleState] = await googleOAuth.getAuthorizationUrl();
			oauthUrl = googleUrl;
			oauthState = googleState;
			break;
		case 'facebook':
			const [fbUrl, fbState] = await facebookOAuth.getAuthorizationUrl();
			oauthUrl = fbUrl;
			oauthState = fbState;
			break;

		default:
			throw error(400, 'Unknown OAuth provider');
	}

	if (!oauthUrl) {
		throw error(500, 'OAuth URL not found');
	}

	const redirectTo = requestUrl.searchParams.get('redirectTo');
	oauthUrl.searchParams.set('state', `${oauthProvider}+${oauthState}+${redirectTo}`);

	cookies.set(`${oauthProvider}_oauth_state`, oauthState, {
		httpOnly: true,
		secure: !dev,
		path: '/',
		maxAge: 60 * 60
	});

	throw redirect(302, oauthUrl);
};
