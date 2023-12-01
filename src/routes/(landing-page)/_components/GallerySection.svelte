<script lang="ts">
	import Carousel from '$lib/components/Carousel.svelte';
	import RatingIndicator from '$lib/components/RatingIndicator.svelte';
	import type { BestSeller } from '$lib/server/types';
	import { formatter } from '$lib/utils/helpers';
	import ProductCard from './ProductCard.svelte';

	export let data: BestSeller[];
</script>

<section id="gallery" class="py-12">
	<div class="container grid place-items-center">
		<h2 id="gallery-heading" class="text-center text-4xl font-bold" data-content-section="Gallery">
			Featured Products
		</h2>
	</div>
	<div class="grid place-items-center">
		<div class="left-0 top-0 my-8 max-w-[80%] place-items-center overflow-x-auto sm:max-w-full">
			<Carousel>
				{#each data as item (item.id)}
					<a class="group" href="/products/{item.id}">
						<ProductCard data={item} />
					</a>
				{/each}
			</Carousel>
		</div>
	</div>
	<p class="container max-w-[50ch] text-center text-lg">
		Discover our handpicked selection of the best-selling food items, where flavor meets popularity.
	</p>
</section>
