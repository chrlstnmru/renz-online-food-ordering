<script lang="ts">
	// @ts-ignore
	import autosize from 'svelte-autosize';
	import UserComment from '$lib/components/UserComment.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import RateInput from './RateInput.svelte';
	import type { Session } from 'lucia';
	import { getContext } from 'svelte';
	import type { UserReview } from '$lib/server/types';
	import { superForm } from 'sveltekit-superforms/client';
	import type { deleteReviewFormSchema, reviewFormSchema } from '$lib/server/validation';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { capitalize, stringEmpty } from '$lib/utils/helpers';
	import type { Writable } from 'svelte/store';

	export let productId: string;
	export let reviewForm: SuperValidated<typeof reviewFormSchema>;
	export let deleteReviewForm: SuperValidated<typeof deleteReviewFormSchema>;

	const reviews = getContext<Writable<UserReview[]>>('userReviews');

	let session: Session | null = getContext('session');
	let ratingSelector: HTMLFieldSetElement;

	const { form, enhance, submitting, reset } = superForm(reviewForm, {
		multipleSubmits: 'prevent',
		invalidateAll: false,
		clearOnSubmit: 'errors-and-message',
		onSubmit: (req) => {
			if (session) {
				req.formData.append('userId', session.user.userId);
				req.formData.append('productId', productId);
			}
		},
		onUpdated: ({ form }) => {
			if (form.message) {
				let msgType = form.message.type;
				let msgBody = form.message.content;

				if (msgType === 'success') {
					reviews.set([msgBody as UserReview, ...$reviews]);
					msgBody = 'Review submitted successfully.';
					resetForm();
				}

				addToast(
					{
						title: capitalize(msgType),
						description: msgBody
					},
					form.message.type
				);
			}
		}
	});

	function resetForm() {
		reset();
		const options = ratingSelector.querySelectorAll<HTMLInputElement>(
			'input[type="radio"][name="rating"]'
		);
		options.forEach((input) => {
			if (input.id === '5') input.checked = true;
			else input.checked = false;
		});
	}

	$: inputInvalid = stringEmpty($form.comment);
</script>

{#if session}
	<div class="group flex w-full items-start gap-4 py-2">
		<div
			class="aspect-square h-full max-h-16 min-h-[2rem] w-full min-w-[2rem] max-w-[4rem] overflow-hidden rounded-full bg-slate-400 md:hidden"
		>
			<img class="object-cover" src={session.user.image} alt="profile" />
		</div>
		<div class="w-full">
			<form action="?/createReview" method="POST" use:enhance>
				<fieldset bind:this={ratingSelector} class="mb-3 grid grid-cols-5 gap-1 sm:grid-cols-3">
					<RateInput name="rating" label="5-Star" value={5} checked />
					<RateInput name="rating" label="4-Star" value={4} />
					<RateInput name="rating" label="3-Star" value={3} />
					<RateInput name="rating" label="2-Star" value={2} />
					<RateInput name="rating" label="1-Star" value={1} />
				</fieldset>
				<textarea
					class="max-h-32 w-full resize-none rounded"
					name="comment"
					placeholder="Write a review"
					bind:value={$form.comment}
					use:autosize
				/>
				<Button
					class="ml-full mt-1 px-4"
					color="neutral"
					type="submit"
					loading={$submitting}
					disabled={inputInvalid}
				>
					Submit
				</Button>
			</form>
		</div>
	</div>
{/if}
<div class="mt-2 grid w-full space-y-1">
	{#each $reviews as review}
		<UserComment data={review} deleteReviewForm={deleteReviewForm} />
	{/each}
</div>
