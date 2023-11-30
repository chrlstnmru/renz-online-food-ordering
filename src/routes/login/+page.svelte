<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '@iconify/svelte';

	function handleOAuth(source: 'google' | 'facebook') {
		if (browser) {
			const redirectTo = $page.url.searchParams.get('redirectTo');
			const url = `/api/oauth/?provider=${source}&redirectTo=${redirectTo}`;
			goto(url);
		}
	}
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
		<div class="col-span-2 col-start-2 grid gap-10 sm:col-span-4 sm:col-start-1 sm:mx-6">
			<h2 class="text-4xl font-semibold">Sign in</h2>
			<div class="grid gap-2">
				<Button
					class="border-neutral-300 px-5 py-3 uppercase"
					variant="outline"
					color="neutral"
					on:click={() => handleOAuth('google')}
				>
					<Icon class="mr-3" icon="flat-color-icons:google" width={34} />
					continue with google
				</Button>
				<Button
					class="border-neutral-300 px-5 py-3 uppercase"
					variant="outline"
					color="neutral"
					on:click={() => handleOAuth('facebook')}
				>
					<Icon class="mr-3" icon="logos:facebook" width={34} />
					continue with facebook
				</Button>
			</div>
		</div>
	</section>
</main>
