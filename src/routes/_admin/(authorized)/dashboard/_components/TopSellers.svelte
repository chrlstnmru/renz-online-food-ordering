<script lang="ts">
	import RatingIndicator from '$lib/components/RatingIndicator.svelte';
	import type { BestSeller } from '$lib/server/types';
	import Icon from '@iconify/svelte';

	export let data: BestSeller[];
</script>

<section class="w-full max-w-[420px]">
	<h3 class="text-xl text-secondary-500">Top Sellers</h3>
	<div class="card mt-2">
		<ol class="mx-2 my-3 space-y-5">
			{#each data as item (item.id)}
				<li class="flex items-center">
					<div class="flex w-full items-center justify-between">
						<div>
							<span class="max-w-[25ch] truncate text-lg">
								<a class="group" href="/_admin/products?search={item.id}">
									{item.name}
									<Icon
										class="invisible inline text-base text-neutral-400 group-hover:visible group-hover:text-primary-500"
										icon="entypo:link"
									/>
								</a>
							</span>
							<RatingIndicator rating={Math.floor(item.avegrage)} />
						</div>
						<span class="flex-shrink-0 text-sm">{item.sold?.toLocaleString() ?? 0} sold</span>
					</div>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style lang="postcss">
	ol {
		counter-reset: list;
	}
	li::before {
		counter-increment: list;
		content: counter(list) '. ';
		@apply mr-3 font-medium;
	}
</style>
