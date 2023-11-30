import lucia from 'lucia';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: lucia.AuthRequest;
			session: lucia.Session | null;
			onboarded: boolean;
		}
		interface PageData {
			flash?: { type: 'success' | 'error'; content: string };
		}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: 'error' | 'success' | 'warning' | 'info';
				content: any;
			};
		}
	}
}

/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = lucia.Auth;
		type DatabaseUserAttributes = Partial<{
			username?: string;
			first_name?: string;
			middle_name?: string;
			last_name?: string;
			email?: string;
			image?: string;
			onboarded?: boolean;
		}>;
		type DatabaseSessionAttributes = {};
	}
}

export {};
