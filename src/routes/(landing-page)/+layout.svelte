<script>
	import '../../app.pcss';
	import Footer from '$lib/components/Footer.svelte';
	import Header from './_components/Header.svelte';
	import { dev } from '$app/environment';
	import { page } from '$app/stores';

	const navlinks = [
		{ name: 'About', href: '#about-us' },
		{ name: 'Gallery', href: '#gallery' },
		{ name: 'Contact Us', href: '#contact-us' },
		{ name: 'Login', href: '/login' }
	];
</script>

<svelte:head>
	<title>RENZ Online Food Ordering</title>

	<meta
		name="description"
		content="At Renz Pancit Malabon, we take pride in bringing the rich flavors of Filipino cuisine to your
	plate, with a particular focus on the beloved classic, Pancit Malabon. We are more than just
	a restaurant; we are a culinary journey through tradition and taste."
	/>
	<meta
		name="keywords"
		content={`RENZ Online Food Ordering, Pancit Malabon, RENZ Pancit Malabon`}
	/>

	<meta property="og:title" content="RENZ Online Food Ordering" />
	<meta
		property="og:description"
		content="At Renz Pancit Malabon, we take pride in bringing the rich flavors of Filipino cuisine to your
	plate, with a particular focus on the beloved classic, Pancit Malabon. We are more than just
	a restaurant; we are a culinary journey through tradition and taste."
	/>
	<meta
		property="og:image"
		content="{dev ? 'http://' : 'https://'}{$page.url.host}/images/image-1.png"
	/>
	<meta property="og:url" content="{dev ? 'http://' : 'https://'}{$page.url.host}" />
</svelte:head>

<div class="flex min-h-screen flex-col bg-neutral-50">
	<Header navlinks={navlinks} />
	<main>
		<slot />
	</main>
	<Footer navlinks={navlinks} />
</div>
