<script lang="ts">
	import { page } from '$app/stores';
	import { capitalize } from '$lib/utils/helpers';
	import { writable } from 'svelte/store';
	import PageHeader from './_components/PageHeader.svelte';
	import SideNav from './_components/SideNav.svelte';
	import { onMount, setContext } from 'svelte';
	import { supabaseClient } from '$lib/supabaseClient';
	import { invalidate, invalidateAll } from '$app/navigation';
	import Toaster, { addToast } from '$lib/components/Toaster.svelte';

	// export let data: LayoutData;
	$: title = capitalize($page.url.pathname.substring('/_admin/'.length));

	const sideNavOpen = writable(true);
	setContext('sideNavOpen', sideNavOpen);

	onMount(() => {
		supabaseClient
			.channel('new-order')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'orders' },
				async (payload: any) => {
					console.log(payload);
					await invalidateAll();
					addToast(
						{
							title: 'New Order',
							description: `Order #${payload.new.id} has been placed.`
						},
						'info'
					);
				}
			)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'orders' },
				async (payload: any) => {
					console.log(payload);
					await invalidateAll();
					addToast(
						{
							title: 'Order Updated',
							description: `Order #${payload.new.id} has been placed.`
						},
						'info'
					);
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
