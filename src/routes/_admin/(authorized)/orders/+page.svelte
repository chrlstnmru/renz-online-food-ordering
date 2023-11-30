<script lang="ts">
	import type { PageData } from './$types';
	import Pagination from '$lib/components/Pagination.svelte';
	import OrderFilters from './_components/OrderFilters.svelte';
	import OrderTable from './_components/OrderTable.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

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
		<OrderFilters />
		<OrderTable data={data.orders} orderForm={data.orderForm} rejectForm={data.rejectForm} />
	</div>
	<Pagination
		total={data.orders.total}
		perPage={data.orders.limit}
		on:pageChange={handlePageChange}
	/>
</div>
