<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from './ui/Button.svelte';
	import type { UserReview } from '$lib/server/types';
	import type { Session } from 'lucia';
	import { getContext } from 'svelte';

	export let data: UserReview;
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
					<div class="my-auto flex h-max w-max items-center gap-0.5 self-start text-sm">
						{#each Array(5) as _, i}
							<Icon
								class={i < data.rating ? 'text-amber-500' : 'text-neutral-300'}
								icon="bi:star-fill"
							/>
						{/each}
					</div>
				</div>
				{#if data.verified}
					<div title="Verified">
						<Icon class="text-2xl text-lime-500" icon="material-symbols-light:verified-rounded" />
					</div>
				{/if}
				<span class="text-sm opacity-80">{new Date(data.createdAt).toLocaleDateString()}</span>
			</div>
			{#if session && session.user.userId === data.user.id}
				<div class="hidden group-hover:block md:block">
					<Button
						class="py-0.5 sm:bg-red-500/10 sm:text-red-500"
						variant="ghost"
						color="danger"
						size="xs">Delete</Button
					>
				</div>
			{/if}
		</div>
		<p class="mt-0.5 text-left">
			{data.comment}
		</p>
	</div>
</article>
