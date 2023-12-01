<script lang="ts">
	import Button from './ui/Button.svelte';

	let imageList: HTMLElement;
	let scrollPos = 0;
	let maxScrollPos = 0;

	function previous() {
		scrollImageList(-1);
	}

	function next() {
		scrollImageList(1);
	}

	function scrollImageList(dir: number) {
		const scrollAmount = (imageList.clientWidth - imageList.clientWidth * 0.5) * dir;
		imageList.scrollBy({ left: scrollAmount, behavior: 'smooth' });
	}

	function onScroll(event: UIEvent) {
		const elem = event.target as HTMLElement;
		scrollPos = elem.scrollLeft;
		maxScrollPos = imageList.scrollWidth - imageList.clientWidth;
	}

	$: if (imageList) {
		maxScrollPos = imageList.scrollWidth - imageList.clientWidth;
	}
</script>

<div class="group relative mx-8">
	<Button
		class="absolute left-0 top-1/2 w-12 -translate-x-1/2 -translate-y-1/2 justify-center border-transparent bg-white p-2 text-neutral-800 shadow-md hover:opacity-100 sm:hidden"
		aria-label="Previous"
		square
		rounded
		hidden={scrollPos === 0}
		on:click={previous}
	>
		<slot name="prev-btn-icon">&lt;</slot>
	</Button>
	<div
		bind:this={imageList}
		id="image-scroller"
		class="custom-scrollbar grid w-full overflow-x-auto"
		aria-labelledby="gallery-heading"
		aria-live="polite"
		role="region"
		on:scroll={onScroll}
	>
		<div class="mb-4 grid w-max grid-flow-col gap-4">
			<slot />
		</div>
	</div>
	<Button
		class="absolute right-0 top-1/2 w-12 -translate-y-1/2 translate-x-1/2 justify-center border-transparent bg-white p-2 text-neutral-800 shadow-md hover:opacity-100 sm:hidden"
		aria-label="Previous"
		square
		rounded
		hidden={scrollPos >= maxScrollPos}
		on:click={next}
	>
		<slot name="next-btn-icon">&gt;</slot>
	</Button>
</div>
