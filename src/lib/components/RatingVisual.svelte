<script lang="ts">
	import type { RatingsData } from '$lib/server/types';
	import Icon from '@iconify/svelte';

	export let data: RatingsData | undefined;
	$: list = data?.metrics || {
		'5': { value: 0, count: 0 },
		'4': { value: 0, count: 0 },
		'3': { value: 0, count: 0 },
		'2': { value: 0, count: 0 },
		'1': { value: 0, count: 0 }
	};
</script>

<table class="w-full">
	<tbody>
		{#each Object.entries(list).reverse() as [k, v] (k)}
			<tr>
				<td class="w-0">
					<span class="grid grid-cols-[1ch_auto] items-center gap-1 text-center">
						{k}<Icon class="text-amber-500" icon="bi:star-fill" />
					</span>
				</td>
				<td class="w-full" data-rating-row style="--rate: {v.value * 100}%">
					<div data-rating-visual class="h-2.5 w-full rounded-full bg-neutral-300" />
				</td>
				<td class="text-right">
					{v.count.toLocaleString()}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style lang="postcss">
	td {
		@apply px-1;
	}
	[data-rating-row] [data-rating-visual] {
		@apply relative;
	}

	[data-rating-row] [data-rating-visual]::before {
		@apply absolute left-0 top-0 h-full min-w-[0.75rem] rounded-full bg-amber-500;
		content: '';
		width: var(--rate);
	}
</style>
