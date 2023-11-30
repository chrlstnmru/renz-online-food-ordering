<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Dialog from '$lib/components/Dialog.svelte';
	import { addToast } from '$lib/components/Toaster.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { categoryForm as categoryFormSchema } from '$lib/server/validation';
	import Icon from '@iconify/svelte';
	import { createDropdownMenu, melt, type DialogStates } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';

	$: active = $page.url.searchParams.get('category') || 'all';

	export let form: SuperValidated<typeof categoryFormSchema>;
	export let list: { id: string; name: string }[];
	$: list = [{ id: 'all', name: 'All' }, ...list];

	const {
		form: categoryForm,
		errors,
		enhance,
		submitting,
		reset
	} = superForm(form, {
		clearOnSubmit: 'errors-and-message',
		multipleSubmits: 'prevent',
		onUpdated(event) {
			const message = event.form.message;
			if (message) handleMessae(message);
		}
	});

	$: if (!list.find((v) => v.id === active) && browser) {
		goto('?', { replaceState: true });
	}

	const {
		elements: { menu: drpMenu, item: drpItem, trigger: drpTrig, arrow: drpArrow },
		states: { open: drpOpen }
	} = createDropdownMenu({
		positioning: { placement: 'bottom-end' }
	});

	let auditMode = writable<'edit' | 'delete' | 'off'>('off');
	let dialogStates: DialogStates;

	$: if ($auditMode) {
		auditMode.update((next) => {
			if (next !== 'off') {
				drpOpen.set(false);
			} else {
				reset();
			}
			return next;
		});
	}

	function setSelectedCategory(category: { id: string; name: string }) {
		categoryForm.set(category);
	}

	function auditItem(mode: 'edit' | 'delete' | string, categoryId?: string) {
		const category = list.find((category) => category.id === categoryId);
		switch (mode) {
			case 'edit':
				if (category) setSelectedCategory(category);
				dialogStates.open.set(true);
				break;
			case 'delete':
				if (category) setSelectedCategory(category);
				dialogStates.open.set(true);
				break;
		}
	}

	function handleMessae(message: App.Superforms.Message) {
		if (message?.type === 'success') {
			dialogStates.open.set(false);
			reset();

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

<Dialog bind:states={dialogStates}>
	<svelte:fragment slot="title">
		{$auditMode === 'off'
			? 'Create Category'
			: $auditMode === 'edit'
			  ? 'Edit Category'
			  : 'Delete Category'}
	</svelte:fragment>

	<!-- Dialog form -->
	<form
		class="mt-4"
		action="?/{$auditMode === 'off'
			? 'createCategory'
			: $auditMode === 'edit'
			  ? 'updateCategory'
			  : 'deleteCategory'}"
		method="POST"
		use:enhance
	>
		{#if $auditMode !== 'off'}
			<input type="text" name="id" bind:value={$categoryForm.id} hidden readonly />
		{/if}

		{#if $auditMode !== 'delete'}
			<Input
				label="Name"
				name="name"
				bind:value={$categoryForm.name}
				error={$errors.name?.[0]}
				required
			/>
		{:else}
			<p class="mb-4">
				Are you sure you want to delete <span class="font-semibold">{$categoryForm.name}</span>?
			</p>
		{/if}
		<div class="mt-1.5 flex flex-row-reverse gap-2">
			<Button
				color={$auditMode !== 'delete' ? 'primary' : 'danger'}
				loading={$submitting}
				type="submit"
			>
				{$auditMode === 'off' ? 'Create' : $auditMode === 'edit' ? 'Update' : 'Delete'}
			</Button>
			<Button variant="ghost" color="neutral" on:click={() => dialogStates.open.set(false)}>
				Cancel
			</Button>
		</div>
	</form>
</Dialog>

<aside class="card h-max w-full max-w-[240px]">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-medium">Categories</h3>
		{#if $auditMode === 'off'}
			<Button
				{...$drpTrig}
				action={$drpTrig.action}
				class="p-1"
				variant="ghost"
				color="neutral"
				size="xs"
				square
			>
				<Icon class="text-xl" icon="tabler:dots" />
			</Button>
		{:else}
			<Button
				class="text-sm uppercase"
				variant="solid"
				color="success"
				size="sm"
				on:click={() => auditMode.set('off')}
			>
				<Icon class="text-lg" icon="lets-icons:done-round" /> Done
			</Button>
		{/if}

		<!-- Dropdown Menu -->
		<div class="card grid p-2" use:melt={$drpMenu}>
			<Button
				{...$drpItem}
				action={$drpItem.action}
				variant="ghost"
				color="neutral"
				size="sm"
				on:click={() => dialogStates.open.set(true)}
			>
				<Icon class="mr-2 text-base" icon="fe:plus" /> Create
			</Button>
			<Button
				{...$drpItem}
				action={$drpItem.action}
				variant="ghost"
				color="neutral"
				size="sm"
				on:click={() => auditMode.set('edit')}
			>
				<Icon class="mr-2 text-base" icon="iconamoon:edit-fill" /> Edit
			</Button>
			<Button
				{...$drpItem}
				action={$drpItem.action}
				variant="ghost"
				color="neutral"
				size="sm"
				on:click={() => auditMode.set('delete')}
			>
				<Icon class="mr-2 text-base" icon="ic:baseline-delete" /> Delete
			</Button>
			<div use:melt={$drpArrow} />
		</div>
	</div>
	<ul class="mt-3">
		{#each list as category}
			<li>
				{#if $auditMode === 'off'}
					<a class="w-full" href="?category={category.id}" data-sveltekit-replacestate>
						<div
							class="rounded-md px-4 py-1.5 {active === category.id
								? 'bg-primary-500/10 text-primary-500'
								: 'text-inherit'}"
						>
							{category.name}
						</div>
					</a>
				{:else if category.id !== 'all'}
					<button
						class="group flex w-full items-center justify-between rounded-md px-4 py-1.5 text-left{$auditMode ===
						'edit'
							? ' text-secondary-900 hover:bg-black/5'
							: ' hover:bg-red-500/5 hover:text-red-500'}"
						on:click={() => auditItem($auditMode, category.id)}
					>
						{category.name}

						{#if $auditMode === 'edit'}
							<Icon class="hidden text-base group-hover:inline-block" icon="mdi:edit" />
						{:else if $auditMode === 'delete'}
							<Icon class="hidden text-base group-hover:inline-block" icon="ic:baseline-delete" />
						{/if}
					</button>
				{/if}
			</li>
		{/each}
	</ul>
</aside>
