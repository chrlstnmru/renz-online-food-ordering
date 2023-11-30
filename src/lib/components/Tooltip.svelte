<script lang="ts">
	import { createTooltip, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';

	const {
		elements: { trigger, content, arrow },
		states: { open }
	} = createTooltip({
		positioning: {
			placement: 'bottom'
		},
		openDelay: 0,
		closeDelay: 0,
		closeOnPointerDown: false,
		forceVisible: true
	});

	export let tip: string | null = '';
</script>

<button class="max-h-max max-w-max" use:melt={$trigger}>
	<slot />
</button>

{#if $open && tip && tip.length > 0}
	<div use:melt={$content} transition:fade={{ duration: 100 }} class="card z-10">
		<div use:melt={$arrow} />
		<p class="text-sm text-secondary-900">{tip}</p>
	</div>
{/if}
