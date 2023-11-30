<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '@iconify/svelte';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let title: string = '';

	const sideNavOpen = getContext<Writable<boolean>>('sideNavOpen');

	function toggleSideNav() {
		sideNavOpen.set(!$sideNavOpen);
	}
</script>

<div class="flex flex-row-reverse items-center justify-end gap-4">
	<h2 class="text-4xl font-medium">{title}</h2>
	<Button class="p-1" variant="ghost" color="neutral" square on:click={toggleSideNav}>
		<Icon icon="heroicons-solid:menu-alt-2" width="44" />
	</Button>
</div>
