<script lang="ts">
	import Carousel from '$lib/components/Carousel.svelte';
	import Icon from '@iconify/svelte';
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
				{#each { length: 6 } as _}
					<article class="stack card overflow-hidden p-0">
						<img
							class="h-[500px] w-[350px] select-none object-cover"
							src="/images/best-0.png"
							alt=""
						/>
						<div class="flex flex-col-reverse">
							<div class="mt-auto bg-white px-6 py-4">
								<h3 class="text-2xl font-semibold text-neutral-800 drop-shadow">Pancit Malabon</h3>
								<div class="mt-2 flex items-center justify-between">
									<p class="flex items-center">
										<Icon
											class="mr-1 inline aspect-square w-4 text-yellow-500"
											icon="bi:star-fill"
										/>
										&middot; 5
									</p>
									<p class="opacity-80">200 sold</p>
								</div>
							</div>
							<p
								class="mt-8 grid self-end bg-amber-600 px-5 py-3 text-right text-sm uppercase text-white shadow"
							>
								Starts at
								<span class="text-3xl font-semibold leading-6">P200</span>
							</p>
						</div>
					</article>
				{/each}
			</Carousel>
		</div>
	</div>
	<p class="container max-w-[50ch] text-center text-lg">
		Discover our handpicked selection of the best-selling food items, where flavor meets popularity.
	</p>
</section>
