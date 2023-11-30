<script lang="ts">
	import type { BasketEntry } from '$lib/server/types';
	import { formatter } from '$lib/utils/helpers';

	export let data: BasketEntry[] = [];
	export let total: number = 0;

	$: total = data
		.map((item) => {
			if (!item.id) return 0;
			if (item.variant) {
				return item.variant.price * item.quantity;
			}
			return item.product.price * item.quantity;
		})
		.reduce((a, b) => a + b, 0);
</script>

{#if data.length !== 0}
	<div class="custom-scrollbar max-h-[275px] overflow-y-auto">
		<ul class="mx-2 space-y-3">
			{#each data as item (item.id)}
				<li class="flex items-center justify-between gap-4">
					<span>{item.quantity}x</span>
					<div class="flex flex-col overflow-x-hidden">
						<span class="truncate font-medium">{item.product.name}</span>
						<span>{item.variant?.name || 'Regular'}</span>
					</div>
					<span>{formatter.format(item.variant?.price || item.product.price)}</span>
				</li>
			{/each}
		</ul>
	</div>
	<p class="flex w-full text-lg font-semibold">
		Total: <span class="ml-auto">{formatter.format(total)}</span>
	</p>
{:else}
	<p class="py-4 text-center">No items</p>
{/if}
