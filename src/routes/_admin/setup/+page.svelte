<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';

	export let data: PageData;
	const setupForm = data.setupForm;

	const { form, errors, enhance, submitting } = superForm(setupForm, {
		clearOnSubmit: 'errors-and-message',
		multipleSubmits: 'prevent'
	});
</script>

<svelte:head>
	<title>RENZ Admin Panel</title>
</svelte:head>

<main class="container grid min-h-screen place-items-center">
	<div class="flex flex-col gap-8">
		<div class="mx-auto">
			<h1 class="mx-auto w-max select-none text-5xl font-black text-primary-500">
				RENZ
				<div class="text-xl font-normal leading-3">Admin Panel</div>
			</h1>
			<p class="mt-4 text-2xl font-medium">First-time Setup</p>
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
				class="w-full text-lg"
				name="email"
				label="Email"
				type="email"
				autocomplete="off"
				required
				error={$errors.email?.[0]}
				bind:value={$form.email}
			/>
			<Input
				class="w-full text-lg"
				name="password"
				label="Password"
				type="password"
				autocomplete="off"
				required
				error={$errors.password?.[0]}
				bind:value={$form.password}
			/>
			<Input
				class="text-lg"
				name="passwordConfirm"
				label="Confirm Password"
				type="password"
				autocomplete="off"
				required
				error={$errors.passwordConfirm?.[0]}
				bind:value={$form.passwordConfirm}
			/>
			<Button class="mt-4 w-full justify-center" size="lg" type="submit" loading={$submitting}>
				Submit
			</Button>
		</form>
	</div>
</main>
