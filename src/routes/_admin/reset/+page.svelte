<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { capitalize } from '$lib/utils/helpers';

	export let data: PageData;

	const { form, errors, submitting, enhance } = superForm(data.requestForm, {
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
</script>

<main class="grid min-h-screen place-items-center">
	<div class="w-[360px]">
		<h1 class="text-xl font-semibold">Reset Admin Password</h1>
		<form class="my-4 space-y-4" action="?" method="post" use:enhance>
			<Input
				label="Email"
				name="email"
				type="email"
				bind:value={$form.email}
				error={$errors.email?.[0]}
			/>
			<Button class="w-full justify-center" type="submit" loading={$submitting}>Submit</Button>
		</form>
	</div>
</main>
