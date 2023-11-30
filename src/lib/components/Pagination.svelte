<script context="module" lang="ts">
	export type PaginationEvent = CustomEvent<{ curr: number; next: number }>;
</script>

<script lang="ts">
	import { createPagination, melt } from '@melt-ui/svelte';
	import { createEventDispatcher } from 'svelte';
	import Button from './ui/Button.svelte';
	import Icon from '@iconify/svelte';

	export let total: number = 1;
	export let perPage: number = 1;
	export let defaultPage: number = 1;

	const dispatch = createEventDispatcher();

	const {
		elements: { root, prevButton, nextButton },
		options: { count },
		states: { page, range, totalPages }
	} = createPagination({
		count: total,
		perPage,
		defaultPage,
		onPageChange: ({ curr, next }) => {
			if (curr > Math.ceil(total / perPage)) {
				return next;
			}
			if (next !== curr) {
				dispatch('pageChange', { curr, next });
			}
			return next;
		}
	});

	$: if (total === 0) {
		total = 1;
		perPage = 1;
		$page = 1;
	}

	$: if (total !== $count) {
		$count = total;
		$page = defaultPage;
	}
</script>

<div class="flex items-center text-neutral-500">
	<span>Showing items {$range.start + 1} - {$range.end}</span>
	<nav class="ml-auto flex items-center gap-4" use:melt={$root}>
		<Button
			{...$prevButton}
			action={$prevButton.action}
			class="border border-neutral-200 bg-white p-0.5 text-inherit hover:text-primary-500"
			square
			rounded
		>
			<Icon icon="ic:round-chevron-left" width={20} />
		</Button>
		<span>Page {$page} of {$totalPages}</span>
		<Button
			{...$nextButton}
			action={$nextButton.action}
			class="border border-neutral-200 bg-white p-0.5 text-inherit hover:text-primary-500"
			square
			rounded
		>
			<Icon icon="ic:round-chevron-right" width={20} />
		</Button>
	</nav>
</div>
