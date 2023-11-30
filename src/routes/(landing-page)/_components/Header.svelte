<script lang="ts">
	import type { NavLink } from '$lib/components/types';
	import MobileNav from '$lib/components/MobileNav.svelte';

	export let navlinks: NavLink[];
</script>

<header class="bg-secondary-950 py-6">
	<div class="container flex items-center justify-between">
		<h1 class="select-none text-3xl font-black text-primary-500">
			RENZ
			<div class="text-base font-normal leading-3">Online Food Ordering</div>
		</h1>
		<nav class="md:hidden">
			<ul class="flex gap-8 text-sm font-medium uppercase text-white/40">
				{#each navlinks as { name, href }}
					{#if name.toLowerCase() === 'login'}
						<li>
							<a class="rounded-full bg-primary-300 px-6 py-2 text-primary-950" href="/login">
								login
							</a>
						</li>
					{:else}
						<li>
							<a href={href}>{name}</a>
						</li>
					{/if}
				{/each}
			</ul>
		</nav>
		<MobileNav navlinks={navlinks} />
	</div>
</header>
