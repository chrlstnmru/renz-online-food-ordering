<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { ProductVariantSelect } from '$lib/server/db/schema/ProductSchema';
	import WithBasketSummary from '../../_components/WithBasketSummary.svelte';
	import type { PageData } from './$types';
	import Select from 'svelte-select';
	import { superForm } from 'sveltekit-superforms/client';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { capitalize, formatter } from '$lib/utils/helpers';
	import { page } from '$app/stores';
	import RatingsChart from '../_components/RatingsChart.svelte';
	import Reviews from '../_components/Reviews.svelte';
	import type { BasketEntry, Paginated, RatingsData, UserReview } from '$lib/server/types';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import { appendEntry } from '$lib/stores/basketSummaryStore';
	import Dialog from '$lib/components/Dialog.svelte';
	import type { DialogStates } from '@melt-ui/svelte';
	import Payment from '../../_components/Payment.svelte';
	import Login from '$lib/components/Login.svelte';

	export let data: PageData;

	$: ({ session } = data);

	const {
		form: basketForm,
		enhance: basketEnhance,
		submitting: basketSubmitting
	} = superForm(data.addProductForm, {
		taintedMessage: false,
		multipleSubmits: 'prevent',
		invalidateAll: false,
		onSubmit: (req) => {
			if (session) {
				req.formData.append('userId', session.user.userId);
				req.formData.append('productId', $page.params.id);
			}
			req.formData.set('variantId', selectedVariant?.id ?? '');
		},
		onUpdated: ({ form }) => {
			const formMsg = form.message;
			let message = formMsg?.content;
			if (formMsg) {
				if (formMsg.content.id) {
					const addedProduct = formMsg.content as BasketEntry;
					appendEntry(addedProduct);
					message = `${addedProduct.product.name} has been added to basket.`;
				}
				addToast(
					{
						title: capitalize(formMsg.type),
						description: message
					},
					formMsg.type
				);
			}
		}
	});
	$basketForm.quantity = 1;

	let variants: ProductVariantSelect[] = [];
	let selectedVariant: ProductVariantSelect;
	let ratings: RatingsData;

	$: if (data.product.ratings) {
		ratings = data.product.ratings;
	}
	$: if (data.product.variants) {
		variants = [
			{ id: undefined, name: 'Regular', price: data.product.price },
			...data.product.variants
		] as ProductVariantSelect[];
	}

	let userReviews = writable<UserReview[]>(data.product.reviews ?? []);
	let reviewCount = data.product.reviews?.length || 0;
	let reviewTotal = data.product.ratings?.total || 0;
	let isLoadingComments = false;
	setContext('userReviews', userReviews);

	async function loadMoreComments() {
		let limit = 5;
		let offset = (reviewCount / limit) * limit;

		isLoadingComments = true;
		const res = await fetch(
			`/api/products/${$page.params.id}/reviews?limit=${limit}&offset=${offset}`
		);
		const result = (await res.json()) as Paginated<UserReview>;

		reviewCount += result.items.length;
		userReviews.set([...$userReviews, ...result.items]);
	}

	let orderNowDialogStates: DialogStates;

	const {
		form: orderForm,
		enhance: orderEnhance,
		submitting: orderSubmitting,
		errors: orderErrors
	} = superForm(data.instantOrderForm, {
		multipleSubmits: 'prevent',
		clearOnSubmit: 'errors-and-message',
		invalidateAll: false,
		taintedMessage: false,
		onSubmit: (req) => {
			if (session) {
				req.formData.append('userId', session.user.userId);
				req.formData.append('productId', $page.params.id);
			}
			req.formData.set('variantId', selectedVariant?.id ?? '');
		},
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
					await Promise.resolve(setTimeout(() => orderNowDialogStates.open.set(false), 100));
					$orderForm.refno = '';
				}
			}
		}
	});

	let loginModal: DialogStates;

	function openOrderNowDialog() {
		if (session) {
			orderNowDialogStates.open.set(true);
		} else {
			loginModal.open.set(true);
		}
	}

	function openLoginModal() {
		if (!session) {
			loginModal.open.set(true);
		}
	}
</script>

<svelte:head>
	<title>{data.product.name}</title>
</svelte:head>

<Dialog bind:states={orderNowDialogStates} keepOpen={$orderSubmitting}>
	<svelte:fragment slot="title">
		Buy {$basketForm.quantity}x {data.product.name} ({selectedVariant?.name ?? 'Regular'})
	</svelte:fragment>
	<svelte:fragment slot="desc">
		Please pay
		<span class="font-medium"
			>{formatter.format(
				(selectedVariant?.price ?? data.product.price) * $basketForm.quantity
			)}</span
		> using GCash by scanning the QR code below.
	</svelte:fragment>
	<form action="?/instantOrder" method="POST" use:orderEnhance>
		<input name="productId" value={data.product.id} type="text" hidden />
		<input name="variantId" value={selectedVariant?.id} type="text" hidden />
		<input name="quantity" value={$basketForm.quantity} type="text" hidden />
		<div class="my-4 space-y-3">
			<Payment bind:value={$orderForm.refno} error={$orderErrors.refno?.[0]} />
		</div>
		<div class="grid grid-cols-2 gap-1.5">
			<Button
				class="justify-center"
				variant="ghost"
				color="neutral"
				on:click={() => orderNowDialogStates.open.set(false)}>Cancel</Button
			>
			<Button class="justify-center" type="submit" loading={$orderSubmitting}>Place Order</Button>
		</div>
	</form>
</Dialog>

<Dialog bind:states={loginModal}>
	<svelte:fragment slot="title">Sign in to continue</svelte:fragment>
	<div class="mt-3">
		<Login />
	</div>
</Dialog>

<WithBasketSummary>
	<div class="card mx-auto w-full max-w-3xl space-y-12 p-6 sm:max-w-md">
		<section class="mx-auto flex gap-6 sm:flex-col">
			<div class="max-w-[400px] flex-grow overflow-hidden rounded-md">
				<img class="object-cover" src="/images/best-0.png" alt="" />
			</div>
			<div class="flex flex-col justify-between gap-4">
				<h2 class="text-4xl font-semibold">{data.product.name}</h2>
				<form class="grid w-full space-y-2" method="POST" use:basketEnhance>
					<div>
						<label for="variant">Variant</label>
						<Select
							id="variant"
							class="!flex !border-slate-500 focus-within:!border-slate-500 focus-within:!ring-1 focus-within:!ring-slate-600 sm:!max-w-full"
							itemId="id"
							label="name"
							items={variants}
							value={variants[0]}
							clearable={false}
							searchable={false}
							on:change={(e) => (selectedVariant = e.detail)}
							showChevron
						/>
					</div>
					<Input
						label="Quantity"
						name="quantity"
						type="number"
						min="1"
						bind:value={$basketForm.quantity}
						hideError
					/>
					<Input
						label="Price"
						value={`${formatter.format(
							(selectedVariant?.price || data.product.price) * $basketForm.quantity
						)}`}
						readonly
					/>
					<div class="grid grid-cols-2 gap-2">
						<Button
							class="justify-center"
							color="neutral"
							loading={$basketSubmitting}
							type={data.session ? 'submit' : 'button'}
							formaction="?/addToBasket"
							on:click={openLoginModal}
						>
							{$basketSubmitting ? '' : 'Add to basket'}
						</Button>
						<Button class="justify-center" on:click={openOrderNowDialog}>Order now</Button>
					</div>
				</form>
			</div>
		</section>
		<section class="grid w-full">
			<h2 class="text-xl font-semibold">Ratings and Reviews</h2>
			<RatingsChart data={ratings} />
			<Reviews reviewForm={data.reviewForm} productId={$page.params.id} />
			{#if reviewCount < reviewTotal}
				<Button
					class="mx-auto justify-center"
					variant="ghost"
					color="neutral"
					loading={isLoadingComments}
					on:click={loadMoreComments}
				>
					Load more
				</Button>
			{/if}
		</section>
	</div>
</WithBasketSummary>
