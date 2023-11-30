<script lang="ts">
	import type { Session } from 'lucia';
	import { getContext } from 'svelte';
	import BasketSummary from './BasketSummary.svelte';

	const session = getContext<Session>('session');
</script>

<div class="relative flex gap-3">
	<slot />
	{#if session}
		<BasketSummary />
	{/if}
</div>
