<script lang="ts">
	import type { PageData } from './$types';
	import CategoryList from './_components/CategoryList.svelte';
	import ProductTable from './_components/ProductTable.svelte';

	export let data: PageData;
</script>

<div class="mt-6 flex h-full gap-4 overflow-auto">
	<CategoryList form={data.categoryForm} list={data.categories} />
	<ProductTable form={data.productForm} categories={data.categories} products={data.products} />
</div>
