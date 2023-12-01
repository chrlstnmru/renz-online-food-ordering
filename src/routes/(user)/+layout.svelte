<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from './_components/Header.svelte';
	import type { LayoutData } from './$types';
	import { onMount, setContext } from 'svelte';
	import { basketSummaryStore } from '$lib/stores/basketSummaryStore';
	import { supabaseClient } from '$lib/supabaseClient';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { invalidateAll } from '$app/navigation';

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

	onMount(() => {
		supabaseClient
			.channel('new-order')
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'orders' },
				async (payload: any) => {
					console.log(payload);

					if (payload.new.status !== 'cancelled' || payload.new.status !== 'waiting') {
						addToast(
							{
								title: 'Order Status Changed',
								description: `Your order #${payload.new.id} status has been updated.`
							},
							'info'
						);
					}
					await invalidateAll();
				}
			)
			.subscribe();
	});
</script>

<div class="flex min-h-screen flex-col">
	<Header session={data.session} />
	<main class="container my-4 flex flex-1 flex-col">
		<slot />
	</main>
	<Footer />
</div>
