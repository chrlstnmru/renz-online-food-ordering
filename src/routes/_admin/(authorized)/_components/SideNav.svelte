<script lang="ts">
	import { page } from '$app/stores';
	import type { NavLink } from '$lib/components/types';
	import Icon from '@iconify/svelte';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const sideNavOpen = getContext<Writable<boolean>>('sideNavOpen');
	$: activeLink = $page.url.pathname;

	const navlinks: NavLink[] = [
		{
			name: 'Dashboard',
			href: '/_admin/dashboard',
			icon: 'ic:round-dashboard'
		},
		{
			name: 'Products',
			href: '/_admin/products',
			icon: 'fa6-solid:gift'
		},
		{
			name: 'Orders',
			href: '/_admin/orders',
			icon: 'bxs:truck'
		},
		{
			name: 'Users',
			href: '/_admin/users',
			icon: 'mdi:users-group'
		},
		{
			name: 'Settings',
			href: '/_admin/settings',
			icon: 'solar:settings-bold'
		},
		{
			name: 'Logout',
			href: '/_admin/logout',
			icon: 'bx:log-out'
		}
	];
</script>

<aside
	class="flex-shrink-0 overflow-x-hidden transition-all duration-200 {$sideNavOpen
		? 'w-full max-w-[320px]'
		: 'w-0 max-w-0'}"
	aria-hidden={$sideNavOpen}
>
	<div class="flex min-h-screen flex-col bg-secondary-950 p-8">
		<div class="mx-auto h-max w-max">
			<h1 class="select-none text-5xl font-black text-primary-500">
				RENZ
				<div class="text-xl font-normal leading-3">Admin Panel</div>
			</h1>
		</div>
		<nav class="flex flex-1">
			<ul class="m-auto space-y-4 text-2xl text-secondary-400">
				{#each navlinks as link}
					<li>
						<a
							class="grid grid-flow-col grid-cols-[1.875rem_1fr] gap-4 active:text-secondary-500 {activeLink ===
							link.href
								? 'text-primary-500'
								: ''}"
							href={link.href}
							tabindex={$sideNavOpen ? 0 : -1}
						>
							{#if link.icon}
								<Icon class="text-3xl" icon={link.icon} />
							{/if}
							{link.name}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</aside>
