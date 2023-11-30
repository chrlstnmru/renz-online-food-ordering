<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Pagination from '$lib/components/Pagination.svelte';
	import type { PageData } from './$types';
	import UserFilters from './_components/UserFilters.svelte';
	import UsersTable from './_components/UsersTable.svelte';

	export let data: PageData;

	function handlePageChange(e: CustomEvent<{ curr: number; next: number }>) {
		if (browser) {
			const currentUrl = new URL($page.url);
			currentUrl.searchParams.set('page', e.detail.next.toString());
			goto(currentUrl.toString(), { replaceState: true });
		}
	}
</script>

<div class="mt-6 flex min-w-max flex-1 flex-col gap-3 overflow-auto">
	<div class="card flex flex-1 flex-col overflow-auto">
		<UserFilters />
		<UsersTable data={data.users} />
	</div>
	<Pagination
		total={data.users.total}
		perPage={data.users.limit}
		on:pageChange={handlePageChange}
	/>
</div>
