<script>
	import '../../app.pcss';
	import Footer from '$lib/components/Footer.svelte';
	import Header from './_components/Header.svelte';

	const navlinks = [
		{ name: 'About', href: '#about-us' },
		{ name: 'Gallery', href: '#gallery' },
		{ name: 'Contact Us', href: '#contact-us' },
		{ name: 'Login', href: '/login' }
	];
</script>

<svelte:head>
	<title>RENZ Online Food Ordering</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-neutral-50">
	<Header navlinks={navlinks} />
	<main>
		<slot />
	</main>
	<Footer navlinks={navlinks} />
</div>
