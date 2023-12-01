<script lang="ts">
	import type { PageData } from './$types';
	import RecentOrders from './_components/RecentOrders.svelte';
	import Statistics from './_components/Statistics.svelte';
	import TopSellers from './_components/TopSellers.svelte';

	export let data: PageData;
</script>

<div class="flex min-w-max flex-1 flex-col overflow-auto">
	<Statistics data={data.dataOverview} />
	<div class="mt-4 flex flex-1 gap-4 overflow-y-auto">
		<RecentOrders data={data.recentOrders} />
		<TopSellers data={data.bestSelling} />
	</div>
</div>
