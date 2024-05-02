<script lang="ts">
	import type { DialogStates } from '@melt-ui/svelte';
	import BasketSummary from './BasketSummary.svelte';

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
	<BasketSummary />
</div>
