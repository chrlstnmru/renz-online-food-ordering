<script lang="ts">
	import { createAvatar, melt } from '@melt-ui/svelte';

	export let src: string;
	export let label: string;

	const {
		elements: { image, fallback }
	} = createAvatar({
		src
	});
</script>

<div class="flex aspect-square w-8 items-center justify-center rounded-full bg-secondary-500">
	<img use:melt={$image} alt="Avatar" class="h-full w-full rounded-[inherit]" />
	<span use:melt={$fallback} class="text-magnum-700 text-xl font-medium leading-3 text-white">
		{label[0]}
	</span>
</div>
