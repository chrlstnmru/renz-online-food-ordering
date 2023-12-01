<script lang="ts">
	// @ts-ignore
	import autosize from 'svelte-autosize';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Dialog from '$lib/components/Dialog.svelte';
	import { addToast } from '$lib/components/Toaster.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Paginated, UserOrder } from '$lib/server/types';
	import type { rejectOrderFormSchema, updateOrderFormSchema } from '$lib/server/validation';
	import { capitalize } from '$lib/utils/helpers';
	import Icon from '@iconify/svelte';
	import { createPopover, melt, type DialogStates, createTooltip } from '@melt-ui/svelte';
	import Select from 'svelte-select';
	import { fade } from 'svelte/transition';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';
	import { debounce } from 'throttle-debounce';
	import Tooltip from '$lib/components/Tooltip.svelte';

	export let data: Paginated<UserOrder>;
	export let orderForm: SuperValidated<typeof updateOrderFormSchema>;
	export let rejectForm: SuperValidated<typeof rejectOrderFormSchema>;

	// Update order form
	const { enhance, submitting } = superForm(orderForm, {
		multipleSubmits: 'prevent',
		clearOnSubmit: 'errors-and-message',
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
					await Promise.resolve(setTimeout(() => dialogStates.open.set(false), 100));
				}
			}
		}
	});

	// Reject order form
	const {
		form,
		enhance: rejectEnhance,
		submitting: rejectSubmitting,
		reset: rejectFormReset
	} = superForm(rejectForm, {
		multipleSubmits: 'prevent',
		clearOnSubmit: 'errors-and-message',
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
					await Promise.resolve(setTimeout(() => dialogStates.open.set(false), 100));
				}
			}
		}
	});

	// Default data
	const paymentStatuses = [
		{ label: 'unverified', value: false },
		{ label: 'verified', value: true }
	];

	const orderStatuses = [
		{ label: 'waiting', value: 'waiting' },
		{ label: 'preparing', value: 'preparing' },
		{ label: 'delivering', value: 'delivering' },
		{ label: 'delivered', value: 'delivered' },
		{ label: 'rejected', value: 'rejected' }
	];
	function getCurrentOrderStatus() {
		return orderStatuses
			.toSpliced(
				0,
				orderStatuses.findIndex((item) => item.value === selectedOrder.status)
			)
			.filter((item) => item.value !== 'rejected');
	}

	let selectedOrder: UserOrder;
	let paymentStatus = false;
	let orderStatus = 'waiting';

	let dialogStates: DialogStates;
	function openView(i: number) {
		selectedOrder = data.items[i];
		paymentStatus = selectedOrder.verified;
		orderStatus = selectedOrder.status;
		dialogStates.open.set(true);
	}

	let alertStates: DialogStates;
	function openAlert(i: number) {
		selectedOrder = data.items[i];
		if (
			selectedOrder.verified ||
			selectedOrder.status === 'delivered' ||
			selectedOrder.status === 'rejected'
		)
			return;
		alertStates.open.set(true);
		rejectFormReset();
	}

	function reset() {
		paymentStatus = false;
		orderStatus = 'waiting';
	}

	const {
		elements: { trigger: verifiedTrigger, content: verifiedContent, arrow: verifiedArrow },
		states: { open: verifiedOpen }
	} = createPopover({
		forceVisible: true,
		positioning: { placement: 'bottom' }
	});

	const {
		elements: { trigger: statusTrigger, content: statusContent, arrow: statusArrow },
		states: { open: statusOpen }
	} = createPopover({
		forceVisible: true,
		positioning: { placement: 'bottom' }
	});

	const applyFilters = debounce(400, handleFilters);
	function handleFilters() {
		if (browser) {
			const currentUrl = new URL($page.url);
			currentUrl.searchParams.set('paymentFilter', JSON.stringify(paymentFilters));
			currentUrl.searchParams.set('statusFilter', JSON.stringify(statusFilters));
			goto(currentUrl.toString(), { replaceState: true });
		}
	}

	let paymentFilters: string[] = JSON.parse($page.url.searchParams.get('paymentFilter') || '[]');
	function onPaymentFilterChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const { name, checked, value } = target;

		if (!paymentFilters.includes(name) && checked) {
			paymentFilters.push(value);
		} else {
			paymentFilters = paymentFilters.filter((item) => item !== value);
		}

		applyFilters();
	}

	let statusFilters: string[] = [];
	function onStatusFilterChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const { name, checked, value } = target;

		if (!statusFilters.includes(name) && checked) {
			statusFilters.push(value);
		} else {
			statusFilters = statusFilters.filter((item) => item !== value);
		}

		applyFilters();
	}
</script>

<Dialog bind:states={dialogStates} on:close={reset}>
	<svelte:fragment slot="title">Order Information</svelte:fragment>
	<form
		action={selectedOrder.status !== 'rejected' ? '?/updateOrder' : ''}
		method="POST"
		use:enhance
	>
		<input name="orderId" type="text" value={selectedOrder.id} readonly hidden />
		<input name="verified" type="text" value={paymentStatus} readonly hidden />
		<input name="status" type="text" value={orderStatus} readonly hidden />
		<div id="order-details" class="my-4">
			<p data-label="Order #">{selectedOrder.id}</p>
			<p data-label="Reference #">{selectedOrder.refno}</p>
			<p data-label="Recipient">{selectedOrder.recipient}</p>
			<p data-label="Description">{selectedOrder.description.join(',\n')}</p>
			<p data-label="Date ordered">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
			{#if !selectedOrder.verified && !(selectedOrder.status === 'delivered' || selectedOrder.status === 'rejected')}
				<label for="paymentStatus" data-label="Payment Status">
					<Select
						id="paymentStatus"
						class="!flex !border-slate-500 focus-within:!border-slate-500 focus-within:!ring-1 focus-within:!ring-slate-600"
						items={paymentStatuses}
						value={paymentStatuses.find((item) => item.value === selectedOrder.verified)}
						bind:justValue={paymentStatus}
						searchable={false}
						clearable={false}
						showChevron
					/>
				</label>
			{:else}
				<p data-label="Payment Status">
					{selectedOrder.status === 'rejected' ? 'rejected' : 'verified'}
				</p>
			{/if}
			{#if !(selectedOrder.status === 'delivered' || selectedOrder.status === 'rejected')}
				<label for="orderStatus" data-label="Order Status">
					<Select
						id="orderStatus"
						class="!flex !border-slate-500 focus-within:!border-slate-500 focus-within:!ring-1 focus-within:!ring-slate-600"
						items={getCurrentOrderStatus()}
						value={getCurrentOrderStatus().find((item) => item.value === orderStatus)}
						searchable={false}
						clearable={false}
						bind:justValue={orderStatus}
						disabled={!paymentStatus}
						showChevron
					/>
				</label>
			{:else}
				<div data-label="Order Status">
					<p class="!p-0">
						{selectedOrder.status === 'rejected' ? 'rejected' : 'delivered'}<br />
						<span class="text-sm">Reason: {selectedOrder.rejectReason}</span>
					</p>
				</div>
			{/if}
			<p data-label="Last Update">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
		</div>
		{#if !(selectedOrder.status === 'rejected' || selectedOrder.status === 'delivered')}
			<Button class="w-full justify-center" type="submit" loading={$submitting}>
				Update Order
			</Button>
		{/if}
	</form>
</Dialog>

<Dialog bind:states={alertStates} type="alertdialog">
	<svelte:fragment slot="title">Confirm Action</svelte:fragment>
	<svelte:fragment slot="desc">
		Reject order <span class="font-medium">#{selectedOrder.id}</span>
	</svelte:fragment>
	<form class="mt-4 space-y-4" action="?/rejectOrder" method="post">
		<input type="text" name="orderId" value={selectedOrder.id} hidden />
		<label class="grid">
			Reason
			<textarea
				class="max-h-[200px] rounded-md"
				name="reason"
				id="reason"
				placeholder="e.i. Invalid reference no."
				bind:value={$form.reason}
				use:autosize
			/>
		</label>
		<Button class="w-full justify-center" color="danger" type="submit">Reject</Button>
	</form>
</Dialog>

<div class="custom-scrollbar mt-4 flex-1 overflow-y-auto rounded-md border">
	<table class="relative w-full" class:h-full={!data.items.length}>
		<thead class="sticky top-0 border-b">
			<th class="w-0">Order #</th>
			<th class="w-[12ch]">Reference #</th>
			<th class="text-left">Recipient</th>
			<th>
				<button
					class="flex w-full items-center justify-center gap-1.5 text-center"
					use:melt={$verifiedTrigger}
				>
					Payment Status
					<Icon class="text-xs" icon="bxs:down-arrow" />
				</button>
			</th>
			<th>
				<button
					class="flex w-full items-center justify-center gap-1.5 text-center"
					use:melt={$statusTrigger}
				>
					Order Status
					<Icon class="text-xs" icon="bxs:down-arrow" />
				</button>
			</th>
			<th>Date Ordered</th>
			<th>Last Update</th>
			<th class="w-0">Actions</th>
		</thead>
		<tbody>
			{#each data.items as item, i (item.id)}
				<tr class="text-center odd:bg-black/[0.025]">
					<td class="w-0">{item.id}</td>
					<td class="min-w-[18ch]">{item.refno}</td>
					<td class="max-w-[32ch] truncate text-left">{item.recipient}</td>
					<td class="">
						<span
							data-status={item.status === 'rejected'
								? 'rejected'
								: item.verified
								  ? 'verified'
								  : 'unverified'}
						>
							{item.verified === true ? 'verified' : 'unverified'}
						</span>
						{#if item.status === 'rejected'}
							<Tooltip tip={item.rejectReason}>
								<div class="inline hover:cursor-help">
									<Icon class="inline text-lg" icon="material-symbols:info-outline" />
								</div>
							</Tooltip>
						{/if}
					</td>
					<td>
						<span data-status={item.status}>{item.status}</span>
						{#if item.status === 'rejected'}
							<Tooltip tip={item.rejectReason}>
								<div class="inline hover:cursor-help">
									<Icon class="inline text-lg" icon="material-symbols:info-outline" />
								</div>
							</Tooltip>
						{/if}
					</td>
					<td>
						<span>{new Date(item.createdAt).toLocaleDateString()}</span>
					</td>
					<td>
						<span>{new Date(item.updatedAt).toLocaleDateString()}</span>
					</td>
					<td>
						<div class="flex gap-2">
							<Button
								class="justify-center px-2.5 py-1.5 text-xs uppercase"
								color="neutral"
								size="sm"
								on:click={() => openView(i)}
							>
								view
							</Button>
							<div data-button class="grid">
								<Button
									class="justify-center px-2.5 py-1.5 text-xs uppercase"
									color="danger"
									size="sm"
									disabled={item.verified ||
										item.status === 'delivered' ||
										item.status === 'rejected'}
									on:click={() => openAlert(i)}
								>
									reject
								</Button>
							</div>
						</div>
					</td>
				</tr>
			{:else}
				<tr class="h-full text-secondary-300 text-3xl">
					<td colspan="8" class="py-4 text-center">No order found.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if $verifiedOpen}
	<div use:melt={$verifiedContent} transition:fade={{ duration: 75 }} class="content">
		<div use:melt={$verifiedArrow} />
		<div class="card flex flex-col gap-2.5" on:change={onPaymentFilterChange}>
			<label class="flex items-center gap-2">
				<input
					class="rounded"
					type="checkbox"
					name="paymentVerified"
					id="paymentVerified"
					value="true"
					checked={paymentFilters.includes('true')}
				/>
				Verified
			</label>
			<label class="flex items-center gap-2">
				<input
					class="rounded"
					type="checkbox"
					name="paymentUnverified"
					id="paymentUnverified"
					value="false"
					checked={paymentFilters.includes('false')}
				/>
				Unverified
			</label>
		</div>
	</div>
{/if}

{#if $statusOpen}
	<div use:melt={$statusContent} transition:fade={{ duration: 75 }} class="content">
		<div use:melt={$statusArrow} />
		<div class="card flex flex-col gap-2.5" on:change={onStatusFilterChange}>
			{#each orderStatuses as status, i (i)}
				<label class="flex items-center gap-2">
					<input
						class="rounded"
						type="checkbox"
						name="status-{status.value}"
						value={status.value}
						id="status-{status.value}"
						checked={statusFilters.includes(status.value)}
					/>
					{status.label}
				</label>
			{/each}
		</div>
	</div>
{/if}

<style lang="postcss">
	th {
		@apply bg-white px-5 py-3;
	}
	td {
		@apply px-5 py-2.5;
	}

	[data-label] {
		@apply grid grid-cols-[15ch,auto];
	}
	[data-label]::before {
		content: attr(data-label) ': ';
	}
	#order-details > :nth-child(odd) {
		@apply bg-black/[0.025];
	}
	form div > * {
		@apply px-4 py-3;
	}

	[data-button]:has(button:disabled) {
		cursor: not-allowed;
	}

	textarea::placeholder {
		@apply text-sm;
	}
</style>
