<script lang="ts">
	import type { PageData } from './$types';
	import AboutSection from './_components/AboutSection.svelte';
	import GallerySection from './_components/GallerySection.svelte';
	import HeroSection from './_components/HeroSection.svelte';

	export let data: PageData;
</script>

<HeroSection />
<AboutSection />
<GallerySection data={data.bestSellers} />

<style lang="postcss">
	:global(h2[data-content-section]::before) {
		content: '- ' attr(data-content-section) ' -\a';
		@apply whitespace-pre text-base font-normal uppercase text-primary-500;
	}
</style>
