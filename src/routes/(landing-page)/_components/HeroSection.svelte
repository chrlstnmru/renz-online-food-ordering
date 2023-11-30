<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
</script>

<section id="hero" class="bg-secondary-950 sm:py-8">
	<div
		class="container flex min-h-[calc(100vh-160px)] items-center justify-between lg:min-h-[50vh] lg:justify-center"
	>
		<div class="max-w-[60ch]">
			<h2 class="text-6xl font-bold text-primary-500">Where Tradition Meets Taste!</h2>
			<p class="text-2xl text-white">Discover the authentic flavor of Pancit Malabon.</p>

			<Button
				class="mt-6 bg-white px-5 text-neutral-800 hover:border-transparent hover:text-primary-500"
				rounded
			>
				<a class="text-lg" href="/home"> Order now </a>
			</Button>
		</div>
		<div
			class="stack aspect-square w-[600px] min-w-[500px] select-none place-items-center lg:hidden"
		>
			<svg
				class="h-full w-full object-cover"
				viewBox="0 0 628 699"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M543.032 6.12504C562.301 -6.8167 588.337 6.08829 589.706 29.2595L627.346 666.198C628.705 689.193 604.714 705.077 584.075 694.847L16.7644 413.656C-3.8747 403.426 -5.76182 374.716 13.3607 361.872L543.032 6.12504Z"
					fill="#E38E16"
				></path>
			</svg>
			<div class="grid aspect-square min-w-[400px] max-w-[500px] place-items-center">
				<img class="ml-12" src="/images/image-0.png" alt="hero" draggable="false" />
			</div>
		</div>
	</div>
</section>
