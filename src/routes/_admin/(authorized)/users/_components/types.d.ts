import type { usersTable } from '$lib/server/db/schema/UserSchema';
import type { InferSelectModel } from 'drizzle-orm';

export type UserData = Omit<
	InferSelectModel<typeof usersTable> & {
		searchTerms: string;
	},
	'onboarded'
>;
