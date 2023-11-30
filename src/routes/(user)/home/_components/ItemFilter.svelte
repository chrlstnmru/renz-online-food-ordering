<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Category } from '$lib/server/types';
	import Icon from '@iconify/svelte';
	import Select from 'svelte-select';

	export let data: Category[];
	$: categories = [{ id: '', name: 'All' }, ...data];

	$: activeCategory = categories.find(
		(category) => category.id === $page.url.searchParams.get('category')
	);

	function handleSearch(e: SubmitEvent) {
		if (browser) {
			const formData = new FormData(e.target as HTMLFormElement);
			const search = formData.get('search');
			const currentQuerry = new URLSearchParams($page.url.searchParams);
			currentQuerry.set('search', search as string);

			goto(`?${currentQuerry.toString()}`);
		}
	}

	function handleCategoryChange(e: CustomEvent<Category>) {
		if (browser) {
			goto(`?category=${e.detail.id}`, { replaceState: true });
		}
	}
</script>

<div class="flex justify-between gap-4 sm:flex-col-reverse">
	<Select
		class="!flex !max-w-[200px] !border-slate-500 focus-within:!border-slate-500 focus-within:!ring-1 focus-within:!ring-slate-600 sm:!max-w-full"
		itemId="id"
		label="name"
		items={categories}
		value={activeCategory ?? categories[0]}
		clearable={false}
		searchable={false}
		showChevron
		on:change={handleCategoryChange}
	/>
	<form class="flex items-center gap-2 sm:w-full" on:submit|preventDefault={handleSearch}>
		<input class="rounded-md sm:w-full" name="search" placeholder="Search..." type="text" />
		<Button class="h-full p-2" square type="submit">
			<Icon icon="bx:search" class="w-full" width="auto" />
		</Button>
	</form>
</div>
