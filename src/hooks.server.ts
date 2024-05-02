import { adminAuth, userAuth } from '$lib/server/auth';
import { error, redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const resourceURL = event.url.pathname;
	const apiProtectedRoutes = ['/api/users/basket'];
	const userProtectedRoutes = ['/profile', '/reviews'];
	const adminPublicRoutes = [
		'/_admin',
		'/_admin/setup',
		'/_admin/logout',
		'/_admin/reset',
		'/_admin/reset/verify'
	];

	if (event.url.pathname.startsWith('/_admin')) {
		event.locals.auth = adminAuth.handleRequest(event);
		const session = await event.locals.auth.validate();
		event.locals.session = session;

		if (!adminPublicRoutes.includes(resourceURL)) {
			if (!event.locals.session) {
				throw redirect(302, '/_admin?redirectTo=' + resourceURL);
			}
		}
	} else {
		event.locals.auth = userAuth.handleRequest(event);
		const session = await event.locals.auth.validate();
		event.locals.session = session;

		if (session) {
			if (
				resourceURL !== '/onboarding' &&
				resourceURL !== '/logout' &&
				!resourceURL.startsWith('/api') &&
				!resourceURL.startsWith('/_admin')
			) {
				if (!session.user.onboarded) {
					throw redirect(302, '/onboarding');
				}
			}
		}

		if (apiProtectedRoutes.includes(resourceURL)) {
			if (!event.locals.session) {
				throw error(401, 'Unauthorized');
			}
		}

		if (userProtectedRoutes.includes(resourceURL)) {
			if (!event.locals.session) {
				throw redirect(302, '/login?redirectTo=' + resourceURL);
			}
		}
	}

	if (event.url.pathname === '/onboarding') {
		if (!event.locals.session) {
			throw redirect(302, '/login');
		}
		if (event.locals.onboarded) {
			throw redirect(302, '/home');
		}
	}

	return resolve(event);
};
