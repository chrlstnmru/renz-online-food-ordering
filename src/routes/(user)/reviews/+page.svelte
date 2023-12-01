<script lang="ts">
	import UserComment from '$lib/components/UserComment.svelte';
	import WithBasketSummary from '../_components/WithBasketSummary.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<WithBasketSummary>
	<div class="flex flex-1 flex-col items-center">
		<div class="card min-w-[340px]">
			<h2 class="text-2xl font-semibold">My Reviews</h2>
			<ul class="mt-3 space-y-2">
				{#each data.reviews as review (review.id)}
					<li>
						<div>
							<a class="opacity-75" href="/products/{review.product.id}">
								{review.product.name}
							</a>
							<div class="ml-1 border-l-4 border-gray-600 pl-4">
								<UserComment data={review} deleteReviewForm={data.deleteReviewForm} />
							</div>
						</div>
					</li>
				{:else}
					<li class="text-center py-6">No reviews yet.</li>
				{/each}
			</ul>
		</div>
	</div>
</WithBasketSummary>
