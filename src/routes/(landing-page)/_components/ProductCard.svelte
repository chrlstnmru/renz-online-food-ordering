<script lang="ts">
	import RatingIndicator from '$lib/components/RatingIndicator.svelte';
	import type { BestSeller } from '$lib/server/types';
	import { formatter } from '$lib/utils/helpers';

	export let data: BestSeller;
</script>

<article class="stack card group overflow-hidden p-0">
	<div class="h-[500px] w-[350px]">
		<img
			class="h-full w-full select-none object-cover"
			src={data.image}
			alt={data.name}
			loading="lazy"
			decoding="async"
		/>
	</div>
	<div class="flex flex-col-reverse">
		<div class="mt-auto bg-white px-6 py-4">
			<h3 class="text-2xl font-semibold text-neutral-800 drop-shadow">
				{data.name}
			</h3>
			<div class="mt-2 flex items-center justify-between">
				<p class="flex items-center gap-1">
					<RatingIndicator rating={Math.floor(data.avegrage)} />
					({data.avegrage && data.avegrage !== 0 ? data.avegrage.toFixed(1) : 0})
				</p>
				<p class="opacity-80">{data.sold ?? 0} sold</p>
			</div>
		</div>
		<p
			class="mt-8 grid self-end bg-amber-600 px-5 py-3 text-right text-sm uppercase text-white shadow"
		>
			Starts at
			<span class="text-3xl font-semibold leading-6">
				{formatter.format(data.price)}
			</span>
		</p>
	</div>
</article>
