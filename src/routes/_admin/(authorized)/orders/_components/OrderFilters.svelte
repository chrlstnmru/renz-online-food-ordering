<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '@iconify/svelte';

	function clearFilters() {
		if (browser) {
			goto('?', { replaceState: true });
		}
	}
</script>

<div class="flex w-full items-center justify-between">
	<Button color="secondary" on:click={clearFilters}>Clear filters</Button>
	<form class="ml-auto flex items-center gap-2" data-sveltekit-replacestate>
		<input class="rounded-md" name="search" type="text" placeholder="Search orders..." />
		<Button class="h-full p-2" color="secondary" square type="submit">
			<Icon icon="bx:search" class="w-full" width="auto" />
		</Button>
	</form>
</div>
