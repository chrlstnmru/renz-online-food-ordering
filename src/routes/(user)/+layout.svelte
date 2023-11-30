<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from './_components/Header.svelte';
	import type { LayoutData } from './$types';
	import { setContext } from 'svelte';
	import { basketSummaryStore } from '$lib/stores/basketSummaryStore';
	import { page } from '$app/stores';
	import { capitalize } from '$lib/utils/helpers';

	export let data: LayoutData;

	$: setContext('session', data.session);
	$: total = data.basketSummary
		.map((item) => {
			if (!item.id) return 0;
			if (item.variant) {
				return item.variant.price * item.quantity;
			}
			return item.product.price * item.quantity;
		})
		.reduce((a, b) => a + b, 0);
	$: basketSummaryStore.set({ entries: data.basketSummary, total });
</script>

<div class="flex min-h-screen flex-col">
	<Header session={data.session} />
	<main class="container my-4">
		<slot />
	</main>
	<Footer />
</div>
