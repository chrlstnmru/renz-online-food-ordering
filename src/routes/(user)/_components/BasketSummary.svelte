<script lang="ts">
	import Dialog from '$lib/components/Dialog.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { basketSummaryStore } from '$lib/stores/basketSummaryStore';
	import type { DialogStates } from '@melt-ui/svelte';
	import { getContext } from 'svelte';
	import BasketItems from './BasketItems.svelte';
	import Payment from './Payment.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { checkoutFormSchema } from '$lib/server/validation';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { capitalize, formatter } from '$lib/utils/helpers';
	import { addToast } from '$lib/components/Toaster.svelte';

	const showCheckout = getContext<boolean>('showCheckout') ?? false;
	$: summary = $basketSummaryStore;

	const checkoutForm = getContext<SuperValidated<typeof checkoutFormSchema>>('checkoutForm');
	const { form, enhance, submitting, errors } = superForm(checkoutForm, {
		multipleSubmits: 'prevent',
		warnings: { noValidationAndConstraints: false },
		onUpdated: async ({ form }) => {
			const formMsg = form.message;
			let message = formMsg?.content;
			if (formMsg) {
				addToast(
					{
						title: capitalize(formMsg.type),
						description: message
					},
					formMsg.type
				);

				if (formMsg.type === 'success') {
					await Promise.resolve(setTimeout(() => checkoutDialogStates.open.set(false), 100));
				}
			}
		}
	});

	let checkoutDialogStates: DialogStates;
	let checkoutDialogIndex = 0;
</script>

<Dialog
	bind:states={checkoutDialogStates}
	on:close={() => (checkoutDialogIndex = 0)}
	keepOpen={$submitting}
>
	<svelte:fragment slot="title">Checkout</svelte:fragment>
	<svelte:fragment slot="desc">
		{#if checkoutDialogIndex === 0}
			Review your order
		{:else if checkoutDialogIndex === 1}
			Please pay {formatter.format(summary.total)} using GCash by scanning the QR code below.
		{/if}
	</svelte:fragment>
	<form action="?/checkout" method="POST" use:enhance>
		<div class="my-4 space-y-3">
			{#if checkoutDialogIndex === 0}
				<BasketItems data={summary.entries} total={summary.total} />
			{:else if checkoutDialogIndex === 1}
				<Payment bind:value={$form.refno} error={$errors.refno?.[0]} />
			{/if}
		</div>
		<div class="grid grid-cols-2 gap-1.5">
			<Button
				class="justify-center"
				variant="ghost"
				color="neutral"
				disabled={checkoutDialogIndex === 0}
				on:click={() => checkoutDialogIndex--}>Back</Button
			>
			{#if checkoutDialogIndex === 0}
				<Button class="justify-center" on:click={() => checkoutDialogIndex++}>Next</Button>
			{:else if checkoutDialogIndex === 1}
				<Button class="justify-center" type="submit" loading={$submitting}>Place Order</Button>
			{/if}
		</div>
	</form>
</Dialog>

<aside class="card sticky top-24 flex h-max w-[270px] flex-col gap-4 lg:hidden">
	<h2 class="text-lg font-semibold">Basket Summary</h2>
	<BasketItems data={summary.entries} total={summary.total} />
	{#if showCheckout}
		{#if summary.entries.length !== 0}
			<Button
				class="w-full justify-center"
				color="primary"
				variant="solid"
				on:click={() => checkoutDialogStates.open.set(true)}>Checkout</Button
			>
		{/if}
	{:else}
		<a href="/basket">
			<div
				class="rounded-md bg-primary-500 p-2 text-center text-white hover:opacity-80 active:opacity-95"
			>
				View Basket
			</div>
		</a>
	{/if}
</aside>
