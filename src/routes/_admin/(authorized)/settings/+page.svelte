<script lang="ts">
	import Dialog from '$lib/components/Dialog.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { DialogStates } from '@melt-ui/svelte';
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { capitalize } from '$lib/utils/helpers';

	export let data: PageData;
	const {
		form: passwordForm,
		enhance: passwordEnhance,
		submitting: passwordSubmitting,
		errors: passwordErrors
	} = superForm(data.changePasswordForm, {
		multipleSubmits: 'prevent',
		onUpdated: async ({ form }) => {
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
				if (formMsg.type === 'success') {
					await Promise.resolve(setTimeout(() => dialogStates.open.set(false), 100));
				}
			}
		}
	});

	const {
		form: adminInfoForm,
		enhance: adminInfoEnhance,
		submitting: adminInfoSubmitting,
		errors: adminInfoErrors
	} = superForm(data.changeAdminInfoForm, {
		multipleSubmits: 'prevent',
		onUpdated: async ({ form }) => {
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
				await Promise.resolve(setTimeout(() => dialogStates.open.set(false), 100));
			}
		}
	});
	$adminInfoForm.email = data.session?.user.email;
	$adminInfoForm.username = data.session?.user.username;

	let dialogStates: DialogStates;
	let confirmDialogStates: DialogStates;
</script>

<Dialog bind:states={dialogStates} keepOpen={$passwordSubmitting}>
	<svelte:fragment slot="title">Change password</svelte:fragment>
	<form class="mt-3" action="?/changePassword" method="post" use:passwordEnhance>
		<div class="flex flex-col gap-0.5">
			<Input
				label="Old password"
				name="oldPassword"
				type="password"
				bind:value={$passwordForm.oldPassword}
				error={$passwordErrors.oldPassword?.[0]}
			/>
			<Input
				label="New password"
				name="newPassword"
				type="password"
				bind:value={$passwordForm.newPassword}
				error={$passwordErrors.newPassword?.[0]}
			/>
			<Input
				label="Confirm password"
				name="passwordConfirm"
				type="password"
				bind:value={$passwordForm.passwordConfirm}
				error={$passwordErrors.passwordConfirm?.[0]}
			/>
		</div>
		<div class="mt-1 grid grid-cols-2 gap-2">
			<Button
				class="justify-center"
				variant="ghost"
				color="neutral"
				on:click={() => dialogStates.open.set(false)}
				disabled={$passwordSubmitting}
			>
				Cancel
			</Button>
			<Button class="justify-center" type="submit" loading={$passwordSubmitting}>Submit</Button>
		</div>
	</form>
</Dialog>

<Dialog bind:states={confirmDialogStates} keepOpen={$adminInfoSubmitting}>
	<svelte:fragment slot="title">Confirm changes</svelte:fragment>
	<svelte:fragment slot="desc">Enter your password to confirm changes.</svelte:fragment>
	<form class="mt-3" action="?/updateAdminInfo" use:adminInfoEnhance>
		<Input label="Password" type="password" bind:value={$adminInfoForm.password} required />
		<div class="grid grid-cols-2">
			<Button
				class="justify-center"
				variant="ghost"
				color="neutral"
				on:click={() => confirmDialogStates.open.set(false)}
			>
				Cancel
			</Button>
			<Button class="justify-center" type="submit">Confirm</Button>
		</div>
	</form>
</Dialog>

<div class="grid flex-1 place-items-center">
	<div class="card">
		<h3 class="text-xl font-semibold">Admin Information</h3>
		<div class="mt-3">
			<Input label="Username" bind:value={$adminInfoForm.username} required />
			<Input label="Email" bind:value={$adminInfoForm.email} type="email" required />
			<div class="flex items-center gap-2">
				<Input label="Password" value="**************" readonly />
				<Button color="neutral" on:click={() => dialogStates.open.set(true)}>Change</Button>
			</div>
			<Button class="w-full justify-center" on:click={() => confirmDialogStates.open.set(true)}>
				Save
			</Button>
		</div>
	</div>
</div>
