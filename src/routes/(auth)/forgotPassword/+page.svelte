<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let data: PageData;

	const { form, errors, enhance, submitting } = superForm(data.forgotPasswordForm, {
		multipleSubmits: 'prevent',
		onUpdated: ({ form }) => {
			const formMsg = form.message;
			let message = formMsg?.content;
			if (formMsg && formMsg.type === 'success') {
				addToast({ title: formMsg.type, description: message, color: formMsg.type });
			}
		}
	});

	let updateSuccess = false;

	const {
		form: form2,
		errors: errors2,
		enhance: enhance2,
		submitting: submitting2
	} = superForm(data.resetPasswordForm, {
		multipleSubmits: 'prevent',
		onUpdated: ({ form }) => {
			const formMsg = form.message;
			if (formMsg && formMsg.type === 'success') {
				updateSuccess = true;
			}
		}
	});
</script>

<svelte:head>
	<title>Password Reset | RENZ Online Food Ordering</title>
</svelte:head>

<div class="col-span-2 col-start-2 grid gap-10 sm:col-span-4 sm:col-start-1 sm:mx-6">
	<h2 class="text-4xl font-semibold">Forgot Password</h2>
	{#if !data.valid}
		<form class="w-96 space-y-2 sm:w-auto" action="?/sendResetLink" method="POST" use:enhance>
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
			<Button
				class="mt-4 w-full justify-center"
				size="lg"
				type="submit"
				loading={$submitting}
				disabled={$submitting}>Send Reset Link</Button
			>
		</form>
	{:else if !updateSuccess}
		<form
			class="w-96 space-y-2 sm:w-auto"
			action="?/resetPassword&token={$page.url.searchParams.get('token')}"
			method="POST"
			use:enhance2
		>
			<Input
				class="w-full text-lg"
				name="newPassword"
				label="New password"
				type="password"
				required
				error={$errors2.newPassword?.[0]}
				bind:value={$form2.newPassword}
			/>
			<Input
				class="w-full text-lg"
				name="passwordConfirm"
				label="Confirm password"
				type="password"
				required
				error={$errors2.passwordConfirm?.[0]}
				bind:value={$form2.passwordConfirm}
			/>
			<Button
				class="mt-4 w-full justify-center"
				size="lg"
				type="submit"
				loading={$submitting2}
				disabled={$submitting2}>Reset Password</Button
			>
		</form>
	{:else}
		<p>Your password has been reset. You may now login.</p>
		<Button on:click={void goto('/login')}>Login</Button>
	{/if}
</div>
