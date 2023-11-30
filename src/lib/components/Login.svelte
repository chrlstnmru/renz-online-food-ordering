<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import Button from './ui/Button.svelte';

	function handleOAuth(source: 'google' | 'facebook') {
		if (browser) {
			const redirectTo = $page.url.searchParams.get('redirectTo');
			const url = `/api/oauth/?provider=${source}&redirectTo=${redirectTo}`;
			goto(url);
		}
	}
</script>

<div class="grid gap-2 text-sm">
	<Button
		class="border-neutral-300 py-2.5 uppercase"
		variant="outline"
		color="neutral"
		on:click={() => handleOAuth('google')}
	>
		<Icon class="mr-3 text-3xl" icon="flat-color-icons:google" />
		continue with google
	</Button>
	<Button
		class="border-neutral-300 py-2.5 uppercase"
		variant="outline"
		color="neutral"
		on:click={() => handleOAuth('facebook')}
	>
		<Icon class="mr-3 text-3xl" icon="logos:facebook" />
		continue with facebook
	</Button>
</div>
