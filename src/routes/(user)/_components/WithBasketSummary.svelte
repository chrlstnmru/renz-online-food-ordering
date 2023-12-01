<script lang="ts">
	import type { Session } from 'lucia';
	import { getContext } from 'svelte';
	import BasketSummary from './BasketSummary.svelte';
	import type { DialogStates } from '@melt-ui/svelte';

	const session = getContext<Session>('session');

	export let openCheckout: boolean = false;
	let checkoutDialogStates: DialogStates;
	$: open = checkoutDialogStates?.open;

	$: if (checkoutDialogStates) {
		checkoutDialogStates.open.set(openCheckout);
	}
	$: if (!$open) {
		openCheckout = false;
	}
</script>

<div class="relative flex flex-1 gap-3">
	<slot />
	{#if session}
		<BasketSummary bind:checkoutDialogStates={checkoutDialogStates} />
	{/if}
</div>
