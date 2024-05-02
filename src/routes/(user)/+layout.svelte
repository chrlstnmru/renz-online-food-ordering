<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from './_components/Header.svelte';
	import type { LayoutData } from './$types';
	import { onMount, setContext } from 'svelte';
	import { supabaseClient } from '$lib/supabaseClient';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { invalidateAll } from '$app/navigation';
	import { createBasket } from '$lib/stores/basketStore';

	export let data: LayoutData;

	$: setContext('session', data.session);

	createBasket(data.session);

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
