<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import Button from './ui/Button.svelte';
	import Input from './ui/Input.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { onboardingFormSchema } from '$lib/server/validation';
	import { addToast } from './Toaster.svelte';
	import { capitalize } from '$lib/utils/helpers';
	import type { Session } from 'lucia';
	import type { InferSelectModel } from 'drizzle-orm';
	import type { usersTable } from '$lib/server/db/schema/UserSchema';
	import { goto } from '$app/navigation';

	export let onboardingForm: SuperValidated<typeof onboardingFormSchema>;
	export let session: Session | null;
	export let showSignOut: boolean = true;
	export let profile: InferSelectModel<typeof usersTable> | null = null;

	const { form, enhance, errors, submitting } = superForm(onboardingForm, {
		taintedMessage: false,
		multipleSubmits: 'prevent',
		onUpdated: ({ form }) => {
			const formMsg = form.message;
			let message = formMsg?.content;
			if (formMsg) {
				addToast(
					{
						title: capitalize(formMsg.type),
						description: message
					},
					formMsg.type
				);
			}
		}
	});
	$form.firstName = profile?.firstName ?? session?.user?.firstName;
	$form.middleName = profile?.middleName ?? session?.user?.middleName;
	$form.lastName = profile?.lastName ?? session?.user?.lastName;
	$form.email = profile?.email ?? session?.user?.email;
	$form.address = profile?.address ?? '';
	$form.phone = profile?.phone ?? '';
</script>

<div class="card flex max-w-xl flex-col p-6">
	{#if showSignOut}
		<h1 class="text-3xl font-bold">Onboarding</h1>
		<p>Fill in your information and get started.</p>
	{:else}
		<h2 class="text-3xl font-bold">Profile</h2>
	{/if}
	<form class="mt-12 grid" action="?" method="POST" use:enhance>
		<fieldset class="grid grid-cols-3 gap-2">
			<Input
				label="First name"
				name="firstName"
				bind:value={$form.firstName}
				error={$errors.firstName?.[0]}
				required
			/>
			<Input
				label="Middle name"
				name="middleName"
				bind:value={$form.middleName}
				error={$errors.middleName?.[0]}
			/>
			<Input
				label="Last name"
				name="lastName"
				bind:value={$form.lastName}
				error={$errors.lastName?.[0]}
				required
			/>
		</fieldset>
		<fieldset class="grid grid-cols-2 gap-2">
			<Input
				label="Email"
				name="email"
				type="email"
				bind:value={$form.email}
				error={$errors.email?.[0]}
				required
			/>
			<Input
				class="remove-arrow"
				label="Contact Number"
				name="phone"
				type="number"
				bind:value={$form.phone}
				error={$errors.phone?.[0]}
				required
			/>
		</fieldset>
		<Input
			label="Address"
			name="address"
			type="text"
			bind:value={$form.address}
			error={$errors.address?.[0]}
			required
		/>
		<div class="mt-6 grid {showSignOut ? 'grid-cols-2' : 'grid-cols-1'}">
			{#if showSignOut}
				<Button
					class=" justify-center"
					variant="ghost"
					color="neutral"
					loading={$submitting}
					on:click={() => goto('/logout')}
				>
					Sign out
				</Button>
			{/if}
			<Button class="justify-center " type="submit" loading={$submitting}>
				{showSignOut ? 'Submit' : 'Update'}
			</Button>
		</div>
	</form>
</div>
