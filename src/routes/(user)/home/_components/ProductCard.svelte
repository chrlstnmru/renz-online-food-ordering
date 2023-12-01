<script lang="ts">
	import type { Product } from '$lib/server/types';
	import { formatter } from '$lib/utils/helpers';
	import Icon from '@iconify/svelte';

	export let data: Product;
</script>

<article class="flex flex-col-reverse">
	<div>
		<h2 class="truncate text-xl font-semibold">
			{data.name}
		</h2>
		<div class="flex items-center justify-between">
			<p class="flex items-center font-medium">
				<Icon class="mr-1 inline aspect-square w-4 text-yellow-500" icon="bi:star-fill" />
				{data.avgRating && data.avgRating !== 0 ? Number(data.avgRating).toPrecision(2) : 0}
				<span class="ml-1 font-normal">({data.reviewCount ?? 0})</span>
			</p>
			<p>{data.sold ?? 0} sold</p>
		</div>
	</div>
	<div class="stack h-full w-full overflow-hidden rounded-lg">
		<img
			class="object-cover"
			src={data.image}
			alt="{data.name.toLowerCase().replace(' ', '-')}-thumbnail"
			loading="lazy"
			decoding="async"
		/>
		<p
			class="ml-auto mr-4 mt-4 h-max w-max rounded-full bg-black/80 px-3 py-1 text-lg font-medium text-white"
		>
			{formatter.format(data.price)}
		</p>
	</div>
</article>
