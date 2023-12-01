<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from './ui/Button.svelte';
	import type { UserReview } from '$lib/server/types';
	import type { Session } from 'lucia';
	import { getContext } from 'svelte';
	import RatingIndicator from './RatingIndicator.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { deleteReviewFormSchema } from '$lib/server/validation';
	import { addToast } from './Toaster.svelte';
	import { capitalize } from '$lib/utils/helpers';

	export let data: UserReview;

	export let deleteReviewForm: SuperValidated<typeof deleteReviewFormSchema> | null = null;

	let deleteForm: ReturnType<typeof superForm<typeof deleteReviewFormSchema>> | null = null;
	if (deleteReviewForm) {
		deleteForm = superForm(deleteReviewForm, {
			onSubmit: ({ formData }) => {
				formData.append('reviewId', data.id);
			},
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
	}

	const session = getContext<Session>('session');
</script>

<article class="group flex w-full items-start gap-4 py-2">
	<div
		class="aspect-square h-full max-h-16 min-h-[2rem] w-full min-w-[2rem] max-w-[4rem] overflow-hidden rounded-full bg-slate-400 sm:hidden"
	>
		<img class="object-cover" src={data.user.image} alt="profile" />
	</div>
	<div class="w-full">
		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-1.5 sm:items-start">
				<div class="grid w-full max-w-[22rem] grid-cols-[auto_auto] gap-1.5 sm:grid-cols-1">
					<h3 class="truncate text-lg font-semibold">
						{data.user.name}
					</h3>
					<RatingIndicator rating={data.rating} />
				</div>
				{#if data.verified}
					<div title="Verified">
						<Icon class="text-2xl text-lime-500" icon="material-symbols-light:verified-rounded" />
					</div>
				{/if}
				<span class="text-sm opacity-80">{new Date(data.createdAt).toLocaleDateString()}</span>
			</div>
			{#if session && session.user.userId === data.user.id}
				<div class="invisible group-hover:visible md:visible">
					{#if deleteForm}
						<form action="?/deleteReview" method="POST" use:deleteForm.enhance>
							<Button
								class="py-0.5 sm:bg-red-500/10 sm:text-red-500"
								variant="ghost"
								color="danger"
								size="xs"
								type="submit"
							>
								Delete
							</Button>
						</form>
					{/if}
				</div>
			{/if}
		</div>
		<p class="mt-0.5 text-left">
			{data.comment}
		</p>
	</div>
</article>
