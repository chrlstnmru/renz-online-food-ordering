<script lang="ts">
</script>

<main class="grid min-h-screen grid-cols-7">
	<section class="col-span-3 grid h-full place-items-center bg-secondary-950 p-24 md:hidden">
		<div class="flex flex-col gap-10">
			<div class="flex flex-col text-primary-500">
				<h1 class="text-7xl font-black">RENZ</h1>
				<p class="text-4xl">Online Ordering</p>
			</div>
			<p class="text-lg font-light italic text-white/50">
				“Where Flavor Meets Convenience! Sign in to satisfy your cravings with just a click. Enjoy a
				seamless ordering experience with us.”
			</p>
		</div>
	</section>
	<section class="col-span-4 grid grid-cols-4 place-items-center md:col-span-7">
		<slot />
	</section>
</main>
