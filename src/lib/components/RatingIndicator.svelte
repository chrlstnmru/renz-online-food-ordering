<script lang="ts">
	import Icon from '@iconify/svelte';

	export let rating: number = 0;
</script>

<div class="my-auto flex h-max w-max items-center gap-0.5 self-start text-sm">
	{#each Array(5) as _, i}
		<Icon class={i < rating ? 'text-amber-500' : 'text-neutral-300'} icon="bi:star-fill" />
	{/each}
</div>
