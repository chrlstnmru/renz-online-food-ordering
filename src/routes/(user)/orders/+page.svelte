<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { capitalize, formatter } from '$lib/utils/helpers';
	import { superForm } from 'sveltekit-superforms/client';
	import WithBasketSummary from '../_components/WithBasketSummary.svelte';
	import type { PageData } from './$types';
	import { addToast } from '$lib/components/Toaster.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Icon from '@iconify/svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import type { DialogStates } from '@melt-ui/svelte';

	export let data: PageData;

	const { enhance, submitting } = superForm(data.cancelOrderForm, {
		taintedMessage: false,
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
					await Promise.resolve(setTimeout(() => alertState.open.set(false), 100));
					selectedOrderId = '';
				}
			}
		}
	});

	let selectedOrderId: string;
	let alertState: DialogStates;
	function showAlert(i: number) {
		const order = data.orders[i];
		selectedOrderId = order.id;
		if (order.status !== 'waiting') return;
		alertState.open.set(true);
	}
</script>

<svelte:head>
	<title>My Orders</title>
</svelte:head>

<Dialog bind:states={alertState}>
	<svelte:fragment slot="title">Confirm Cancellation</svelte:fragment>
	<svelte:fragment slot="desc">Are you sure you want to cancel this order?</svelte:fragment>
	<form class="mt-3 flex flex-col" method="POST" action="?/cancelOrder" use:enhance>
		<input name="orderId" type="text" value={selectedOrderId} hidden />
		<div class="grid grid-cols-2 gap-1.5 self-end">
			<Button
				class="justify-center"
				type="button"
				color="neutral"
				on:click={() => alertState.open.set(false)}>No</Button
			>
			<Button class="justify-center" type="submit" color="danger" loading={$submitting}>Yes</Button>
		</div>
	</form>
</Dialog>

<WithBasketSummary>
	<div class="flex flex-1 flex-col gap-3">
		<div class="card flex-1">
			<h2 class="text-2xl font-semibold">My Orders</h2>
			{#if data.orders.length > 0}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="text-base md:text-xl">
							<th class="w-0 text-left">Order ID</th>
							<th class="text-left">Description</th>
							<th>Amount</th>
							<th>Date Ordered</th>
							<th>Order Status</th>
							<th>Action</th>
						</thead>
						<tbody class="text-lg">
							{#each data.orders as order, i (order.id)}
								<tr class="text-center odd:bg-neutral-100">
									<td class="text-justify" data-cell="Order #">{order.id}</td>
									<td data-cell="Description" class="text-left">
										{#each order.description as desc}
											<p>{desc}</p>
										{/each}
									</td>
									<td data-cell="Amount">{formatter.format(order.total)}</td>
									<td data-cell="Data Ordered">{new Date(order.createdAt).toLocaleDateString()}</td>
									<td data-cell="Order Status">
										<span
											class="rounded-full border border-amber-500 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-500 md:w-max"
											data-status={order.status}
										>
											{order.status}
										</span>
										{#if order.status === 'rejected'}
											<Tooltip tip={order.rejectReason}>
												<div class="inline hover:cursor-help">
													<Icon class="inline text-lg" icon="material-symbols:info-outline" />
												</div>
											</Tooltip>
										{/if}
									</td>
									<td>
										<Button
											class="justify-center"
											color="danger"
											size="sm"
											disabled={order.status !== 'waiting'}
											on:click={() => showAlert(i)}
										>
											Cancel
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="grid h-full place-items-center text-center text-2xl text-neutral-500">
					You have no orders yet.
				</div>
			{/if}
		</div>
		<Pagination />
	</div>
</WithBasketSummary>

<style lang="postcss">
	th {
		@apply p-3 md:hidden;
	}
	td {
		@apply px-4 py-1.5 align-top md:grid md:text-left md:first:pt-6 md:last:pb-6;
	}
	td:not(:last-child)::before {
		content: attr(data-cell) ': ';
		@apply hidden font-semibold md:inline;
	}
</style>
