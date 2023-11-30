<script lang="ts">
	import { melt, type Toast, type ToastsElements } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import type { ToastData } from './Toaster.svelte';
	import Icon from '@iconify/svelte';

	export let elements: ToastsElements;
	$: ({ content, title, description, close } = elements);

	export let toast: Toast<ToastData>;
	$: ({ data, id } = toast);
</script>

<div
	use:melt={$content(id)}
	in:fly={{ duration: 150, x: '100%' }}
	out:fly={{ duration: 150, x: '100%' }}
	class="relative rounded-lg bg-secondary-950 text-white shadow-md"
>
	<div
		class="relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5 pt-6"
	>
		<div>
			<h3 use:melt={$title(id)} class="flex items-center gap-2 font-semibold capitalize">
				{data.title}
				<span class="aspect-square w-1.5 rounded-full {data.color}" />
			</h3>
			<div use:melt={$description(id)}>
				{data.description}
			</div>
		</div>
		<button
			use:melt={$close(id)}
			class="text-magnum-500 absolute right-4 top-4 grid aspect-square w-max place-items-center rounded-md p-0.5
          hover:bg-black/5"
		>
			<Icon icon="charm:cross" width="24" />
		</button>
	</div>
</div>
