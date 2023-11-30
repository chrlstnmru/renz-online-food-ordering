<script lang="ts">
	import Toaster, { addToast } from '$lib/components/Toaster.svelte';
</script>

<svelte:head>
	<title>RENZ Admin Panel</title>
</svelte:head>

<Toaster />
<slot />
