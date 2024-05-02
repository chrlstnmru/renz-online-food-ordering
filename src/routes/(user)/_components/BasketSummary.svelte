<script lang="ts">
	import BasketItems from './BasketItems.svelte';

	import { useBasket } from '$lib/stores/basketStore';

	const { items } = useBasket();
</script>

<aside class="card sticky top-24 flex h-max w-[270px] flex-col gap-4 lg:hidden">
	<h2 class="text-lg font-semibold">Basket Summary</h2>
	<BasketItems />
	<a class:pointer-events-none={$items.length === 0} href="/checkout">
		<div
			class={`rounded-md p-2 text-center text-white hover:opacity-80 active:opacity-95 ${
				$items.length > 0 ? 'bg-primary-500' : 'bg-primary-500/70'
			}`}
		>
			Checkout
		</div>
	</a>
</aside>
