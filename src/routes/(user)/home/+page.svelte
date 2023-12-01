<script lang="ts">
	import type { PageData } from './$types';
	import ProductCard from './_components/ProductCard.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import ItemFilter from './_components/ItemFilter.svelte';
	import WithBasketSummary from '../_components/WithBasketSummary.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let data: PageData;

	function handlePageChange(e: CustomEvent<{ curr: number; next: number }>) {
		if (browser) {
			const currentUrl = new URL($page.url);
			currentUrl.searchParams.set('page', e.detail.next.toString());
			goto(currentUrl.toString(), { replaceState: true });
		}
	}
</script>

<svelte:head>
	<title>RENZ Online Food Ordering</title>
</svelte:head>

<WithBasketSummary>
	<div class="flex-1 space-y-3">
		<div class="card flex-1 space-y-4">
			<ItemFilter data={data.categories} />
			<div class="grid grid-cols-4 gap-4 sm:!grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				{#each data.products.items as item, i}
					<a href="/products/{item.id}">
						<ProductCard data={item} />
					</a>
				{:else}
					<div class="text-gray-500 col-span-5 text-center h-20 items-center grid">
						<span>No products found</span>
					</div>
				{/each}
			</div>
		</div>
		<Pagination
			total={data.products.total}
			perPage={data.products.limit}
			defaultPage={data.products.page}
			on:pageChange={handlePageChange}
		/>
	</div>
</WithBasketSummary>
