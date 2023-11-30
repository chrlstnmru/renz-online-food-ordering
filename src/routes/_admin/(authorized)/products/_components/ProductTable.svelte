<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Dialog from '$lib/components/Dialog.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { addToast } from '$lib/components/Toaster.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type {
		ProductForm,
		productForm as productFormSchema,
		ProductVariantForm
	} from '$lib/server/validation';
	import Icon from '@iconify/svelte';
	import type { DialogStates } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';
	import Select from 'svelte-select';
	import VariantForm from './VariantForm.svelte';
	import { setContext } from 'svelte';
	import Dropzone from 'svelte-file-dropzone/Dropzone.svelte';
	import ImageCropper from './ImageCropper.svelte';
	import type { Point } from 'svelte-easy-crop/types';
	import type { Paginated, Product } from '$lib/server/types';
	import { formatter, parseAssetURL } from '$lib/utils/helpers';

	export let form: SuperValidated<typeof productFormSchema>;
	export let categories: { id?: string; name: string }[];
	export let products: Paginated<Product>;
	$: categories = [{ id: undefined, name: 'None' }, ...categories];

	const {
		form: productForm,
		reset,
		enhance,
		submitting
	} = superForm(form, {
		dataType: 'json',
		clearOnSubmit: 'errors-and-message',
		multipleSubmits: 'prevent',
		onSubmit: ({ formData }) => {
			console.log(cropResult?.imageBlob);

			if (cropResult?.imageBlob) {
				formData.append('image', cropResult.imageBlob);
			}
		},
		onUpdated(event) {
			const message = event.form.message;
			if (message) handleMessae(message);

			if (message?.type === 'success') {
				resetFields();
				modifyDialogStates?.open.set(false);
				imageDialogStates?.open.set(false);
			}
		}
	});
	setContext('productForm', productForm);

	// Form states
	let auditMode: 'create' | 'update' | 'delete' = 'create';
	let formCreateIndex = 0;
	let variants: ProductVariantForm[] = $productForm.variants ?? [];

	// Dialog states
	let modifyDialogStates: DialogStates;
	let imageDialogStates: DialogStates;

	// Image states
	let imageUploaderElem: HTMLInputElement;
	let imageName: string;
	let imageDataURI: string;
	let imageCropMap: { origin: Point; zoom: number } = { origin: { x: 0, y: 0 }, zoom: 1 };
	let cropResult: { imageBlob: Blob; imageURI: string } | null;

	function resetFields() {
		reset();
		discardImage();
		formCreateIndex = 0;
		auditMode = 'create';
	}

	function discardImage() {
		cropResult = null;
		imageCropMap = { origin: { x: 0, y: 0 }, zoom: 1 };
	}

	function handleImageUpload(e: CustomEvent<{ acceptedFiles: File[]; event: Event }>) {
		const files = e.detail.acceptedFiles;

		if (files.length > 0) {
			imageName = files[0].name;
			readAsDataURL(files[0]);
			imageDialogStates.open.set(true);
		}
	}

	function readAsDataURL(file: File | Blob) {
		const reader = new FileReader();
		reader.onload = (e) => {
			imageDataURI = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	function onCropComplete(event: CustomEvent<{ origin: Point; zoom: number }>) {
		imageCropMap = event.detail;
		imageDialogStates.open.set(false);
	}

	function appendVariant() {
		variants = [...variants, { id: null, name: '', price: 0, description: '' }];
	}

	function removeVariant(index: number) {
		variants = variants.filter((_, i) => i !== index);
	}

	function applyVariants() {
		variants = variants?.filter((v) => v.name.length > 0);
		productForm.update((form) => {
			form.variants = variants;
			return form;
		});
		formCreateIndex = 0;
	}

	function getVariantsName() {
		return variants.map((v) => v.name).join(', ');
	}

	async function handleEdit(i: number) {
		const { id, name, category, price, image, variants: productVariants } = products.items[i];
		const imageBlob = image ? await fetchBlobImage(image) : null;

		if (imageBlob) {
			readAsDataURL(imageBlob);
			cropResult = { imageBlob, imageURI: imageDataURI };
			imageName = id + '.jpg';
		}

		productForm.update((form) => {
			form.id = id;
			form.name = name;
			form.categoryId = category?.id;
			form.price = price;
			// form.variants = productVariants;
			return form;
		});
		variants = productVariants;

		auditMode = 'update';
		modifyDialogStates.open.set(true);
	}

	function handleDelete(i: number) {
		auditMode = 'delete';
		productForm.update((form) => {
			form.id = products.items[i].id;
			form.name = products.items[i].name;
			return form;
		});
		modifyDialogStates.open.set(true);
	}

	async function fetchBlobImage(url: string) {
		const asset = await parseAssetURL(url);
		return await asset.blob();
	}

	function handleSearch(e: SubmitEvent) {
		if (browser) {
			const formData = new FormData(e.target as HTMLFormElement);
			const q = formData.get('search');
			const currentQuerry = new URLSearchParams($page.url.searchParams);
			currentQuerry.set('search', q as string);

			goto(`?${currentQuerry.toString()}`, { replaceState: true });
		}
	}

	function handleMessae(message: App.Superforms.Message) {
		if (message?.type === 'success') {
			addToast(
				{
					title: 'Success',
					description: message.content
				},
				'success'
			);
		}

		if (message?.type === 'warning') {
			addToast(
				{
					title: 'Warning',
					description: message.content
				},
				'warning'
			);
		}

		if (message?.type === 'error') {
			addToast(
				{
					title: 'Error',
					description: message.content
				},
				'error'
			);
		}
	}
</script>

<!-- Form dialog -->
<Dialog bind:states={modifyDialogStates} on:close={resetFields}>
	<svelte:fragment slot="title">
		{#if auditMode === 'create'}
			{formCreateIndex === 0 ? 'Create Product' : 'Create Variant'}
		{:else if auditMode === 'update'}
			Update Product
		{:else if auditMode === 'delete'}
			Delete Product
		{/if}
	</svelte:fragment>
	<div class="max-h-max max-w-sm">
		{#if auditMode !== 'delete'}
			{#if formCreateIndex === 0}
				<form
					action="?/{auditMode === 'create' ? 'createProduct' : 'updateProduct'}"
					method="POST"
					enctype="multipart/form-data"
					use:enhance
				>
					<!-- Name and price -->
					<fieldset class="grid grid-cols-2 gap-2.5" disabled={$submitting}>
						<Input label="Name" name="name" bind:value={$productForm.name} />
						<Input label="Price" name="Price" type="number" bind:value={$productForm.price} />
					</fieldset>
					<!-- Category -->
					<fieldset disabled={$submitting}>
						<label for="categoryId">Category</label>
						<Select
							id="categoryId"
							class="!flex !border-slate-500 focus-within:!border-slate-500 focus-within:!ring-1 focus-within:!ring-slate-600 sm:!max-w-full"
							itemId="id"
							label="name"
							items={categories}
							value={categories.find((category) => category.id === $productForm.categoryId) ??
								categories[0]}
							clearable={false}
							searchable={false}
							bind:justValue={$productForm.categoryId}
							showChevron
						/>
						<p class="error-field"></p>
					</fieldset>

					<!-- Variants -->
					<fieldset class="grid" disabled={$submitting}>
						Variants
						<button
							class="flex w-full items-center overflow-hidden rounded-md border border-slate-500 px-5 py-2 text-left"
							type="button"
							on:click={() => (formCreateIndex = 1)}
						>
							<span class="w-full truncate">{variants.length > 0 ? getVariantsName() : 'None'}</span
							>
							<Icon class="ml-auto text-lg" icon="pajamas:arrow-right" />
						</button>
						<p class="error-field"></p>
					</fieldset>
					<!-- Image Uploader -->
					<fieldset disabled={$submitting}>
						Image
						{#if !cropResult}
							<Dropzone
								containerClasses="!border-slate-500 !border-solid !border !rounded-md"
								on:dropaccepted={handleImageUpload}
								bind:inputElement={imageUploaderElem}
								accept="image/png,image/jpeg"
								multiple={false}
								name="image"
							>
								<p class="text-slate-500">Drag a file or click to thumbnail.</p>
							</Dropzone>
						{:else}
							<div class="flex items-center gap-2">
								<button
									class="grid w-full overflow-hidden rounded-md border border-slate-500 px-5 py-2 text-left"
									type="button"
									on:click={() => imageDialogStates.open.set(true)}
								>
									<span class="w-full truncate">{imageName}</span>
								</button>
								<Button class="p-3" color="danger" square on:click={discardImage}>
									<Icon icon="ic:baseline-delete" class="text-lg" />
								</Button>
							</div>
						{/if}
					</fieldset>
					<Button class="mt-4 w-full justify-center" loading={$submitting} type="submit">
						{#if auditMode === 'create'}
							Create
						{:else if auditMode === 'update'}
							Update
						{/if}
					</Button>
				</form>
			{:else if formCreateIndex === 1}
				<div class="flex w-full flex-col space-y-3">
					<ul class="space-y-2 overflow-y-auto">
						{#each variants as variant, i}
							<li>
								<VariantForm bind:details={variant} index={i} on:remove={() => removeVariant(i)} />
							</li>
						{:else}
							<li class="flex items-center text-center justify-center h-20 text-secondary-300">
								No variants found.
							</li>
						{/each}
					</ul>
					<div class="flex flex-row-reverse items-center gap-2">
						<Button class="w-full justify-center" on:click={appendVariant}>Add</Button>
						<Button
							class="w-full justify-center"
							variant="ghost"
							color="neutral"
							on:click={() => applyVariants()}
						>
							Back
						</Button>
					</div>
				</div>
			{/if}
		{:else}
			<p class="mt-2">
				Are you sure you want to delete <span class="font-semibold">{$productForm.name}</span>?
			</p>
			<form
				class="grid grid-cols-2 gap-2"
				action="?/deleteProduct"
				method="POST"
				enctype="multipart/form-data"
				use:enhance
			>
				<input type="text" name="id" bind:value={$productForm.id} readonly hidden />
				<Button
					class="mt-4 w-full justify-center"
					variant="ghost"
					color="neutral"
					loading={$submitting}
					on:click={() => modifyDialogStates.open.set(false)}
				>
					Cancel
				</Button>
				<Button
					class="mt-4 w-full justify-center"
					color="danger"
					loading={$submitting}
					type="submit"
				>
					Delete
				</Button>
			</form>
		{/if}
	</div>
</Dialog>

<!-- Image cropper dialog -->
<Dialog bind:states={imageDialogStates}>
	<svelte:fragment slot="title">Image Crop</svelte:fragment>
	<ImageCropper
		origin={imageCropMap.origin}
		zoom={imageCropMap.zoom}
		bind:image={imageDataURI}
		bind:result={cropResult}
		on:crop={onCropComplete}
		on:discard={() => imageDialogStates.open.set(false)}
	/>
</Dialog>

<!-- Page -->
<div class="flex flex-1 flex-col gap-3">
	<div class="card flex flex-1 flex-col overflow-auto">
		<div class="flex w-full items-center justify-between">
			<Button color="secondary" on:click={() => modifyDialogStates.open.set(true)}>
				<Icon class="mr-2 text-lg" icon="bx:edit" /> New product
			</Button>
			<form class="flex items-center gap-2" on:submit|preventDefault={handleSearch}>
				<input class="rounded-md" name="search" type="text" placeholder="Search products..." />
				<Button class="h-full p-2" color="secondary" square type="submit">
					<Icon icon="bx:search" class="w-full" width="auto" />
				</Button>
			</form>
		</div>

		<!-- Table -->
		<div class="custom-scrollbar mt-4 flex-1 overflow-y-auto rounded-md border">
			<table class="relative w-full" class:h-full={products.items.length === 0}>
				<thead class="sticky top-0 border-b">
					<th class="w-0"></th>
					<th class="text-left">Name</th>
					<th>Price</th>
					<th>Category</th>
					<th>Date Added</th>
					<th class="w-auto">Last Update</th>
					<th class="w-auto px-2">Actions</th>
				</thead>
				<tbody class="text-center">
					{#each products.items as product, i}
						<tr class="odd:bg-black/[0.025]">
							<td class="w-0">{i + 1}</td>
							<td class="max-w-[28ch] truncate text-left">{product.name}</td>
							<td>{formatter.format(product.price)}</td>
							<td class="max-w-[16ch] truncate">{product.category?.name}</td>
							<td>{new Date(product.createdAt).toLocaleDateString()}</td>
							<td>{new Date(product.updatedAt).toLocaleDateString()}</td>
							<td class="w-0">
								<div class="mx-auto w-max">
									<Button
										title="Edit"
										class="p-1.5 text-xl"
										variant="solid"
										color="neutral"
										square
										on:click={() => handleEdit(i)}
									>
										<Icon icon="iconamoon:edit-fill" />
									</Button>
									<Button
										title="Delete"
										class="p-1.5 text-xl"
										variant="solid"
										color="danger"
										square
										on:click={() => handleDelete(i)}
									>
										<Icon icon="ic:baseline-delete" />
									</Button>
								</div>
							</td>
						</tr>
					{:else}
						<tr class="h-full text-secondary-300 text-3xl">
							<td colspan="7" class="py-4">No products found.</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<Pagination total={products.total} perPage={products.limit} />
</div>

<style lang="postcss">
	th {
		@apply bg-white px-5 py-3;
	}
	td {
		@apply px-5 py-2.5;
	}
</style>
