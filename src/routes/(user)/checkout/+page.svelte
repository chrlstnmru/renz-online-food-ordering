<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import Button, { buttonVariants } from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { useBasket } from '$lib/stores/basketStore';
	import { formatter } from '$lib/utils/helpers';
	import { OrderForm, OrderList } from './_components';

	export let data;

	const { items, clear } = useBasket();

	$: success = $page.url.searchParams.has('success');
	$: orderId = $page.url.searchParams.get('orderId');

	let copyDisabled = false;

	$: if (success && browser) clear();

	function copyOrderId() {
		if (orderId) {
			navigator.clipboard.writeText(orderId);
			copyDisabled = true;
			setTimeout(() => (copyDisabled = false), 2000);
		}
	}
</script>

<svelte:head>
	<title>Checkout</title>
</svelte:head>

{#if success && orderId}
	<div class="card grid flex-1 place-items-center">
		<div class="space-y-4">
			<h2 class="text-3xl font-semibold text-primary-500">Thank you for your order!</h2>
			<div class="flex items-center gap-2">
				<Input label="Your Order ID" value={orderId} disabled readonly />
				<Button on:click={copyOrderId} disabled={copyDisabled}>
					{copyDisabled ? 'Copied!' : 'Copy'}
				</Button>
			</div>
		</div>
	</div>
{:else if $items.length}
	<div class="flex flex-1 gap-4">
		<OrderForm form={data.orderForm} user={data.user} />
		<OrderList />
	</div>
{:else}
	<div class="card flex flex-1 flex-col place-items-center">
		<div class="w-full items-center justify-between gap-4 lg:flex">
			<h2 class="text-2xl font-semibold">Checkout</h2>
		</div>

		<div class="grid flex-1 place-items-center p-2">
			<p class="text-2xl text-neutral-400">No items to checkout</p>
		</div>
	</div>
{/if}
