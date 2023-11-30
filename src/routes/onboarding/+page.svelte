<script lang="ts">
	import type { PageData } from './$types';
	import UserProfile from '$lib/components/UserProfile.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>RENZ Online Food Ordering | Onboarding</title>
</svelte:head>

<main class="grid min-h-screen place-items-center">
	<UserProfile onboardingForm={data.onboardingForm} session={data.session} />
</main>
