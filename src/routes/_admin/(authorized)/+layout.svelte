<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Toaster, { addToast } from '$lib/components/Toaster.svelte';
	import { supabaseClient } from '$lib/supabaseClient';
	import { capitalize } from '$lib/utils/helpers';
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import PageHeader from './_components/PageHeader.svelte';
	import SideNav from './_components/SideNav.svelte';

	// export let data: LayoutData;
	$: title = capitalize($page.url.pathname.substring('/_admin/'.length));

	const sideNavOpen = writable(true);
	setContext('sideNavOpen', sideNavOpen);

	onMount(() => {
		supabaseClient
			.channel('new-order')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'customer_orders' },
				async (payload: any) => {
					addToast(
						{
							title: 'New Order',
							description: `Order #${payload.new.id} has been placed.`
						},
						'info'
					);
					await invalidateAll();
				}
			)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'customer_orders' },
				async (payload: any) => {
					if (payload.new.status === 'cancelled') {
						addToast(
							{
								title: 'Order Cancelled',
								description: `Order #${payload.new.id} has been cancelled.`
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

<svelte:head>
	<title>RENZ Admin Panel | {title}</title>
</svelte:head>

<Toaster />
<div class="flex">
	<SideNav />
	<main class="flex max-h-screen flex-1 flex-col overflow-auto p-10">
		<PageHeader title={title} />
		<slot />
	</main>
</div>
