<script lang="ts">
	import StepperInput from '$lib/components/StepperInput.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { useBasket } from '$lib/stores/basketStore';
	import { formatter } from '$lib/utils/helpers';

	export let id: string;
	export let quantity: number;
	export let productId: string;
	export let productName: string;
	export let variantName: string | null = null;
	export let price: number;
	export let imageUrl: string | null;

	const { updateQuantity, removeItem } = useBasket();

	let value = quantity;
	$: updateQuantity(id, value);
</script>

<tr class="text-center">
	<td data-cell="Image" role="cell">
		<div class="aspect-square w-24 overflow-hidden rounded-md bg-slate-500">
			<img src={imageUrl} alt="thumbnail" />
		</div>
	</td>
	<td data-cell="Product" class="text-left" role="cell">
		<div class="flex flex-col gap-1">
			<a
				class="w-max text-lg font-semibold hover:text-blue-500 hover:underline"
				href="/products/{productId}">{productName}</a
			>
			<p class=" text-neutral-500">Variant: {variantName ?? 'Regular'}</p>
		</div>
	</td>
	<td data-cell="Price" role="cell">
		{formatter.format(price)}
	</td>
	<td data-cell="Quantity" role="cell">
		<div class="grid max-h-max place-items-center md:place-items-start">
			<div class="">
				<StepperInput id={id} bind:value={value} min={1} />
			</div>
		</div>
	</td>
	<td role="cell">
		<div class="grid place-items-center md:col-span-2">
			<Button
				class="w-full justify-center"
				color="danger"
				size="sm"
				on:click={() => removeItem(id)}
			>
				Remove
			</Button>
		</div>
	</td>
</tr>

<style lang="postcss">
	td {
		@apply items-center px-4 py-1.5 align-middle md:grid md:text-left md:first:pt-6 md:last:pb-6;
	}
	td:not(:last-child)::before {
		content: attr(data-cell) ': ';
		@apply hidden font-semibold md:inline;
	}
</style>
