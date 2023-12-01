<script lang="ts">
	import RatingVisual from '$lib/components/RatingVisual.svelte';
	import { round } from '$lib/utils/helpers';
	import type { RatingsData } from '$lib/server/types';
	import Icon from '@iconify/svelte';

	export let data: RatingsData | undefined;
</script>

<div class="flex items-center gap-x-16 gap-y-6 p-8 sm:flex-col sm:px-0">
	<div class="flex w-max flex-col">
		<span class="text-7xl font-black text-secondary-900">
			{(data?.average ?? 0).toPrecision(2)}
		</span>
		<div class="mx-auto flex w-max items-center gap-1">
			<Icon class="text-amber-500" icon="bi:star-fill" />
			<Icon class="text-amber-500" icon="bi:star-fill" />
			<Icon class="text-amber-500" icon="bi:star-fill" />
			<Icon class="text-amber-500" icon="bi:star-fill" />
			<Icon class="text-amber-500" icon="bi:star-fill" />
		</div>
		<span class="mx-auto mt-2 text-center">({data?.total ?? 0} reviews)</span>
	</div>
	<div class="w-full">
		<RatingVisual data={data} />
	</div>
</div>
