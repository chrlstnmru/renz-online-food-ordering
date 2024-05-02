<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import Button, { buttonVariants } from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { useBasket } from '$lib/stores/basketStore';
	import { OrderForm, OrderList } from './_components';

	export let data;

	const { items, clear } = useBasket();

	$: success = $page.url.searchParams.has('success');
	$: orderId = $page.url.searchParams.get('orderId');

	let copyDisabled = false;

	$: if (success) clear()

	function copyOrderId() {
		if (orderId) {
			navigator.clipboard.writeText(orderId);
			copyDisabled = true;
			setTimeout(() => (copyDisabled = false), 2000);
		}
	}
</script>

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
	<div class="card grid flex-1 place-items-center">
		<div class="flex flex-col items-center gap-4">
			<p class="text-2xl text-neutral-400">No items in basket</p>
			<a class={buttonVariants({ class: 'hover:text-white' })} href="/home">Go to Home</a>
		</div>
	</div>
{/if}
