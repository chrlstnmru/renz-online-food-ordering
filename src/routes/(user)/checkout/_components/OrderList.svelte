<script lang="ts">
	import { useBasket } from '$lib/stores/basketStore';
	import { formatter } from '$lib/utils/helpers';

	const { items, total } = useBasket();
</script>

<div class="card flex min-w-[500px] flex-col gap-4">
	<h2 class="text-2xl font-semibold">Items</h2>
	<div class="custom-scrollbar max-h-96">
		<ul class="space-y-3">
			{#each $items as item (item.id)}
				<li class="flex items-center justify-between gap-4">
					<div class="aspect-square w-16 overflow-hidden rounded-md">
						<img src={item.imageUrl} alt="" />
					</div>
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
	<div class="mt-auto border-t pt-4">
		<p class="flex w-full text-lg font-semibold">
			Total: <span class="ml-auto">{formatter.format($total)}</span>
		</p>
	</div>
</div>
