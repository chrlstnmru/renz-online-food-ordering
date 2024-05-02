<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Avatar from '$lib/components/Avatar.svelte';
	import type { NavLink } from '$lib/components/types';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '@iconify/svelte';
	import { createPopover, melt } from '@melt-ui/svelte';
	import type { Session } from 'lucia';
	import { fade } from 'svelte/transition';
	import MobileNav from '$lib/components/MobileNav.svelte';

	export let session: Session | null;

	const navlinks: NavLink[] = [
		{
			name: 'Home',
			href: '/home'
		},
		{
			name: 'Profile',
			href: '/profile'
		},
		{
			name: 'My Reviews',
			href: '/reviews'
		},
		{
			name: 'Logout',
			href: '/logout?redirectTo=/home'
		}
	];

	const {
		elements: { trigger, content, arrow },
		states: { open }
	} = createPopover({
		forceVisible: true
	});
</script>

<header class="sticky top-0 z-10 bg-secondary-950 p-4 px-4">
	<div class="container flex items-center justify-between">
		<a href="/home" class="text-primary-500">
			<h1 class="select-none text-3xl font-black text-primary-500">
				RENZ
				<div class="text-base font-normal leading-3">Online Food Ordering</div>
			</h1>
		</a>
		<div class="flex items-center gap-4">
			<nav class="md:hidden">
				<ul class="flex items-center gap-5 text-white/75">
					<li aria-label="My Orders">
						<a href="/orders">
							<Icon icon="fa-solid:truck" width={30} />
						</a>
					</li>
					<li aria-label="My Basket">
						<a href="/basket">
							<Icon icon="ph:basket-fill" width={30} />
						</a>
					</li>
					{#if session}
						{#each navlinks as { name, href, icon }}
							{#if icon}
								<li aria-label="My {name}">
									<a href={href}>
										<Icon icon={icon} width={30} />
									</a>
								</li>
							{/if}
						{/each}
						<Button {...$trigger} action={$trigger.action} class="p-0.5" square rounded>
							<Avatar src={session.user.image} label="John Doe" />
						</Button>
						{#if $open}
							<div class="card z-20" use:melt={$content} transition:fade={{ duration: 70 }}>
								<div use:melt={$arrow} />
								<ul class="flex flex-col gap-2.5 font-medium">
									<li>
										<a class="flex items-center gap-2" href="/reviews">
											<Icon icon="octicon:code-review-16" width={16} />Reviews
										</a>
									</li>
									<li>
										<a class="flex items-center gap-2" href="/profile">
											<Icon icon="iconamoon:profile-fill" width={16} />Profile
										</a>
									</li>
									<li>
										<a
											class="flex items-center gap-2"
											href="/logout?redirectTo={$page.url.pathname}"
										>
											<Icon icon="solar:logout-2-broken" width={16} />Logout
										</a>
									</li>
								</ul>
							</div>
						{/if}
					{/if}
				</ul>
			</nav>
			<MobileNav navlinks={navlinks} />

			{#if !session}
				<Button on:click={void goto(`/login?redirectTo=${$page.url.pathname}`)}>Log In</Button>
			{/if}
		</div>
	</div>
</header>
