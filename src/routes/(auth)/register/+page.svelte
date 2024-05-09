<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { capitalize } from '$lib/utils/helpers';

	export let data: PageData;

	const { form, errors, submitting, enhance, reset } = superForm(data.registerForm, {
		clearOnSubmit: 'errors-and-message',
		multipleSubmits: 'prevent',
		onUpdated: ({ form }) => {
			const formMsg = form.message;
			if (formMsg && formMsg.type === 'success') {
				reset();
				addToast({
					title: capitalize(formMsg.type),
					description: formMsg.content
				});
			}
		}
	});
</script>

<svelte:head>
	<title>Register | RENZ Online Food Ordering</title>
</svelte:head>

<div class="col-span-2 col-start-2 grid gap-10 sm:col-span-4 sm:col-start-1 sm:mx-6">
	<h2 class="text-4xl font-semibold">Create an account</h2>
	<form class="space-y-2" method="POST" use:enhance>
		<div class="flex items-center gap-4">
			<Input
				class="w-full text-lg"
				name="firstName"
				label="First name"
				autocomplete="off"
				required
				error={$errors.firstName?.[0]}
				bind:value={$form.firstName}
			/>
			<Input
				class="w-full text-lg"
				name="lastName"
				label="Last name"
				autocomplete="off"
				required
				error={$errors.lastName?.[0]}
				bind:value={$form.lastName}
			/>
		</div>
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
		<Input
			class="text-lg"
			name="passwordConfirm"
			label="Confirm password"
			type="password"
			autocomplete="off"
			required
			error={$errors.passwordConfirm?.[0]}
			bind:value={$form.passwordConfirm}
		/>
		<Button class="mt-4 w-full justify-center" size="lg" type="submit" loading={$submitting}>
			Register
		</Button>
	</form>

	<p class="mt-2 text-center text-sm">
		Already have an account? <a class="font-medium underline" href="/login">Login</a>
	</p>
</div>
