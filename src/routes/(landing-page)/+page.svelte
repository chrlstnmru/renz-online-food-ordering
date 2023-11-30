<script lang="ts">
	import AboutSection from './_components/AboutSection.svelte';
	import GallerySection from './_components/GallerySection.svelte';
	import HeroSection from './_components/HeroSection.svelte';
</script>

<HeroSection />
<AboutSection />
<GallerySection />

<style lang="postcss">
	:global(h2[data-content-section]::before) {
		content: '- ' attr(data-content-section) ' -\a';
		@apply whitespace-pre text-base font-normal uppercase text-primary-500;
	}
</style>
