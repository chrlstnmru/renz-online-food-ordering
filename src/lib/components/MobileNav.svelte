<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import type { NavLink } from '$lib/components/types';
	import type { Session } from 'lucia';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let navlinks: NavLink[];
	export let session: Session | null;

	const {
		elements: { trigger, overlay, content, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
	});

	function handleWindowResize(e: UIEvent) {
		if ((e.target as Window).innerWidth > 767) {
			open.set(false);
		}
	}
</script>

<svelte:window on:resize={handleWindowResize} />

<Button
	{...$trigger}
	class="hidden md:block"
	size="xs"
	variant="ghost"
	square
	action={$trigger.action}
>
	<Icon width="24" icon="mingcute:menu-fill" />
</Button>

<div use:melt={$portalled}>
	{#if $open}
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		/>
		<div
			use:melt={$content}
			class="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[350px] flex-col bg-white p-4 shadow-lg
            focus:outline-none"
			transition:fly={{
				x: '100%',
				duration: 300,
				opacity: 1
			}}
		>
			<Button
				{...$close}
				action={$close.action}
				class="w-max"
				color="neutral"
				size="xs"
				variant="ghost"
				square
			>
				<Icon width="32" icon="iconamoon:close" />
			</Button>

			<nav class="mt-6">
				<ul class="space-y-4">
					{#each navlinks as { name, href }}
						{#if href.startsWith('/logout')}
							{#if session}
								<li class="text-center text-xl">
									<a href={href} on:click={() => open.set(false)}>{name}</a>
								</li>
							{:else}
								<Button
									class="mt-4 w-full justify-center"
									on:click={void goto(`/login?redirectTo=${$page.url.pathname}`)}
								>
									Log In
								</Button>
							{/if}
						{:else}
							<li class="text-center text-xl">
								<a href={href} on:click={() => open.set(false)}>{name}</a>
							</li>
						{/if}
					{/each}
				</ul>
			</nav>
		</div>
	{/if}
</div>
