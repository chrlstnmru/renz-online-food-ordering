<script lang="ts">
	import type { BasketItem } from '$lib/stores/basketStore';
	import { BasketTableItem } from '.';

	export let basketEntries: BasketItem[];
</script>

<div class="overflow-hidden">
	<table class="w-full">
		<thead>
			<th class="w-0"></th>
			<th class="text-left">Product</th>
			<th>Price</th>
			<th>Quantity</th>
			<th class="w-0">Action</th>
		</thead>
		<tbody>
			{#each basketEntries as item (item.id)}
				<BasketTableItem
					id={item.id}
					productId={item.productId}
					productName={item.productName}
					variantName={item.variant}
					price={item.price}
					quantity={item.quantity}
					imageUrl={item.imageUrl}
				/>
			{/each}
		</tbody>
	</table>
</div>

<style lang="postcss">
	th {
		@apply p-3 md:hidden;
	}
</style>
