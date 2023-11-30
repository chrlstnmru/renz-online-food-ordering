<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import * as flashModule from 'sveltekit-flash-message/client';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { page } from '$app/stores';

	export let data: PageData;
	const loginForm = data.loginForm;

	const { form, errors, enhance } = superForm(loginForm, {
		clearOnSubmit: 'errors-and-message',
		multipleSubmits: 'prevent',
		flashMessage: {
			module: flashModule,
			onError: ({ result, message }) => {
				const errorMessage = result.error.message;
				message.set({ type: 'error', content: errorMessage });
			}
		},
		syncFlashMessage: true
	});

	const flash = flashModule.getFlash(page);

	$: if ($flash) {
		addToast({
			title: $flash.type,
			description: $flash.content
		});
	}
</script>

<main class="container grid min-h-screen place-items-center">
	<div class="flex flex-col gap-12">
		<div class="mx-auto">
			<h1 class="select-none text-5xl font-black text-primary-500">
				RENZ
				<div class="text-xl font-normal leading-3">Admin Panel</div>
			</h1>
		</div>
		<form class="w-[340px] sm:w-full" action="?" method="POST" use:enhance>
			<Input
				class="w-full text-lg"
				name="username"
				label="Username"
				autocomplete="off"
				required
				error={$errors.username?.[0]}
				bind:value={$form.username}
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
			<Button class="mt-4 w-full justify-center" size="lg" type="submit">Log In</Button>
		</form>
	</div>
</main>
