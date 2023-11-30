<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<section class="w-full max-w-[420px]">
	<h3 class="text-xl text-secondary-500">Top Sellers</h3>
	<div class="card mt-2">
		<ol class="mx-2 my-3 space-y-5">
			{#each { length: 5 } as _}
				<li class="flex items-center">
					<div class="flex w-full items-center justify-between">
						<span class="max-w-[25ch] truncate text-lg">
							<a class="group" href="#">
								Pancit Malabon
								<Icon
									class="hidden text-base text-neutral-400 group-hover:inline group-hover:text-primary-500"
									icon="entypo:link"
								/>
							</a>
						</span>
						<span class="flex-shrink-0 text-sm">300 sold</span>
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
		@apply mr-2 font-medium;
	}
</style>
