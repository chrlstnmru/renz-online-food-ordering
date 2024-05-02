<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { useBasket } from '$lib/stores/basketStore';
	import { formatter } from '$lib/utils/helpers';
	import WithBasketSummary from '../_components/WithBasketSummary.svelte';
	import type { PageData } from './$types';
	import { BasketTable } from './_components/table';

	export let data: PageData;

	const { items, total } = useBasket();

	let openCheckout = false;
</script>

<WithBasketSummary>
	<div class="flex flex-1 flex-col gap-3">
		<div class="card flex flex-1 flex-col">
			<div class="flex w-full items-center justify-between gap-2 xs:grid xs:grid-cols-1">
				<div class="w-full items-center justify-between gap-4 lg:flex">
					<h2 class="text-2xl font-semibold">Basket</h2>
					<span class="hidden font-medium lg:inline">
						Total: {formatter.format($total)}
					</span>
				</div>
				<Button class="hidden justify-center lg:inline" on:click={() => (openCheckout = true)}>
					Checkout
				</Button>
			</div>
			{#if $items.length > 0}
				<BasketTable basketEntries={$items} />
			{:else}
				<div class="grid flex-1 place-items-center text-2xl text-neutral-400">No items found</div>
			{/if}
		</div>
	</div>
</WithBasketSummary>
