<script lang="ts">
	import { flyAndScale } from '$lib/utils/transitions';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import Button from './ui/Button.svelte';
	import Icon from '@iconify/svelte';
	import { createEventDispatcher } from 'svelte';

	export let keepOpen = false;
	export let type: 'dialog' | 'alertdialog' = 'dialog';

	const dispatch = createEventDispatcher();

	const { elements, states } = createDialog({
		closeOnOutsideClick: false,
		forceVisible: true,
		role: type,
		onOpenChange: ({ curr, next }) => {
			if (next === false) {
				if (keepOpen) {
					return true;
				}
				dispatch('close');
			}

			return next;
		}
	});
	$: ({ trigger, portalled, overlay, content, title, description, close } = elements);
	$: ({ open } = states);

	export { elements, states };
</script>

<slot name="trigger" trigger={$trigger} />

<div use:portalled>
	{#if $open}
		<div
			class="fixed inset-0 bg-black/40"
			transition:fade={{ duration: 150 }}
			use:melt={$overlay}
		/>
		<div
			class="card fixed left-[50%] top-[50%] z-50 w-max min-w-[320px] max-w-[calc(100vw-40px)] translate-x-[-50%] translate-y-[-50%] shadow-lg"
			transition:flyAndScale={{
				duration: 150,
				y: 8,
				start: 0.96
			}}
			use:melt={$content}
		>
			<div>
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-medium" use:melt={$title}>
						<slot name="title">Dialog Title</slot>
					</h2>
					<Button
						{...$close}
						action={$close.action}
						class="p-1"
						variant="ghost"
						color="neutral"
						size="xs"
						square
					>
						<Icon class="text-xl" icon="ic:round-close" />
					</Button>
				</div>
				<p use:melt={$description}>
					<slot name="desc" />
				</p>
			</div>
			<slot />
		</div>
	{/if}
</div>
