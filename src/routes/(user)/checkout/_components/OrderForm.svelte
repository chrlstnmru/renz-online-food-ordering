<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { orderInformationForm, type OrderInformationForm } from '$lib/formValidation';
	import { useBasket } from '$lib/stores/basketStore';
	import type { User } from 'lucia';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';

	export let form: SuperValidated<typeof orderInformationForm>;
	export let user: User | null;

	const { items, clear } = useBasket();

	let showPaymentInfo = false;
	let data: Partial<OrderInformationForm> = {};

	const {
		enhance,
		submitting,
		errors,
		form: formData
	} = superForm(form, {
		multipleSubmits: 'prevent',
		dataType: 'json',
		onUpdated: ({ form }) => {
			const formMsg = form.message;
			if (formMsg && formMsg.type === 'success') {
				clear();
				goto('/orders');
			}
		}
	});

	data.items = $items.map((item) => ({
		productName: item.productName,
		variantName: item.variant,
		quantity: item.quantity,
		total: item.quantity * item.price
	}));

	data = { ...user, userId: user?.id };

	$: {
		const orderItems: OrderInformationForm['items'] = $items.map((item) => ({
			productName: item.productName,
			variantName: item.variant,
			quantity: item.quantity,
			total: item.quantity * item.price
		}));

		data.items = orderItems;
	}

	$: formData.set(data as OrderInformationForm);

	function validateForm() {
		const test = orderInformationForm.omit({ referenceNo: true }).safeParse(data);

		if (!test.success) {
			errors.set(test.error.formErrors.fieldErrors);
			return;
		}

		showPaymentInfo = true;
	}
</script>

<div class="card flex flex-1 flex-col gap-4">
	<h2 class="text-2xl font-semibold">
		{!showPaymentInfo ? 'Payment Information' : 'Order Information'}
	</h2>
	<form class="flex flex-1 flex-col" method="post" use:enhance>
		{#if !showPaymentInfo}
			<div class="flex w-full items-center gap-4">
				<Input
					class="w-full flex-1"
					label="First name"
					name="firstName"
					bind:value={data.firstName}
					disabled={$submitting}
					error={$errors.firstName?.[0]}
					required
				/>
				<Input
					class="w-full"
					label="Last name"
					name="lastName"
					bind:value={data.lastName}
					disabled={$submitting}
					error={$errors.lastName?.[0]}
					required
				/>
				<Input
					label="Middle name"
					name="middleName"
					bind:value={data.middleName}
					error={$errors.middleName?.[0]}
					disabled={$submitting}
				/>
			</div>
			<div class="flex items-center gap-4">
				<Input
					label="Email"
					name="email"
					type="email"
					bind:value={data.email}
					error={$errors.email?.[0]}
					disabled={$submitting}
					required
				/>
				<Input
					label="Phone number"
					type="tel"
					name="phone"
					bind:value={data.phone}
					error={$errors.phone?.[0]}
					disabled={$submitting}
					required
				/>
			</div>
			<Input label="Address" name="address" bind:value={data.address} required />
		{:else}
			<div>
				<div class="flex w-full gap-4">
					<div class="aspect-square w-96">
						<img class="object-contain" src="/images/qr.jpg" alt="gcash qr" />
					</div>
					<div class="flex flex-1 flex-col gap-4 p-4">
						<div>
							<p class="text-sm font-semibold">GCash Name</p>
							<p class="text-xl text-zinc-500">Judge Brent Balingit</p>
						</div>
						<div>
							<p class="text-sm font-semibold">GCash Number</p>
							<p class="text-xl text-zinc-500">0921 475 6575</p>
						</div>

						<Input
							class="w-full"
							label="Reference number"
							name="referenceNo"
							bind:value={data.referenceNo}
							error={$errors.referenceNo?.[0]}
							required
						/>
					</div>
				</div>
			</div>
		{/if}
		{#if !showPaymentInfo}
			<Button on:click={validateForm} class="ml-auto mt-auto max-w-max">Pay with GCash</Button>
		{:else}
			<Button
				disabled={$submitting}
				type="submit"
				class="ml-auto mt-auto max-w-max"
				formaction="?/placeOrder"
			>
				Place Order
			</Button>
		{/if}
	</form>
</div>
