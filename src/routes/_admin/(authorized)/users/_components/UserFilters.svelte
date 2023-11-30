<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '@iconify/svelte';
</script>

<div class="flex w-full items-center justify-between">
	<form class="ml-auto flex items-center gap-2" data-sveltekit-replacestate>
		<input class="rounded-md" name="search" type="text" placeholder="Search user..." />
		<Button class="h-full p-2" color="secondary" square type="submit">
			<Icon icon="bx:search" class="w-full" width="auto" />
		</Button>
	</form>
</div>
