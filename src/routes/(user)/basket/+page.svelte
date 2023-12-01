<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import StepperInput from '$lib/components/StepperInput.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { getContext, setContext } from 'svelte';
	import WithBasketSummary from '../_components/WithBasketSummary.svelte';
	import type { PageData } from './$types';
	import { debounce } from 'throttle-debounce';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance as sveltekitEnhance } from '$app/forms';
	import { formatter } from '$lib/utils/helpers';
	import type { DialogStates } from '@melt-ui/svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	export let data: PageData;

	setContext('showCheckout', true);
	$: setContext('checkoutForm', data.checkoutForm);

	async function handleQuantityChange(
		e: CustomEvent<{ elem: HTMLInputElement; prev: number; value: number }>
	) {
		const { elem, prev, value } = e.detail;

		const formData = new FormData();
		formData.append('id', elem.id);
		formData.append('quantity', value.toString());

		fetch('?/updateQuantity', {
			method: 'POST',
			body: formData
		})
			.then(() => invalidateAll())
			.catch(() => (elem.value = prev.toString()));
	}

	const debounceChange = debounce(400, handleQuantityChange);
	let openCheckout = false;

	function handlePageChange(e: CustomEvent<{ curr: number; next: number }>) {
		if (browser) {
			const currentUrl = new URL($page.url);
			currentUrl.searchParams.set('page', e.detail.next.toString());
			goto(currentUrl.toString(), { replaceState: true });
		}
	}
</script>

<svelte:head>
	<title>My Basket</title>
</svelte:head>

<WithBasketSummary bind:openCheckout={openCheckout}>
	<div class="flex flex-1 flex-col gap-3">
		<div class="card flex flex-1 flex-col">
			<div class="xs:grid xs:grid-cols-1 flex w-full items-center justify-between gap-2">
				<div class="w-full items-center justify-between gap-4 lg:flex">
					<h2 class="text-2xl font-semibold">Basket</h2>
					<span class="hidden font-medium lg:inline">
						Total: {formatter.format(data.items.total)}
					</span>
				</div>
				<Button class="hidden justify-center lg:inline" on:click={() => (openCheckout = true)}>
					Checkout
				</Button>
			</div>
			{#if data.items.items.length > 0}
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
							{#each data.items.items as item}
								<tr class="text-center">
									<td data-cell="Image" role="cell">
										<div class="aspect-square w-24 overflow-hidden rounded-md bg-slate-500">
											<img src={item.image} alt="thumbnail" />
										</div>
									</td>
									<td data-cell="Product" class="text-left" role="cell">
										<div class="flex flex-col gap-1">
											<a
												class="w-max text-lg font-semibold hover:text-blue-500 hover:underline"
												href="/products/{item.productId}">{item.productName}</a
											>
											<p class=" text-neutral-500">Variant: {item.variant?.name ?? 'Regular'}</p>
										</div>
									</td>
									<td data-cell="Price" role="cell">
										{formatter.format(item.variant?.price ?? item.price)}
									</td>
									<td data-cell="Quantity" role="cell">
										<div class="grid max-h-max place-items-center md:place-items-start">
											<div class="">
												<StepperInput
													id={item.id}
													value={item.quantity}
													min={1}
													on:change={debounceChange}
												/>
											</div>
										</div>
									</td>
									<td role="cell">
										<form
											class="grid place-items-center md:col-span-2"
											method="POST"
											action="?/deleteBasketItem"
											use:sveltekitEnhance
										>
											<input name="id" value={item.id} type="text" readonly hidden />
											<Button class="w-full justify-center" color="danger" size="sm" type="submit">
												Remove
											</Button>
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="grid flex-1 place-items-center text-2xl text-neutral-400">No items found</div>
			{/if}
		</div>
		<Pagination
			total={data.items.total}
			perPage={data.items.limit}
			defaultPage={data.items.page}
			on:pageChange={handlePageChange}
		/>
	</div>
</WithBasketSummary>

<style lang="postcss">
	th {
		@apply p-3 md:hidden;
	}
	td {
		@apply items-center px-4 py-1.5 align-middle md:grid md:text-left md:first:pt-6 md:last:pb-6;
	}
	td:not(:last-child)::before {
		content: attr(data-cell) ': ';
		@apply hidden font-semibold md:inline;
	}
</style>
