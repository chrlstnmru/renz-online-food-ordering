<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';
	import Input from '$lib/components/ui/Input.svelte';

	export let data: PageData;

	const { form, errors, submitting, enhance } = superForm(data.loginForm, {
		multipleSubmits: 'prevent'
	});

	let showEmailForm = false;

	function handleOAuth(source: 'google' | 'facebook') {
		if (browser) {
			const redirectTo = $page.url.searchParams.get('redirectTo');
			const url = `/api/oauth/?provider=${source}&redirectTo=${redirectTo}`;
			goto(url);
		}
	}
</script>

<svelte:head>
	<title>Login | RENZ Online Food Ordering</title>
</svelte:head>

<div class="col-span-2 col-start-2 grid gap-10 sm:col-span-4 sm:col-start-1 sm:mx-6">
	<div class="flex items-center gap-2">
		{#if showEmailForm}
			<Button
				class="aspect-square p-1"
				color="neutral"
				variant="ghost"
				size="xs"
				on:click={() => (showEmailForm = false)}
			>
				<Icon icon="icon-park-outline:left" width={34} />
			</Button>
		{/if}
		<h2 class="text-4xl font-semibold">Sign in</h2>
	</div>
	{#if !showEmailForm}
		<div class="grid w-96 gap-2 sm:w-auto">
			<Button
				class="border-neutral-300 px-5 py-3 uppercase"
				variant="outline"
				color="neutral"
				on:click={() => (showEmailForm = true)}
			>
				<Icon class="mr-3" icon="ic:baseline-email" width={34} />
				continue with email
			</Button>
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
	{:else}
		<div class="w-96 sm:w-auto">
			<form class="space-y-4" method="POST" use:enhance>
				<Input
					class="w-full text-lg"
					name="email"
					label="Email"
					autocomplete="off"
					type="email"
					required
					error={$errors.email?.[0]}
					bind:value={$form.email}
				/>
				<Input
					class="text-lg"
					name="password"
					label="Password"
					type="password"
					autocomplete="off"
					required
					error={$errors.password?.[0]}
					bind:value={$form.password}
				/>
				<Button
					class="mt-4 w-full justify-center"
					size="lg"
					type="submit"
					loading={$submitting}
					disabled={$submitting}
				>
					Log In
				</Button>
			</form>

			<p class="mt-2 text-center text-sm">
				Don't have an account? <a class="font-medium underline" href="/register">Register</a>
			</p>
			<p class="mt-1 text-center text-sm">
				<a class="font-medium underline" href="/forgotPassword">Forgot password?</a>
			</p>
		</div>
	{/if}
</div>
