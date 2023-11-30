<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { ProductVariantForm } from '$lib/server/validation';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let index = -1;
	export let details: ProductVariantForm;
</script>

<div class="rounded-md border p-4">
	<div class="flex items-center justify-between">
		Variant{details.name.length > 0 ? `: ${details.name}` : ` #${index + 1}`}
		<Button color="danger" size="xs" on:click={() => dispatch('remove')}>Remove</Button>
	</div>
	<div class="space-y-2">
		<div class="grid grid-cols-2 gap-3">
			<Input label="Name" name="name" bind:value={details.name} hideError />
			<Input label="Price" name="Price" type="number" bind:value={details.price} hideError />
		</div>
		<Input label="Description" name="desc" bind:value={details.description} hideError />
	</div>
</div>
