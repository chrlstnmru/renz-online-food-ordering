<script lang="ts">
	import { useBasket } from '$lib/stores/basketStore';
	import { formatter } from '$lib/utils/helpers';

	const { items, total } = useBasket();
</script>

{#if $items.length !== 0}
	<div class="custom-scrollbar max-h-[275px] overflow-y-auto">
		<ul class="mx-2 space-y-3">
			{#each $items as item (item.id)}
				<li class="flex items-center justify-between gap-4">
					<span>{item.quantity}x</span>
					<div class="flex flex-1 flex-col overflow-x-hidden">
						<span class="truncate font-medium">{item.productName}</span>
						<span>{item.variant || 'Regular'}</span>
					</div>
					<span>{formatter.format(item.price)}</span>
				</li>
			{/each}
		</ul>
	</div>
	<p class="flex w-full text-lg font-semibold">
		Total: <span class="ml-auto">{formatter.format($total)}</span>
	</p>
{:else}
	<p class="py-4 text-center">No items</p>
{/if}
